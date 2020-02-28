import {CanvasDrawService} from './CanvasDrawService';
import {runInAction, action} from 'mobx';
import {shortcut} from '../../../keyboard_utils';
import {CommonService} from './CommonService';
import {CyDescriptionContainerData} from '../model/CyDescriptionContainer';
import {TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';
import {CyEdgeCommon} from '../model/CyEdgeCommonData';
import {CyEdge} from '../model/CyEdge';
import {CyEdgeGroup} from '../model/CyEdgeGroup';
import {CyFindPathBeaconEdge} from '../model/CyFindPathBeaconEdge';
import {CyType} from '../model/CyElement';
import {CyElementDefaultClass} from '../interfaces';
import {Community} from '../model/Community';

// canvas内部的事件的事件处理器
export class CanvasEventService extends CommonService {
    constructor(public drawService: CanvasDrawService) {
        super(drawService);
    }

    get canvasStore() {
        return this.drawService.canvasStore;
    }

    // 节点被拖动，或者被点击时都会触发
    public elementPositionChanged = () => {
        this.historyService.push();
        this.stateService.miniMapService.updateMiniMap();
    }

    // 当一个节点被点击时，该handler将被触发，随后nodeSelected被触发
    public nodeClicked = (e: any) => {
        const target = e.target;
        const eleService = this.elementService;
        const discoveryStart = eleService.pathDiscoveryStart;
        const data = target.data();
        if (discoveryStart && discoveryStart !== data.id && data.cyType === 'NODE'
            && data.id.indexOf('nodefind-path-temp') === -1) {
            runInAction(() => {
                eleService.pathStart = eleService.pathDiscoveryStart;
                eleService.pathEnd = e.target.data().id;
            });
            eleService.setPathDiscoveryStart(null);
            eleService.removeTempLine();

            if (this.simpleMode) {
                if (this.drawService.onFindPath) {
                    this.drawService.onFindPath(eleService.pathStart!, eleService.pathEnd!);
                }
            } else {
                const evt = e.originalEvent;
                this.stateService.setCanvasContextMenuPosition(evt.clientX, evt.clientY);
                if (eleService.pathDiscoveryType === 'ONLINE_PATH') {
                    this.stateService.setShowPathDiscoveryModal(true);
                } else if (eleService.pathDiscoveryType === 'OFFLINE_PATH') {
                    this.stateService.setShowShortestPathConfigModal(true);
                }
            }
        } else if (data.cyType === 'NODE') {
            this.stateService.closeAllContextMenu();
            const eleService = this.elementService;
            if (eleService.showBlazer) {
                runInAction(() => {
                    eleService.setShowBlazer(false);
                    if (eleService.blazerType === 'ONLINE_PATH') {
                        eleService.setFindPathDiscover(data.id);
                    } else {
                        eleService.setShortestPathDiscover(data.id);
                    }
                });
            }
        } else if (data.cyType === 'COMMUNITY') {
            // 点击社群时，cytoscape会在当前eventloop中取消所有元素选中，并选上当前community，因此需要在下一个eventloop做
            setTimeout(() => {
                this.selectionService.selectCommunity(data.id, false, e);
            });
            this.stateService.closeAllContextMenu();
        } else {
            this.stateService.closeAllContextMenu();
        }
    }

    private updateDescriptionNodeStatus() {
        runInAction(() => {
            this.cyState.noRedrawAndRerender();
            const selectedId = this.cy.nodes('.description-container:selected').map((n: any) => n.id());
            const idSet = new Set<string>(selectedId);
            this.cyState.cyDescriptionContainers.forEach(node => {
                if (idSet.has(node.data.id)) {
                    node.setSelected(true);
                } else {
                    node.setSelected(false);
                }
            });
        });
    }

    public descriptionNodeSelected = (e: any) => {
        this.updateDescriptionNodeStatus();

        if (this.cy.filter(':selected').length === 1) {
            this.elementService.togglePZ(false);
        }
    }

    public descriptionNodeUnselected = (e: any) => {
        this.updateDescriptionNodeStatus();
        this.elementService.togglePZ(true);
    }

    private updateTextNodeStatus() {
        this.cyState.noRedrawAndRerender();
        const selectedId = this.cy.nodes('.description-text:selected').map((n: any) => n.id());
        const idSet = new Set<string>(selectedId);
        this.cyState.cyTexts.forEach(node => {
            if (idSet.has(node.data.id)) {
                node.setSelected(true);
            } else {
                node.setSelected(false);
            }
        });
    }

    @action
    public textNodeSelected = (e: any) => {
        if (this.cy.filter(':selected').length === 1) {
            this.elementService.setTextNodeAsContext(e.target);
        }
        this.updateTextNodeStatus();
    }

    @action
    public textNodeUnselected = (e: any) => {
        this.updateTextNodeStatus();
        this.elementService.updateDescriptionText(e.target);
        e.target.removeClass(TEMP_HIDDEN_CLASS).remove().restore();
        this.elementService.togglePZ(true);
        e.target.unlock();
    }

    /**
     * 为了方便起见，node选中和不选中的事件都会遍历cytoscape的整个图，效率比较低，但是比较简单可靠
     */
    private setAllCyNodeStatus() {
        runInAction(() => {
            this.cyState.noRedrawAndRerender();
            // 普通节点
            const selectedId = this.cy.nodes(`.${CyElementDefaultClass.NORMAL_NODE}:selected`).map((n: any) => n.id());
            const selectedCollapsedCommunityId = this.cy.nodes(`.${CyElementDefaultClass.COLLAPSED_COMMUNITY}:selected`).map((n: any) => n.id());
            const selectedCollapsedCommunities = selectedCollapsedCommunityId.map((id: string) =>
                this.cyState.getCommunityById(id)!);

            const idSet = new Set<string>(selectedId);
            this.cyState.cyNodes.forEach(node => {
                if (idSet.has(node.data.id)) {
                    node.setSelected(true);
                } else {
                    if (selectedCollapsedCommunities.find((c: Community) => c.isAncestorOfCyNode(node))) {
                        node.setSelected(true);
                    } else {
                        node.setSelected(false);
                    }
                }
            });
        });
    }

    public nodeSelected = (e: any) => {
        this.setAllCyNodeStatus();
    }

    public nodeUnselected = (e: any) => {
        this.setAllCyNodeStatus();
    }

    private setAllCyEdgeStatus() {
        runInAction(() => {
            this.cyState.noRedrawAndRerender();
            const allVisibleEdges = this.dataDriverProcessor.allVisibleEdges;
            const allSelectedEdgesId = new Set<string>(this.cy.edges(':selected')
                .filter((e: any) => {
                    const cyType = e.data().cyType;
                    return cyType === CyType.EDGE || cyType === CyType.EDGEGROUP;
                })
                .map((e: any) => e.id()));

            allVisibleEdges.forEach((e: CyEdgeCommon) => {
                const selected = allSelectedEdgesId.has(e.data.id);
                // 这里的edge可能是被克隆出来的，因此要对底层cyState中的边进行更新
                if (e instanceof CyEdge) {
                    const readEdge = this.cyState.cyEdge(e.data.id)!;
                    readEdge.setSelected(selected);
                } else if (e instanceof CyEdgeGroup) {
                    const edges = this.cyState.allCyEdgesByMEI(e.data.id);
                    for (const e of edges) {
                        e.setSelected(selected);
                    }
                }
            });
        });
    }

    private setAllFindPathBeaconStatus() {
        runInAction(() => {
            this.cyState.noRedrawAndRerender();

            const allSelectedEdgesId = new Set<string>(this.cy.edges(`.${CyElementDefaultClass.FIND_PATH_BEACON}:selected`)
                .map((e: any) => e.id()));

            this.cyState.findPathResults.forEach((e: CyFindPathBeaconEdge) => {
                const selected = allSelectedEdgesId.has(e.data.id);
                e.setSelected(selected);
            });
        });
    }

    public edgeSelected = (e: any) => {
        this.setAllCyEdgeStatus();
    }

    public edgeUnselected = (e: any) => {
        this.setAllCyEdgeStatus();
    }

    public findPathBeaconSelected = (e: any) => {
        this.setAllFindPathBeaconStatus();
    }

    public findPathBeaconUnSelected = (e: any) => {
        this.setAllFindPathBeaconStatus();
    }

    public backgroundClicked = (e: any) => {
        if (e.target !== this.canvasStore.cy) {
            return;
        }
        runInAction(() => {
            this.setAllCyNodeStatus();
            this.stateService.elementService.setShowBlazer(false);
            this.stateService.closeAllContextMenu();
        });
    }

    public backgroundRightClicked = (e: any) => {
        runInAction(() => {
            const drawService = this.stateService;
            const evt = e.originalEvent;
            drawService.elementService.setShowBlazer(false);
            const data = e.target.data();

            if (e.target === this.canvasStore.cy) {
                drawService.setCanvasContextMenuType('BACKGROUND');
            } else if (e.target.isNode()) {
                if (drawService.elementService.pathDiscoveryStart) {
                    drawService.elementService.setPathDiscoveryStart(null);
                    drawService.elementService.removeTempLine();
                    return;
                }
                if (data.cyType === 'NODE') {// cyNode
                    drawService.setCanvasContextMenuType('NODE');
                    drawService.setCanvasContextMenuNode(data);
                    e.target.select();
                } else if (data.cyType === 'COMMUNITY') {
                    drawService.setCanvasContextMenuType('COMMUNITY');
                    drawService.setCanvasContextMenuNode(data);
                    const community = this.cyState.getCommunityById(data.id)!;
                    if (community.getCollapsed()) {
                        e.target.select();
                    }
                } else {
                    drawService.setCanvasContextMenuType('OTHERS');
                    e.target.select();
                }
            } else if (e.target.isEdge()) {
                if (data.cyType === CyType.PATH_BEACON_EDGE) {
                    drawService.setCanvasContextMenuType('FIND_PATH_EDGE');
                    drawService.setCanvasContextFindPathEdge(data);
                } else {
                    drawService.setCanvasContextMenuType('EDGE');
                    drawService.setCanvasContextMenuEdge(data);
                }

                e.target.select();
            }
            drawService.setCanvasContextMenuPosition(evt.clientX, evt.clientY);
            drawService.setShowCanvasContextMenu(true);
        });
    }

    public onZoom = () => {
        this.stateService.setCanvasRatio(this.cy!.zoom());
    }

    // onPanning will always be called when onZoom is triggered
    public onPanning = () => {
        this.cyState.updateViewport(this.cy);
        const miniMapService = this.stateService.miniMapService;
        miniMapService.onCanvasViewportChange();
    }

    public mouseMove = (e: any) => {
        this.elementService.drawTempLine(e);
    }
    @action
    public keyDown = (e: any) => {
        if (document.activeElement instanceof HTMLBodyElement) {
            if (shortcut(e, 'ctrl+shift+z')) {
                this.historyService.forward();
            } else if (shortcut(e, 'ctrl+z')) {
                this.historyService.back();
            } else if (shortcut(e, 'delete') && !this.stateService.anyContextMenuOpen) { // delete or backspace
                this.elementService.deleteSelected();
            } else if (shortcut(e, 'esc')) {
                if (this.stateService.elementService.showBlazer) {
                    this.stateService.elementService.setShowBlazer(false);
                    return;
                }

                this.stateService.closeAllContextMenu();
                this.elementService.removeTempLine();
                this.elementService.setPathDiscoveryStart(null);
            } else if (shortcut(e, 'ctrl+a')) {// select all
                this.selectionService.selectAll();
            }
        }
        if (shortcut(e, 'ctrl+f')) {// open find searchbox
            this.stateService.setShowSearchBox(!this.stateService.showSearchBox);
        }
        if (shortcut(e, 'ctrl+m')) {// toggle/minimap
            this.miniMapService.setMiniMapVisible(!this.miniMapService.miniMapVisible);
        }
        if (shortcut(e, 'esc')) {
            this.stateService.showSearchBox = false;
        }
    }

    public onViewPort = () => {
        // 优化: 如果画布上没有元素，拖动画布不加入历史
        // 群豪要求不需要进入历史，暂时保留
        // if (this.cy.elements().length !== 0) {
        //     this.historyService.push();
        // }
    }

    public onEleResized = (e: any, type: any, node: any) => {
        const data: CyDescriptionContainerData = this.cyState.cyDescriptionContainer(node.data().id)!.data;
        data.width = node.width();
        data.height = node.height();
        const cytoData = node.data();
        cytoData.width = data.width;
        cytoData.height = data.height;
        this.historyService.push();
        this.miniMapService.updateMiniMap();
    }
}
