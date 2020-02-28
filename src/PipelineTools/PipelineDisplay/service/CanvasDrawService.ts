import {autorun, computed, IReactionDisposer, runInAction} from 'mobx';
import cytoscape from 'cytoscape';
import {
    CYTO_MAX_ZOOM,
    CYTO_MIN_ZOOM,
    debug,
    DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG,
    filterCommonId,
    FunctionVariadic,
    getLayoutSpecificConfigs,
    getTranslation, isDebugMode,
    nextEventLoop,
    showError,
    sideEffect,
    untilNextLoop,
} from '../../../utils';
import {LoadingTargets} from '../../../stores/LoadableStoreImpl';
import {ColorManager} from '../color/ColorManager';
import {CanvasEventService} from './CanvasEventService';
import {ElementService} from './ElementService';
import {HistoryService} from './HistoryService';
import {CommunityService} from './CommunityService';
import {AlgorithmService} from './AlgorithmService';
import _debounce from 'lodash/debounce';
import {StatisticsService} from './StatisticsService';
import {SelectionService} from './SelectionService';
import konva from 'konva';
import jquery from 'jquery';
import {HelperService} from './HelperService';
import {DisplayModeCanvasStore} from '../stores/DisplayModeCanvasStore';
import {AddMixtureType, CyState} from '../model/CyState';
import {DataDrivenProcessor} from '../data_driven_processor/DataDrivenProcessor';
import {CyElement, CyType} from '../model/CyElement';
import {NewSerializationService} from './NewSerializationService';
import {VisibilityService} from './VisibilityService';
import resizeStyle from './resizeStyle';
import {CyElementDefaultClass, OnSimpleFindPathFunc, PERFORMANCE_THRESHOLD, SELECTION_DEBOUNCE} from '../interfaces';
import {MiniMapService} from './MiniMapService';
import {StatusService} from './StatusService';
import {TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';
import {TimeFilterService} from './TimeFilterService';
import {StateService} from './StateService';
import {AddFindPathEntryService} from './AddFindPathEntryService';
import {AddNeighborService} from './AddNeighborService';
import {AddNormalElementsService} from './AddNormalElementsService';
import {layoutElements} from '../../PipelineEditor/cyto/cyto-utils';
import {Community} from '../model/Community';
import {StatsAnalysisStore} from '../../../components/bi/StatsAnalysis/StatsAnalysisStore';
import {
    isAddFindPathEntry,
    isAddNeighbor,
    isAddNormal,
    isDescriptionNodeAdded,
    isTextNodeAdded,
} from '../CanvasDrawUtils';

const nodeResize = require('./cyto-resize');

export enum PathAlgos {
    'BFS' = 'BFS',
    'DFS' = 'DFS',
    'DIJKSTRA' = 'DIJKSTRA',
    'ASTAR' = 'ASTAR',
}

let renderTimeStart: number;
let renderTimeEnd: number;

nodeResize(cytoscape, jquery, konva);
export type EChartType = 'bar' | 'stack' | 'line';

export interface CanvasDrawServiceCallbacks {
    afterRendering?: ((store: DisplayModeCanvasStore, isFirstTime: boolean) => void);
}

// cytoscape是imperative programming,不符合React的声明式风格，所以借由service来表达所有操作
export class CanvasDrawService {
    public cy: any | null;
    public nodeResizeDestroy: FunctionVariadic | null;
    public cyState: CyState;
    public onFindPath: OnSimpleFindPathFunc | undefined;

    // 便捷方法
    public helperService: HelperService;
    // 所有事件处理交由这个对象管理
    public eventService: CanvasEventService;
    // 序列化，反序列化
    public serializationService: NewSerializationService;
    // 节点，边的增删改
    public elementService: ElementService;
    // 前进后退
    public historyService: HistoryService;
    // 对类型进行分桶
    public communityService: CommunityService;
    // 算法服务，目前有pageRank，各类路径算法
    public algoService: AlgorithmService;
    // 统计信息服务
    public statsService: StatisticsService;
    // 选中元素相关
    public selectionService: SelectionService;
    // minimap related
    public miniMapService: MiniMapService;
    // 数据驱动
    public dataDriverProcessor: DataDrivenProcessor;
    // 当前选中状态的服务
    public statusService: StatusService;
    // 时间序列
    public timeFilterService: TimeFilterService;

    // 用于控制社群，节点或者边的是否可见
    public visibilityService: VisibilityService;
    // 所有全局的状态机
    public stateService: StateService;
    public statsAnalysisStore: StatsAnalysisStore;

    // 控制整个重绘的autorun的disposer
    autorunDisposer: IReactionDisposer;

    public constructor(public canvasStore: DisplayModeCanvasStore,
                       public selectionType: 'additive' | 'single',
                       public enableCtxMenu: boolean,
                       public simpleMode: boolean,
                       public colorManager: ColorManager, cyStateStr: string,
                       public callbacks: CanvasDrawServiceCallbacks,
                       public containerId: string,
    ) {
        this.eventService = new CanvasEventService(this);
        this.serializationService = new NewSerializationService(this);
        this.elementService = new ElementService(this);
        this.historyService = new HistoryService(this);
        this.communityService = new CommunityService(this);
        this.algoService = new AlgorithmService(this);
        this.statsService = new StatisticsService(this);
        this.selectionService = new SelectionService(this);
        this.helperService = new HelperService(this);
        this.miniMapService = new MiniMapService(this);
        this.dataDriverProcessor = new DataDrivenProcessor(this);
        this.visibilityService = new VisibilityService(this);
        this.statusService = new StatusService(this);
        this.timeFilterService = new TimeFilterService(this);
        this.stateService = new StateService(this);
        this.statsAnalysisStore = new StatsAnalysisStore();
        this.cyState = this.serializationService.deserialize(cyStateStr, this.canvasStore.displayModePipelineSchema);
        this.startMonitoring();
    }

    private async startMonitoring() {
        // await waitForDomElement(this.containerId);
        this.autorunDisposer = autorun(() => {
            this.newRedraw();
        });
    }

    @computed
    get pipeline() {
        return this.canvasStore.pipeline;
    }

    setCytoInstance(val: any | null) {
        this.cy = val;
    }

    destroyOldCy() {
        if (this.cy) {
            this.cy.destroy();
            this.cy = null;
            debug('previous cy is destroyed');
        }
        if (this.nodeResizeDestroy) {
            this.nodeResizeDestroy();
        }
        this.miniMapService.setMiniMapVisible(false);
        this.miniMapService.dispose();
    }

    // viewPort事件的注册放在cytoFinish里
    private registerEvents() {
        const cy = this.cy;
        // 目前只响应路径发现终点的选择和社群被点击
        cy.on('tap', 'node', this.eventService.nodeClicked);
        cy.on('tap', 'edge', () => {
            this.stateService.closeAllContextMenu();
        });
        // cy.on("mousemove", (e: any) => {
        //     console.log(JSON.stringify(e.position, null, 2));
        // });

        // 当节点被选中时，可以是点击，也可以是框选，如果是框选，比如时候选了10个节点，那么回调函数会返回10次，所以这里加入了debounce
        // cytoscape文档中虽然说支持批量selection和unselection事件，实际上没有实现，github上问了作者还被怼了，如果以后实现了此处逻辑需要被简化。。。
        cy.on('select', `node.${CyElementDefaultClass.NORMAL_NODE},node.${CyElementDefaultClass.COLLAPSED_COMMUNITY}`, _debounce(this.eventService.nodeSelected, SELECTION_DEBOUNCE));
        cy.on('select', 'edge', _debounce(this.eventService.edgeSelected, SELECTION_DEBOUNCE));
        cy.on('select', `edge.${CyElementDefaultClass.FIND_PATH_BEACON}`, _debounce(this.eventService.findPathBeaconSelected, SELECTION_DEBOUNCE));
        cy.on('select', 'node.description-container', _debounce(this.eventService.descriptionNodeSelected, SELECTION_DEBOUNCE));
        cy.on('select', 'node.description-text', _debounce(this.eventService.textNodeSelected));

        cy.on('unselect', `node.${CyElementDefaultClass.NORMAL_NODE},node.${CyElementDefaultClass.COLLAPSED_COMMUNITY}`, _debounce(this.eventService.nodeUnselected, SELECTION_DEBOUNCE));
        cy.on('unselect', 'edge', _debounce(this.eventService.edgeUnselected, SELECTION_DEBOUNCE));
        cy.on('unselect', `edge.${CyElementDefaultClass.FIND_PATH_BEACON}`, _debounce(this.eventService.findPathBeaconUnSelected, SELECTION_DEBOUNCE));
        cy.on('unselect', 'node.description-container', _debounce(this.eventService.descriptionNodeUnselected, SELECTION_DEBOUNCE));
        cy.on('unselect', 'node.description-text', _debounce(this.eventService.textNodeUnselected, SELECTION_DEBOUNCE));

        cy.on('cxttap', this.eventService.backgroundRightClicked);
        cy.on('tap', this.eventService.backgroundClicked);
        cy.on('zoom', this.eventService.onZoom);
        cy.on('mousemove', this.eventService.mouseMove);
        cy.on('drag', _debounce(this.eventService.elementPositionChanged, 100));
        cy.on('noderesize.resizeend', this.eventService.onEleResized);
        cy.on('pan', this.eventService.onPanning);
    }

    // 为了防止新元素出现时的闪屏，新元素和新边在加入时被设置成了hidden，因此页面画面后要清除这个状态
    removeHiddenClass() {
        const hiddenElement = this.cy.elements('.' + TEMP_HIDDEN_CLASS);
        hiddenElement.removeClass(TEMP_HIDDEN_CLASS).remove().restore();
    }

    private afterRedraw() {
        this.removeHiddenClass();
        this.cyState.clearNewElementStats();

        if (!this.cyState.noHistory && !this.timeFilterService.showTimeFilter) {
            this.historyService.push();
        }
        this.nodeResizeDestroy = (this.cy as any).nodeResize(resizeStyle).destroyMe;
        this.miniMapService.updateMiniMap();

        if (this.cyState.addElementConfig && this.cyState.addElementConfig.type === AddMixtureType.DESCRIPTION) {
            this.elementService.togglePZ(false);
        } else {
            this.elementService.togglePZ(true);
        }

        if (this.cyState.addElementConfig && this.cyState.addElementConfig.type === AddMixtureType.TEXT) {
            this.elementService.setTextNodeAsContext(this.cy.nodes(':selected'));
        }

        if (this.cyState.nextActionTrigger) {
            this.cyState.nextActionTrigger();
            this.cyState.nextActionTrigger = null;
        }
        this.cyState.resetOneTimeStatus();
        if (this.callbacks.afterRendering) {
            this.callbacks.afterRendering(this.canvasStore, this.pipeline!.firstTimeRender);
        }
        this.pipeline!.firstTimeRender = false;
    }

    private cytoOnFinish = () => {
        setTimeout(() => { // preset布局同步完成，如果不用setTimeout，那么this.cy可能都还没有设置上
            this.afterRedraw();
            this.stateService.setCanvasRatio(this.cy!.zoom());
            console.log('cytoscape instance is drawn');
            this.cy.on('viewport', _debounce(this.eventService.onViewPort, 500));
            this.canvasStore.finishLoading(LoadingTargets.CANVAS_LAYOUT);
            renderTimeEnd = performance.now();
            console.log('total rendering time: ' + (renderTimeEnd - renderTimeStart));
        });
    }

    public async newRedraw() {
        sideEffect(this.cyState.runTimes);
        renderTimeStart = performance.now();
        // 接下来三条语句一定要放在最开始的地方，不然下面noRedraw退出后会使得所有内部的computed被垃圾回收，导致不reactive
        const computedState = this.dataDriverProcessor.nextState;
        const elements = computedState.elements.map((ele: CyElement) => ele.cytoFormat());
        // 不setTimeout， cy属性还没有被赋值上

        if (this.cyState.noRedraw) {
            this.cyState.resetOneTimeStatus();
            return;
        }

        runInAction(() => {
            this.stateService.closeAllContextMenu();
            // this.stateService.setShowSearchBox(false);

            if (!this.cyState.noLoadingEffect) {
                this.canvasStore.addLoadingTarget(LoadingTargets.CANVAS_LAYOUT);
            }
        });

        // 让loading效果先起来，只有让接下来的逻辑进入下一个event loop
        await untilNextLoop();
        const layout = this.cyState.nextTimeLayout;

        if (!this.cy // 第一次加载
            || layout !== 'preset'  // 改变layout时
            || this.cy.destroyed() // 从其他tab切换过来
        ) {
            const cytoConfig: any = {
                ...computedState,
                container: document.getElementById(this.containerId),
                elements,
                layout: getLayoutSpecificConfigs(layout, computedState.nodeCount, {stop: this.cytoOnFinish}),
                zoom: this.cyState.zoom,
                pan: this.cyState.pan,
                wheelSensitivity: .3,
                minZoom: CYTO_MIN_ZOOM,
                maxZoom: CYTO_MAX_ZOOM,
                selectionType: this.selectionType,
            };

            debug(JSON.stringify(cytoConfig.layout, null, 2));

            let cy;
            try {
                cy = cytoscape(cytoConfig);
            } catch (e) {
                console.error(e);
                showError(getTranslation(this.canvasStore.locale, 'Failed to layout'));
                this.canvasStore!.finishLoading(LoadingTargets.CANVAS_LAYOUT);
                return;
            }
            this.destroyOldCy();
            this.setCytoInstance(cy);
            if (isDebugMode()) {
                (window as any).c = cy;
                (window as any).cs = this.cyState;
            }
            this.registerEvents();
        } else {
            this.cy.off('viewport');
            this.cy.off('pan');
            this.cy.batch(() => {
                this.cy.elements().remove();
                this.cy.add(elements);
                this.cy.zoom(this.cyState.zoom);
                this.cy.pan(this.cyState.pan);
            });
            console.log('元素更新花费时间: ' + (performance.now() - renderTimeStart));

            await untilNextLoop();
            const layoutStart = performance.now();
            await this.layoutExpandedCommunities();
            await this.layoutNewElements();
            this.centerSelectedElements();

            console.log('新元素layout花费时间: ' + (performance.now() - layoutStart));

            // Logic only for time filter
            const highlightStart = performance.now();
            this.highlightTimerFilterEligibleElements();
            console.log('高亮timeFilter节点花费时间: ' + (performance.now() - highlightStart));
            this.cy._private.renderer.hideEdgesOnViewport = elements.length > PERFORMANCE_THRESHOLD;
            renderTimeEnd = performance.now();
            console.log('total rendering time: ' + (renderTimeEnd - renderTimeStart));
            this.cy.on('viewport', _debounce(this.eventService.onViewPort, 500));
            this.cy.on('pan', this.eventService.onPanning);
            this.canvasStore!.finishLoading(LoadingTargets.CANVAS_LAYOUT);
            this.afterRedraw();
        }
    }

    private async layoutExpandedCommunities() {
        const cs = this.cyState;
        if (cs.communitiesToBeExpanded.size > 0) {
            for (const currentLayer of cs.layeredCommunities) {
                await this.layoutCurrentLayer(currentLayer);
            }
        }
    }

    private layoutCurrentLayer(communities: Community[]) {
        const cs = this.cyState;
        const promises: Array<Promise<void>> = communities.map((c: Community) => {
            if (!cs.communitiesToBeExpanded.has(c.id)) {
                return Promise.resolve();
            } else {

                const communityNode = this.cy.filter(filterCommonId(c.id));
                // 如果该社群还未删除，但没有任何元素时，图上是找不到的，这种情况也要退出
                if (communityNode.length === 0) {
                    return Promise.resolve();
                }
                // 要读取内存中的位置，而不是图里的位置，因为社群展开会位置会发生变化
                const oldPosition = {...c.position!} || {...communityNode.position()};
                const children = communityNode.children();
                return new Promise(resolve => {
                    children.layout({
                        ...DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG,
                        spacingFactor: .9,
                        stop: () => {
                            const currentPosition = communityNode.position();
                            const diff = {x: currentPosition.x - oldPosition.x, y: currentPosition.y - oldPosition.y};
                            this.cy.batch(() => {
                                children.each((c: any) => {
                                    const p = c.position();
                                    c.position({x: p.x - diff.x, y: p.y - diff.y});
                                });
                            });
                            resolve();
                        },
                    }).run();
                });
            }
        });
        return Promise.all(promises);
    }

    // for poc, temporary support
    private highlightTimerFilterEligibleElements() {
        if (this.timeFilterService.showTimeFilter && this.cyState.highlightTimerFilterEligibleElements) {
            nextEventLoop(() => {
                if (this.cyState.transparentizeElements) {
                    const toBeSelectedNodes = this.cyState.cyNodes.filter((n) => {
                        return !n.hasClass('low-priority-node');
                    }).map((n) => n.data.id);
                    const toBeSelectedEdges = this.cyState.cyEdges.filter((e) => {
                        return !e.hasClass('low-priority-edge');
                    }).map((e) => e.data.id);
                    const toBeSelected = [...toBeSelectedEdges, ...toBeSelectedNodes];

                    if (toBeSelected.length > 0) {
                        this.selectionService.selectElementsByIds(toBeSelected, false);
                    }
                } else {
                    this.cy.elements().filter((e: any) => {
                        return [CyType.COMMUNITY, CyType.EDGE, CyType.EDGEGROUP, CyType.NODE].findIndex((t) => t === e.data().cyType) !== -1;
                    }).select();
                }
            });
        }
    }

    private centerSelectedElements() {
        if (this.cyState.centerSelectedNodes) {
            const eles = this.cy.elements(':selected').filter((c: any) => {
                const cyType = c.data().cyType;
                // 如果是社群的话，必须是collapsed才能被选中
                if (cyType === CyType.COMMUNITY) {
                    return this.cyState.getCommunityById(c.data().id)!.computedCollapsed;
                }
                return true;
            });
            if (eles.length > 0) {
                this.cy.center(eles);
            }
        }
    }

    private async layoutNewElements() {

        return new Promise(async (resolve, reject) => {
            const config = this.cyState.addElementConfig!;
            if (!config) { // 删除，更新，设置社群都不会加入新节点
                resolve();
                return;
            }
            // 将新加入的普通节点居中在图中心

            if (isTextNodeAdded(config) || isDescriptionNodeAdded(config)) {
                const node = this.cy.filter(filterCommonId(config.nodeId));

                await layoutElements(node,
                    {
                        ...DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG,
                        boundingBox: this.elementService
                            .calculateNewElementsBounding(1, 0, 'around'),

                    });
                node.select();
                resolve();
                return;
            } else if (isAddFindPathEntry(config)) {
                await new AddFindPathEntryService(this).exec();
                resolve();
            } else {
                if (this.cyState.newNodeStats.size > 0) {
                    // 普通添加元素和添加邻居
                    try {
                        if (isAddNormal(config)) {
                            await new AddNormalElementsService(this).exec();
                        } else if (isAddNeighbor(config)) {
                            await new AddNeighborService(this).exec();
                        } else {
                            throw new Error('Not supported config type ');
                        }
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    resolve();
                }
            }
        });
    }
}
