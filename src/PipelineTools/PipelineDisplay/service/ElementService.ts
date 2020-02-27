// 负责增加，删除节点的服务
import {CanvasDrawService} from './CanvasDrawService';
import {CyNode, CyNodeData} from '../model/CyNode';
import {CyEdge} from '../model/CyEdge';
import {CommonService} from './CommonService';
import {action, observable, runInAction} from 'mobx';
import {CYTO_FIT_PADDING, doIf, IPoint} from '../../../utils';

import {NodeStyleConfigurerState} from '../context_menu/complex/NodeStyleConfigurer/NodeStyleConfigurer';
import {CyText} from '../model/CyText';
import _first from 'lodash/first';
import _uniq from 'lodash/uniq';
import _each from 'lodash/each';
import _isEqual from 'lodash/isEqual';
import {FindNeighborConfig} from '../model/CyState';
import {CyEdgeCommonData} from '../model/CyEdgeCommonData';
import {CanvasSetting} from '../model/CanvasSetting';
import {ContainerId, NodeShape} from '../interfaces';
import {COUNT_PER_ROW, NODE_NORMAL_SIZE, TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';
import {circleLayout} from '../../../layouts/CircleLayout';
import {Community} from '../model/Community';
import {canApplyAnyStyleRule} from '../DisplayCanvasUtils';
import {NodeStyleConfig} from '../model/NodeStyleConfig';

// 路径发现有两种，一种是查询api的在线路径，api可能返回新结果，一种是现有图上的路径，比如找出最短路径，A*路径等
export type PathDiscoveryType = 'ONLINE_PATH' | 'OFFLINE_PATH';

// 节点，边的增删改
export class ElementService extends CommonService {
    @observable pathDiscoveryType: PathDiscoveryType | null;
    @observable pathDiscoveryStart: string | null;
    @observable pathStart: string | null;
    @observable pathEnd: string | null;

    // 路径发现和寻找邻居的导航点的位置
    @observable
    blazerPosition: IPoint;
    blazerType: PathDiscoveryType;

    @observable
    showBlazer: boolean = false;

    constructor(public drawService: CanvasDrawService) {
        super(drawService);
    }

    private center(): IPoint {
        const {x1, x2, y1, y2} = this.cy.extent();
        return {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
    }

    @action
    setFindPathDiscover(nodeId: string) {
        this.stateService.closeAllContextMenu();
        this.setPathDiscoveryStart(nodeId);
        this.setPathDiscoveryType('ONLINE_PATH');
    }

    @action
    setShortestPathDiscover(nodeId: string) {
        this.stateService.closeAllContextMenu();
        this.setPathDiscoveryStart(nodeId);
        this.setPathDiscoveryType('OFFLINE_PATH');
    }

    @action
    setBlazerPosition(val: IPoint) {
        this.blazerPosition = val;
    }

    @action
    setShowBlazer(val: boolean) {
        this.showBlazer = val;
    }

    public setPathDiscoveryType(type: PathDiscoveryType | null) {
        this.pathDiscoveryType = type;
    }

    public setPathDiscoveryStart(id: string | null) {
        this.pathDiscoveryStart = id;
    }

    public setNodeStyle(selector: string, style: object) {
        const nodes = this.cy.nodes(selector);
        nodes.style(style);
        nodes.remove().restore();
    }

    public setEdgeStyle(selector: string, style: object) {
        this.cy.edges(selector).style(style);
    }

    public removeTempLine() {
        const cy = this.cy;
        const identifier = 'find-path-temp';
        cy.$id('node' + identifier).remove();
        cy.$id('edge' + identifier).remove();
    }

    public drawTempLine(e: any) {
        const cy = this.cy;
        const identifier = 'find-path-temp';
        this.removeTempLine();

        const startId = this.pathDiscoveryStart;
        if (startId) {
            const node = new CyNode(this.cyState);
            node.data.id = 'node' + identifier;
            node.position = e.position;

            const edge = new CyEdge(this.cyState);
            edge.data.id = 'edge' + identifier;
            edge.data.source = startId;
            edge.data.target = node.data.id;
            cy.batch(() => {
                cy.add(node.cytoFormat());
                cy.add(edge.cytoFormat());
            });
        }
    }

    @action
    public deleteSelected() {
        const elementsData = this.helperService.selectedElementsData();
        if (elementsData.length > 0) {
            this.cyState.removeMixture(elementsData);
        }
    }

    @action
    public removeNotes() {
        this.cyState.cyNodes.forEach(n => {
            if (n.selected) {
                n.data.note = undefined;
            }
        });
    }

    @action
    public removeTags() {
        this.cyState.cyNodes.forEach(n => {
            if (n.selected) {
                n.data.tags = [];
            }
        });
    }

    @action
    public removeAllAnnotations() {
        this.cyState.clearAllAnnotations();
    }

    @action
    public moveToCommunity(cid: string) {
        this.helperService.cyMovableNodesData().forEach((data: CyNodeData) => data.parent = cid);
        this.helperService.cyMovableCommunities().forEach((c: Community) => c.parent = cid);
    }

    // weightConfig: key is the edge name and value is the selected field, which can be null, meaning weight 1
    @action
    public updateEdgesWeight(weightConfig: Map<string, string | null>) {
        // get all edges and recalculate the weight
        const edges = this.cyState.cyEdges;
        edges.forEach((edge: CyEdge) => {
            const data = edge.data;
            if (weightConfig.has(data.name)) {
                data.weight = data.getValue(weightConfig.get(data.name) || '') || CyEdgeCommonData.DEFAULT_WEIGHT;
            }
        });
    }

    public offsetPositionForPoint(x: number, y: number) {
        const bounding = document.getElementById(ContainerId.complex)!.getBoundingClientRect();
        return {
            x: bounding.left + x,
            y: bounding.top + y,
        };
    }

    @action
    public restoreSelectedEdgesLineColor() {
        this.cyState.cyEdges.forEach((e: CyEdge) => {
            // 因为ddp算出来的边是普通边的clone，所以需要从ddp这头去拿
            const dde = this.dataDriverProcessor.deducedEdge(e.data.id)!;
            if (dde.selected) {
                // const data = e.data;
                e.setSelected(false);
                // data.lineColor = CyEdgeData.DEFAUlT_LINE_COLOR;
            }
        });
    }

    public changeLayout(newLayout: string) {
        this.cyState.nextTimeLayout = newLayout;
        this.cyState.noReconcile = true;
        this.drawService.newRedraw();
    }

    public calculateNewElementsBounding(nodeCount: number, padding: number, type: string = 'around',
                                        anchorNodePos?: IPoint | null) {
        // 一行最多8个
        const countPerRow = COUNT_PER_ROW;
        const eleWidth = NODE_NORMAL_SIZE;
        const eleHeight = NODE_NORMAL_SIZE;
        const rowCount = Math.ceil(nodeCount / countPerRow);

        const columnCount = Math.min(nodeCount, countPerRow);
        const totalLength = eleWidth * columnCount + padding * (columnCount + 1);
        const totalHeight = eleHeight * rowCount + padding * (rowCount + 1);

        const c = anchorNodePos || this.center();
        const startPointX = c.x - totalLength / 2;
        const startPointY = type === 'around' ? c.y - totalHeight / 2 : c.y + eleHeight + padding;

        return {x1: startPointX, y1: startPointY, w: totalLength, h: totalHeight, rows: rowCount, cols: columnCount};
    }

    public newElementsGridPosition(nodeCount: number, padding: number, anchorNodePos: IPoint) {
        // 根据锚点位置计算新节点位置
        // 单节点的话，走concentric
        // 多节点的，走grid
        const config = this.cyState.addElementConfig! as FindNeighborConfig;
        if (config.anchorNodeIds!.length <= 1) {
            return circleLayout.layout({
                centerPoint: {...anchorNodePos, isAnchorNode: true},
                nodesNumber: nodeCount,
                minSpacing: 160,
                minRadius: 200,
            });
        } else {
            // 一行最多8个
            const countPerRow = COUNT_PER_ROW;
            const eleWidth = NODE_NORMAL_SIZE;
            const eleHeight = NODE_NORMAL_SIZE;

            // 至多countPerRow列
            const columnCount = Math.min(nodeCount, countPerRow);
            const totalLength = eleWidth * columnCount + padding * (columnCount + 1);

            const c = anchorNodePos || this.center();
            const initialX = c.x - totalLength / 2 + NODE_NORMAL_SIZE / 2;
            const initialY = c.y + padding + NODE_NORMAL_SIZE;

            const result: IPoint[] = [];
            for (let i = 0; i < nodeCount; i++) {
                const row = Math.floor(i / columnCount);
                const col = i % columnCount;
                result.push({
                    x: padding * (col + 1) + col * eleWidth + initialX,
                    y: padding * (row + 1) + row * eleHeight + initialY,
                });
            }
            return result;
        }
    }

    public fitElements(padding = CYTO_FIT_PADDING) {
        this.cy.fit(padding);
    }

    public zoomIn() {
        this.cy.zoom(this.cy.zoom() + .1);
    }

    public zoomOut() {
        this.cy.zoom(this.cy.zoom() - .1);
    }

    public setTextNodeAsContext(node: any) {
        // 如果只有该节点被选中，进入编辑模式
        node.addClass(TEMP_HIDDEN_CLASS).remove().restore();
        const boundingRect = node.renderedBoundingBox();
        const position = this.elementService.offsetPositionForPoint(boundingRect.x1, boundingRect.y1);
        const padding = 3;
        const dimension = {
            x: position.x + padding,
            y: position.y + padding,
            width: 200 - padding * 2,
            height: 115 - padding * 2,
        };
        runInAction(() => {
            this.stateService.setTextEditorDimension(dimension);
            this.stateService.setDescriptionTextValue(node.data().text);
            this.stateService.setShowDescriptionTextEditor(true);
        });

        node.lock();
        this.elementService.togglePZ(false);
    }

    public togglePZ(enabled: boolean) {
        this.cy.panningEnabled(enabled);
        this.cy.zoomingEnabled(enabled);
        this.cy.userZoomingEnabled(enabled);
        this.cy.userPanningEnabled(enabled);
    }

    // 节点设置样式，轮廓（圆形，菱形），以及大小和轮廓颜色
    @action
    public applyNodeStyle(state: Readonly<NodeStyleConfigurerState>): any {
        const nodesData: CyNodeData[] = this.helperService.selectedCyNodesData;
        nodesData.forEach((data: CyNodeData) => {
            data.shape = state.shape;
            data.borderColor = state.color;
            data.manualSize = state.size;
        });
    }

    @action
    public applySize(newSize: number): any {
        const nodesData: CyNodeData[] = this.helperService.selectedCyNodesData;
        nodesData.forEach((data: CyNodeData) => {
            data.manualSize = newSize;
        });
    }

    @action
    public applyShape(newShape: NodeShape): any {
        const nodesData: CyNodeData[] = this.helperService.selectedCyNodesData;
        nodesData.forEach((data: CyNodeData) => {
            data.shape = newShape;
        });
    }

    @action
    public applyColor(color: string): any {
        const nodesData: CyNodeData[] = this.helperService.selectedCyNodesData;
        nodesData.forEach((data: CyNodeData) => {
            data.borderColor = color;
        });
    }

    // 将当前nodeStyleConfig中的配置应用到图上
    @action
    public applyNodeStyleConfig() {
        const styleConfigs = this.cyState.canvasSetting.globalNodeConfig.nodeStyleConfigs;
        for (const node of this.cyState.cyNodes) {
            const data = node.data;
            doIf(() => {
                return canApplyAnyStyleRule(styleConfigs, data);
            }, (styleRule: NodeStyleConfig) => {
                data.shape = styleRule.shape;
                data.manualSize = styleRule.size;
                data.borderColor = styleRule.borderColor;
            });
        }
    }

    @action
    public clearNodesStyle(): void {
        this.cyState.allCyNodesData.forEach((data: CyNodeData) => {
            data.shape = CyNodeData.DEFAULT_SHAPE;
            data.borderColor = CyNodeData.DEFAULT_BORDER_COLOR;
            data.manualSize = CyNodeData.AUTO_SIZE;
        });
    }

    @action
    public clearEdgesStyle(): void {
        this.cyState.canvasSetting.globalEdgeConfig.resetEdgeStyleConfigs();
    }

    @action
    clearAll() {
        this.drawService.cyState.clearAll();
        this.stateService.closeAllContextMenu();
    }

    @action
    public updateTags(nodes: CyNodeData[], tag: string[]) {
        // 当只选中一个节点的时候， 进行tags替换的操作
        if (nodes.length === 1) {
            const node = _first(nodes)!;
            node.setTag(tag);
        } else {
            // 当选中多个节点的时候， 进行tags增量操作
            _each(nodes, (node) => {
                node.setTag(_uniq(node.tags.concat(tag)));
            });
        }
    }

    @action
    updateDescriptionText(node: any) {
        const text = this.stateService.descriptionTextValue.trim();
        const cyText: CyText = this.cyState.cyText(node.data().id)!;
        if (cyText.data.text !== text) {
            cyText.data.text = text.length > 0 ? text : 'Add Description';
            this.cyState.setNoRedraw(false);
        }
        this.stateService.setShowDescriptionTextEditor(false);
    }

    @action
    public updateCanvasFromSetting(oldValue: CanvasSetting, newValue: CanvasSetting) {
        if (!_isEqual(oldValue, newValue)) {
            // this.stateService.resetSelection();
            this.cyState.setCanvasSetting(newValue);
        }
    }

}
