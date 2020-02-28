import {CyNode, CyNodeData} from './CyNode';
import {CyEdge, CyEdgeData, emi} from './CyEdge';
import {action, computed, observable, ObservableMap} from 'mobx';
import {Classifier, debug, filterCommonId, IPoint} from '../../../utils';
import {CyElementData} from './CyElement';
import {CyCommunityNodeData} from './CyCommunityNode';
import {NodeWithPosition} from './NodeWithPosition';
import {Community} from './Community';
import {EdgeConfig} from './EdgeConfig';
import {NodeTypeConfig} from './NodeTypeConfig';
import {
    DisplayModePipelineSchema,
    EdgeFieldsFilterConfig,
    FieldLimit,
    FILTER_ID,
    SelectedTimeAttribute,
    TimeFilterType,
} from '../interfaces';
import {CanvasDrawService} from '../service/CanvasDrawService';
import {CyEdgeGroupData} from './CyEdgeGroup';
import {
    CyDescriptionContainer,
    CyDescriptionContainerData,
    CyDescriptionContainerShape,
} from './CyDescriptionContainer';
import {CyText, CyTextData} from './CyText';
import {CanvasSetting} from './CanvasSetting';
import {CyAssortedInnerPath, CyFindPathBeaconEdge, CyFindPathBeaconEdgeData} from './CyFindPathBeaconEdge';
import {FindPathInnerPath} from '../kg-interface';
import moment from 'moment';
import uuidv1 from 'uuid/v1';
import {isAddNormal} from '../CanvasDrawUtils';
import {NODE_MEDIUM_SIZE} from '../../common/cytoscapeCommonStyle';

export interface NewElementLayoutConfig {
    name: string;
    padding: number;
    avoidOverlapPadding: number;
    fit: boolean;
    nodeDimensionsIncludeLabels: boolean;
    spacingFactor: number;
    animation: boolean;
    animationDuration: number;
    animationEasing: string | undefined;
    layoutAll: boolean;
}

export enum AddMixtureType {
    'NORMAL',
    'NEIGHBOR',
    'FIND_PATH_ENTRY',
    'TEXT',
    'DESCRIPTION',
}

interface NodeEdgeAdditionBase {
    nodes: CyNode[];
    edges: CyEdge[];
    expandEdges?: boolean; // 默认加入的边都为合并模式
}

interface ReplaceOption {
    replace?: boolean; // replace为true会删除当前存在的元素
}

// 普通的加入node和edges，同时如果paths不为空数组，也会加入其中的路径
export interface AddNormalNodeEdgeConfig extends NodeEdgeAdditionBase, ReplaceOption {
    type: AddMixtureType.NORMAL;
    paths: AddSinglePath[];
    extraLayoutConfig?: Partial<NewElementLayoutConfig>;
    // 加入path entry时的特殊逻辑,这块以后需要修改
    pathResultHack?: boolean;
}

export interface AddFindPathEntryConfig extends NodeEdgeAdditionBase {
    type: AddMixtureType.FIND_PATH_ENTRY;
    beaconEdgeData: CyFindPathBeaconEdgeData;
    assortedPath: CyAssortedInnerPath;
}

export interface FindNeighborConfig extends NodeEdgeAdditionBase {
    type: AddMixtureType.NEIGHBOR;
    anchorNodeIds: string[];
}

export interface AddSinglePath {
    source: CyNode;
    target: CyNode;
    innerPaths: FindPathInnerPath[];
}

// 辅助节点，比如文本或者描述
export interface AddAuxiliaryNodeConfig {
    nodeId: string;
    type: AddMixtureType.TEXT | AddMixtureType.DESCRIPTION;
}

// 非辅助节点，即普通节点或者边
export type AddNonAuxiliaryElementConfig = AddNormalNodeEdgeConfig | FindNeighborConfig | AddFindPathEntryConfig;
export type AddElementConfig = AddNonAuxiliaryElementConfig | AddAuxiliaryNodeConfig;
export type CyTheme = 0 | 1;

export class EdgeFilterConditions {
    version: number = 0;
    timeAttributes: SelectedTimeAttribute[] = [];

    toJSON() {
        const result: any = {version: this.version};
        // 深克隆
        result.timeAttributes = this.timeAttributes.map((c: SelectedTimeAttribute) => {
            const obj: any = {
                relation: c.relation,
                attribute: c.attribute,
            };
            if (typeof c.condition === 'string') {
                obj.condition = c.condition;
            } else {
                obj.condition = {};
                if (c.condition.from) {
                    obj.condition.from = c.condition.from.valueOf();
                }
                if (c.condition.to) {
                    obj.condition.to = c.condition.to.valueOf();
                }

            }
            return obj;
        });
        return result;
    }

    static fromJSON(o: any) {
        const r = new EdgeFilterConditions();
        r.version = o.version;
        r.timeAttributes = o.timeAttributes;
        for (const tr of r.timeAttributes) {
            const condition = tr.condition as any;

            if (condition.from) {
                condition.from = moment(condition.from);
            }
            if (condition.to) {
                condition.to = moment(condition.to);
            }
        }
        return r;
    }
}

export class CyState {

    uuid: string;
    // 下面这些属性会被存下来
    private cyNodesMap: ObservableMap<string, CyNode> = new ObservableMap<string, CyNode>();
    private cyEdgesMap: ObservableMap<string, CyEdge> = new ObservableMap<string, CyEdge>();
    private cyDescriptionMap: ObservableMap<string, CyDescriptionContainer> = new ObservableMap<string, CyDescriptionContainer>();
    private cyTextMap: ObservableMap<string, CyText> = new ObservableMap<string, CyText>();
    private communitiesMap: ObservableMap<string, Community> = new ObservableMap<string, Community>();
    // 数据结构: 目的是展现时可以对节点的颜色，边的权重等作调整
    nodeTypeConfigs: ObservableMap<string, NodeTypeConfig> = new ObservableMap<string, NodeTypeConfig>();
    // key是边名字，value为配置的对象，理论上这个变量可以放到globalEdgeConfig中，但是data migration过于麻烦
    // 直接声明成两个对象
    edgeConfigs: ObservableMap<string, EdgeConfig> = new ObservableMap<string, EdgeConfig>();
    // 初始化 canvas setting
    @observable public canvasSetting: CanvasSetting = new CanvasSetting();

    // 当前cyState被更新过的次数，没有实际意义，为了强制刷新
    @observable runTimes: number = 0;
    @observable public theme: CyTheme = 0;
    public mergedEmis: ObservableMap<string, number> = new ObservableMap<string, number>();
    @observable public edgeFilterConditions: EdgeFilterConditions = new EdgeFilterConditions();
    @observable public findPathResults: Map<string, CyFindPathBeaconEdge> = new Map<string, CyFindPathBeaconEdge>();

    MIN_RANK = 0.01;
    MAX_RANK = 0.02;

    zoom: number = 1;
    pan: IPoint = {x: 0, y: 0};
    // key是元素的filterCommonId，value为true表示该元素本就在图上了
    newEdgeStats: Map<FILTER_ID, boolean> = new Map<FILTER_ID, boolean>();
    newNodeStats: Map<FILTER_ID, boolean> = new Map<FILTER_ID, boolean>();

    nextTimeLayout: string;
    addElementConfig: AddElementConfig | null;

    // 普通操作应该pushHistory，但是以下情况不需要
    // - 回退和前进
    // - 用户切换到其他组件或者路由，然后再切换回来的时候
    // - 从另一个tab切换回来的时候
    noHistory: boolean;
    // 隐藏或者显示类型时，不需要reconcile
    noReconcile: boolean;
    // 某些情况下对CyState做修改，不需要重绘:
    // - 添加一个新的社群
    // - select，unselection事件导致所有对象的selected属性改变的，不需要重绘
    noRedraw: boolean;

    // 某些操作导致的重绘，比如selectElementById不希望看到loading效果起来
    noLoadingEffect: boolean;
    // 选择操作最后要对选中元素进行居中
    centerSelectedNodes: boolean;

    // 当时间轴被拖动时，符合条件的元素被高亮选中
    highlightTimerFilterEligibleElements: boolean;

    // 下一次要被展开的社群
    communitiesToBeExpanded: Set<string> = new Set<string>();

    // 有时候需要一个行为结束后才触发下一个行为，这个时候需要这样一个trigger的存在
    nextActionTrigger: (() => any) | null = null;

    constructor(public drawService: CanvasDrawService) {
        this.resetOneTimeStatus();
        this.uuid = uuidv1();
    }

    setNoRedraw(val: boolean) {
        this.noRedraw = val;
    }

    @action
    noRedrawAndRerender() {
        this.setNoRedraw(true);
        this.forceReRender();
    }

    @action
    forceReRender() {
        this.runTimes++;
    }

    @action
    mergeAllEdges() {
        for (const e of this.cyEdges) {
            const data = e.data;
            this.addMergedEmi(data.source, data.target, data.name);
        }
    }

    @action
    expandAllEdges() {
        this.mergedEmis.clear();
    }

    @action
    addMergedEmi(src: string, target: string, name: string) {
        this.mergedEmis.set(emi(src, target, name), 1);
    }

    @action
    private addMergedEmiStrFormat(emi: string) {
        this.mergedEmis.set(emi, 1);
    }

    @action
    removeMergedEmi(emi: string) {
        this.mergedEmis.delete(emi);
    }

    @action
    setEdgeFilterConditions(a: EdgeFilterConditions) {
        this.edgeFilterConditions = a;
    }

    initTypesFromSchema(schema: DisplayModePipelineSchema) {
        for (const widgetSchema of schema.vertices) {
            const schemaName = widgetSchema.labelName;
            // 类型的设置，比如说Person类型，node的颜色是什么，根据什么分组
            const config: NodeTypeConfig = NodeTypeConfig.newConfig(schemaName);
            this.nodeTypeConfigs.set(schemaName, config);
        }
        for (const edge of schema.edges) {
            const schemaName = edge.labelName;
            const config = new EdgeConfig(schemaName);
            this.edgeConfigs.set(schemaName, config);
        }
    }

    isRelationFilterEnabled() {
        return this.edgeFilterConditions.timeAttributes.length !== 0;
    }

    resetOneTimeStatus() {
        this.noHistory = false;
        this.nextTimeLayout = 'preset';
        this.setNoRedraw(false);
        this.noReconcile = false;
        this.noLoadingEffect = false;
        this.addElementConfig = null;
        this.centerSelectedNodes = false;
        this.highlightTimerFilterEligibleElements = false;
        this.nextActionTrigger = null;
        this.communitiesToBeExpanded.clear();
    }

    toJSON() {
        return {
            uuid: this.uuid,
            zoom: this.zoom,
            pan: this.pan,
            cyNodes: this.cyNodes,
            cyEdges: this.cyEdges,
            cyDescs: this.cyDescriptionContainers,
            cyTexts: this.cyTexts,
            mergedEmis: Array.from(this.mergedEmis.keys()),
            communities: this.communities,
            nodeTypeConfigs: Array.from(this.nodeTypeConfigs.values()),
            edgeConfigs: Array.from(this.edgeConfigs.values()),
            edgeFilterConditions: this.edgeFilterConditions.toJSON(),
            findPathResults: Array.from(this.findPathResults.values()).map(r => r.toJSON()),
            canvasSetting: this.canvasSetting,
            theme: this.theme,
        };
    }

    static fromJSON(drawService: CanvasDrawService, str: string, schema: DisplayModePipelineSchema): CyState {
        const state = new CyState(drawService);
        return this.doDeserialize(state, str, schema);
    }

    reload(str: string) {
        return CyState.doDeserialize(this, str);
    }

    reloadFromHistory(str: string) {
        return this.reload(str);
    }

    private static doDeserialize(state: CyState, str: string, schema?: DisplayModePipelineSchema) {
        state.destroy();
        const obj = JSON.parse(str);

        state.zoom = obj.zoom || 1;
        state.pan = obj.pan || {x: 0, y: 0};
        if (obj.uuid) {
            state.uuid = obj.uuid;
        }
        if (obj.cyNodes) {
            for (const n of obj.cyNodes) {
                const newNode = CyNode.fromJSON(n, state);
                state.cyNodesMap.set(newNode.data.id, newNode);
            }
        }
        if (obj.cyEdges) {
            for (const e of obj.cyEdges) {
                const newEdge = CyEdge.fromJSON(e, state);
                state.cyEdgesMap.set(newEdge.data.id, newEdge);
            }
        }
        if (obj.findPathResults) {
            for (const o of obj.findPathResults) {
                const pathResult = CyFindPathBeaconEdge.fromJSON(o, state);
                state.findPathResults.set(pathResult.data.id, pathResult);
            }
        }
        if (obj.communities) {
            for (const c of obj.communities) {
                const community = Community.fromJSON(state, c);
                state.addNewCommunity(community);
            }
        }
        if (obj.cyDescs) {
            for (const desc of obj.cyDescs) {
                const descContainer = CyDescriptionContainer.fromJSON(desc, state);
                state.cyDescriptionMap.set(descContainer.data.id, descContainer);
            }
        }
        if (obj.cyTexts) {
            for (const json of obj.cyTexts) {
                const text = CyText.fromJSON(json, state);
                state.cyTextMap.set(text.data.id, text);
            }
        }

        if (obj.nodeTypeConfigs && obj.edgeConfigs) {
            for (const json of obj.nodeTypeConfigs) {
                const ntc = NodeTypeConfig.fromJSON(json);
                state.nodeTypeConfigs.set(ntc.name, ntc);
            }
            for (const json of obj.edgeConfigs) {
                const ec = EdgeConfig.fromJSON(json);
                state.edgeConfigs.set(ec.name, ec);
            }
        } else {
            if (schema) {
                state.initTypesFromSchema(schema);
            } else {
                throw new Error('schema is not provided');
            }
        }
        state.canvasSetting = CanvasSetting.fromJSON(obj.canvasSetting);
        state.theme = obj.theme || 0;

        if (obj.mergedEmis) {
            for (const emi of obj.mergedEmis) {
                state.addMergedEmiStrFormat(emi);
            }
        }
        if (obj.edgeFilterConditions) {
            state.edgeFilterConditions = EdgeFilterConditions.fromJSON(obj.edgeFilterConditions);
        }

        return state;
    }

    @computed
    get cyNodes() {
        return Array.from(this.cyNodesMap.values());
    }

    public cyNode(id: string) {
        return this.cyNodesMap.get(id);
    }

    get transparentizeElements() {
        return this.canvasSetting.timeFilterType === TimeFilterType.TRANSPARENTIZE;
    }

    // 如果关系筛选被打开，那么只有关系筛选的端点才会出现在结果里
    @computed
    get relationFilterEndpoints() {
        if (this.isRelationFilterEnabled()) {
            const relationFilterEndpoints: Set<string> = new Set<string>();
            for (const e of this.cyEdges) {
                if (e.matchFilterCondition()) {
                    relationFilterEndpoints.add(e.data.source);
                    relationFilterEndpoints.add(e.data.target);
                }
            }
            return relationFilterEndpoints;
        } else {
            return new Set<string>();
        }
    }

    @computed
    get visibleCyNodes() {
        return this.cyNodes.filter((n) => !n.isHidden());
    }

    @computed
    get visibleCyNodesId(): string[] {
        return this.visibleCyNodes.map((n) => n.data.id);
    }

    cyNodesByNodeType(nodeType: string) {
        return this.visibleCyNodes.filter((n) => n.data.nodeType === nodeType);
    }

    // 一个社群下的所有子孙节点，比如社群1包含社群2，那么该方法会返回社群1+社群2的所有节点
    cyNodesByCommunity(communityId: string): CyNode[] {
        const community = this.getCommunityById(communityId)!;
        return this.visibleCyNodes.filter((n) => community.isAncestorOfCyNode(n));
    }

    // 只返回只属于当前社群的子节点
    cyChildNodesByCommunity(communityId: string): CyNode[] {
        return this.visibleCyNodes.filter((n) => n.data.parent === communityId);
    }

    @computed
    get cyEdges(): CyEdge[] {
        return Array.from(this.cyEdgesMap.values());
    }

    @computed
    get cyBeaconEdges(): CyFindPathBeaconEdge[] {
        return Array.from(this.findPathResults.values());
    }

    public cyEdge(id: string) {
        return this.cyEdgesMap.get(id);
    }

    cyEdgesByName(name: string) {
        return this.visibleCyEdges.filter((e: CyEdge) => e.data.name === name);
    }

    @computed
    get visibleCyEdges() {
        return this.cyEdges.filter((e: CyEdge) => !e.isHidden());
    }

    @computed
    get cyDescriptionContainers() {
        return Array.from(this.cyDescriptionMap.values());
    }

    public cyDescriptionContainer(id: string) {
        return this.cyDescriptionMap.get(id);
    }

    @computed
    get cyTexts() {
        return Array.from(this.cyTextMap.values());
    }

    public cyText(id: string) {
        return this.cyTextMap.get(id);
    }

    public cyFindPathBeaconEdge(beaconId: string) {
        return this.findPathResults.get(beaconId);
    }

    @computed
    get communities(): Community[] {
        return Array.from(this.communitiesMap.values());
    }

    @computed
    get collapsedCommunities() {
        return this.communities.filter((c) => c.computedCollapsed === true);
    }

    @computed
    get collapsedCommunitiesIds() {
        return new Set<string>(this.collapsedCommunities.map((c) => c.id));
    }

    @computed
    get allCyNodesData(): CyNodeData[] {
        return this.cyNodes.map(n => n.data);
    }

    @computed
    get allCyEdgesData(): CyEdgeData[] {
        return this.cyEdges.map(e => e.data);
    }

    allCyEdgesByMEI(mei: string): CyEdge[] {
        return this.visibleCyEdges.filter((c) => {
            return c.data.emi === mei;
        });
    }

    getCommunityById(communityId: string) {
        return this.communitiesMap.get(communityId);
    }

    getRelatedEdges(nodeId: string) {
        return this.cyEdges.filter((e) => e.data.source === nodeId || e.data.target === nodeId);
    }

    @action
    public setTheme(theme: CyTheme) {
        this.theme = theme;
    }

    @action
    public setCanvasSetting(setting: CanvasSetting) {
        this.canvasSetting = CanvasSetting.fromJSON(setting);
    }

    @action
    public clearAllAnnotations() {
        this.cyTextMap.clear();
        this.cyDescriptionMap.clear();
    }

    /**
     * 尝试增加节点，返回成功添加的数量
     * @param {CyNode[]} nodes
     * @param {IPoint | null} refPoint
     * @param {LayoutPositionType} layoutPosition
     * @param {string} newElementLayout
     */
    @action
    private addNodes(config: AddNonAuxiliaryElementConfig) {
        const newNodeStats: Map<string, boolean> = new Map<string, boolean>();
        const processedNodeIds: Set<string> = new Set<string>();

        let anyNodeAdded = false;

        const nodes = [...config.nodes];
        if (isAddNormal(config) && config.paths.length > 0) {
            for (const path of config.paths) {
                nodes.push(path.source);
                nodes.push(path.target);
            }
        }

        for (const n of nodes) {
            // 如果用户数据用重复的节点，不处理，并给出警告
            if (processedNodeIds.has(n.data.id)) {
                // 如果config.type是FIND_PATH_ENTRY的话，的确可能存在重复节点和边
                if (config.type === AddMixtureType.NORMAL) {
                    console.warn('添加集合中存在重复节点=>' + n.data.nodeType + ':' + n.data.id);
                }
                continue;
            }
            processedNodeIds.add(n.data.id);

            // key为node的id，value是以前是否存在
            newNodeStats.set(filterCommonId(n.data.id), this.cyNodesMap.has(n.data.id));
            if (!this.cyNodesMap.has(n.data.id)) {
                this.cyNodesMap.set(n.data.id, n);
                n.setSelected(true);
                n.becomeTempInvisible(); // 新元素第一次添加进来时先隐藏，之后代码会删除隐藏类
                anyNodeAdded = true;
            }
        }

        this.nextTimeLayout = 'preset';
        return {newNodeStats, anyNodeAdded};
    }

    // 查看source和target间能否加入新的PathEdge，只有之前的PathEdge完全被消化了，才能加入
    // private checkPathCanBeAdded(source: CyNode, target: CyNode) {
    //     return !this.findPathResults.has(CyFindPathBeaconEdge.idFor(source.data.id, target.data.id));
    // }

    private addSinglePath(singlePathConfig: AddSinglePath) {
        const {source, target, innerPaths} = singlePathConfig;
        if (innerPaths.length === 0) {
            return;
        }

        const beaconEdgeId = CyFindPathBeaconEdge.idFor(source.data.id, target.data.id);

        if (this.findPathResults.has(beaconEdgeId)) {
            const beaconEdge = this.findPathResults.get(beaconEdgeId)!;
            beaconEdge.setSelected(true);
            beaconEdge.addInnerPaths(innerPaths);
        } else {
            const beaconEdge = new CyFindPathBeaconEdge(this, source, target, innerPaths);
            beaconEdge.setSelected(true);
            this.findPathResults.set(beaconEdgeId, beaconEdge);
        }
        const sourceNode = this.cyNode(source.data.id)!;
        const targetNode = this.cyNode(target.data.id)!;

        sourceNode.data.manualSize = NODE_MEDIUM_SIZE;
        targetNode.data.manualSize = NODE_MEDIUM_SIZE;
    }

    @computed
    get currentEMIS() {
        const emis: Set<string> = new Set<string>();
        this.cyEdges.forEach((edge) => emis.add(edge.data.emi));
        return emis;
    }

    @action
    public updateNodes(newCyNodes: CyNode[]) {
        for (const n of newCyNodes) {
            this.cyNodesMap.set(n.data.id, n);
        }
    }

    @action
    public updateEdges(newCyEdges: CyEdge[]) {
        for (const e of newCyEdges) {
            this.cyEdgesMap.set(e.data.id, e);
        }
    }

    /**
     * 增加边，返回新增边的数量
     * @param {CyEdge[]} edges
     */
    @action
    private addEdges(config: AddNonAuxiliaryElementConfig) {
        const newEdgeStats: Map<string, boolean> = new Map<string, boolean>();
        const processedNodeIds: Set<string> = new Set<string>();

        let anyEdgesAdded = false;

        for (const e of config.edges) {

            if (!this.cyNodesMap.has(e.data.source) || !this.cyNodesMap.has(e.data.target)) {
                console.warn(`边${e.data.id}缺少源/目标节点`);
                continue;
            }

            // 如果用户数据用重复的节点，不处理，并给出警告
            if (processedNodeIds.has(e.data.id)) {
                // 如果config.type是FIND_PATH_ENTRY的话，的确可能存在重复边
                if (config.type === AddMixtureType.NORMAL) {
                    console.warn('添加集合中存在重复边=>' + e.data.name + ':' + e.data.id);
                }
                continue;
            }
            processedNodeIds.add(e.data.id);

            // 默认是合并模式，外部也可以传入非合并模式
            if (!config.expandEdges) {
                this.addMergedEmi(e.data.source, e.data.target, e.data.name);
            }

            newEdgeStats.set(filterCommonId(e.data.id), this.cyEdgesMap.has(e.data.id));
            if (!this.cyEdgesMap.has(e.data.id)) {
                anyEdgesAdded = true;
                e.setSelected(true);
                e.becomeTempInvisible(); // 新元素第一次添加进来时先隐藏，之后代码会删除隐藏类
                this.cyEdgesMap.set(e.data.id, e);
            }
        }
        this.nextTimeLayout = 'preset';
        return {newEdgeStats, anyEdgesAdded};
    }

    @action
    public addDescriptionContainer(shape: CyDescriptionContainerShape) {
        this.clearSelectedStatus();
        const container = new CyDescriptionContainer(this, shape);
        container.becomeTempInvisible();
        container.setSelected(true);

        this.cyDescriptionMap.set(container.data.id, container);
        this.nextTimeLayout = 'preset';
        this.addElementConfig = {
            type: AddMixtureType.DESCRIPTION,
            nodeId: container.data.id,
        };
        this.newNodeStats.set(filterCommonId(container.data.id), false);
    }

    @action
    public addText() {
        this.clearSelectedStatus();
        const text = new CyText(this);
        text.becomeTempInvisible();
        text.setSelected(true);
        this.cyTextMap.set(text.data.id, text);
        this.nextTimeLayout = 'preset';
        this.addElementConfig = {
            type: AddMixtureType.TEXT,
            nodeId: text.data.id,
        };
        this.newNodeStats.set(filterCommonId(text.data.id), false);
    }

    // @action
    // private emphasizeAnchorNodes() {
    //     const config = this.addElementConfig!;
    //     if (config.type === AddMixtureType.FIND_PATH) {
    //         const source = this.cyNode(config.anchorNodeIds![0]);
    //         const target = this.cyNode(config.anchorNodeIds![1]);
    //         if (source && target) {
    //             source.data.borderColor = '#35DC57';
    //             source.data.manualSize = EMPHASIS_POINT_SIZE;
    //             source.data.shape = 'ellipse';
    //             target.data.borderColor = '#E15959';
    //             target.data.shape = 'ellipse';
    //             target.data.manualSize = EMPHASIS_POINT_SIZE;
    //         }
    //     }
    // }

    /**
     * 返回新增节点和新增边的数量,mixture只包含普通节点和边，描述节点和文本节点参考addText和addDescriptionContainer
     * 由于addMixture会被外部多次调用，所以firstTime表明他是不是第一次被调用
     */
    @action
    private addMixture(config: AddNonAuxiliaryElementConfig):
        { newNodeStats: Map<string, boolean>, newEdgeStats: Map<string, boolean> } {
        if ((config as any).replace) {
            this.drawService.cy.elements().remove();
            this.clearAll();
        }
        this.drawService.timeFilterService.setShowTimeFilter(false);
        this.clearSelectedStatus();

        this.nextTimeLayout = 'preset';
        const {newNodeStats, anyNodeAdded} = this.addNodes(config);
        const {newEdgeStats, anyEdgesAdded} = this.addEdges(config);
        if (isAddNormal(config) && config.paths.length > 0) {
            for (const p of config.paths) {
                this.addSinglePath(p);
            }
        }

        this.newEdgeStats = newEdgeStats;
        this.newNodeStats = newNodeStats;
        // 加入一条新的path时可能不会引入新的节点和边，但是为了播放动画，还是需要设置这里的addElementConfig
        if (anyNodeAdded || anyEdgesAdded || config.type === AddMixtureType.FIND_PATH_ENTRY) {
            this.addElementConfig = config;
        }

        return {
            newNodeStats,
            newEdgeStats,
        };
    }

    @action
    public addNormalNodesEdges(config: AddNormalNodeEdgeConfig) {
        return this.addMixture(config);
    }

    // 展开选中的多条虚拟路径
    @action
    public expandSelectedPathBeaconEdges() {
        const selectedBeaconEdges = this.cyBeaconEdges.filter(be => be.selected);
        this.expandPathBeaconEdges(selectedBeaconEdges);
    }

    // 展开图上所有虚拟路径
    @action
    public expandAllPathBeaconEdges() {
        this.expandPathBeaconEdges(this.cyBeaconEdges);
    }

    // 对任意一条虚拟路径，取出其所有节点和边，然后构造一个新的AddNormalNodeEdgeConfig
    private expandPathBeaconEdges(beaconEdges: CyFindPathBeaconEdge[]) {
        const beaconEdgeIds = beaconEdges.map(be => be.data.id);
        const vertexMap: Map<string, CyNode> = new Map();
        const edgeMap: Map<string, CyEdge> = new Map();
        for (const be of beaconEdges) {
            const {vertices, edges} = be.data.allVerticesAndEdges;
            for (const v of vertices) {
                vertexMap.set(v.data.id, v);
            }
            for (const e of edges) {
                edgeMap.set(e.data.id, e);
            }
        }
        const config: AddNormalNodeEdgeConfig = {
            nodes: Array.from(vertexMap.values()),
            edges: Array.from(edgeMap.values()),
            paths: [],
            type: AddMixtureType.NORMAL,
        };
        for (const beid of beaconEdgeIds) {
            this.findPathResults.delete(beid);
        }
        this.addNormalNodesEdges(config);
    }

    @action
    public addNeighbors(config: FindNeighborConfig) {
        return this.addMixture(config);
    }

    // 把找路径的某个结果添加到图中,返回值为在该过程中被展开的社群的名字
    @action
    public addFindPathEntry(config: AddFindPathEntryConfig) {
        this.noLoadingEffect = true;
        const nodes = config.assortedPath.vertices;
        const edges = config.assortedPath.edges;
        const srcNodeId = nodes[0].data.id;
        const targetNodeId = nodes[nodes.length - 1].data.id;

        config.nodes = nodes;
        config.edges = edges;
        this.addMixture(config);

        const src = config.nodes.find(n => n.data.id === srcNodeId)!;
        const target = config.nodes.find(n => n.data.id === targetNodeId)!;

        const expandedCommunitiesNames: Set<string> = new Set<string>();
        // 把所有中间节点都选中,如果中间节点在某个社群里，需要把该社群展开
        for (const n of config.nodes) {
            const cyNode = this.cyNode(n.data.id)!;
            cyNode.setSelected(true);
            const ancestors = cyNode.ancestors;
            ancestors.forEach((c) => {
                if (c.getCollapsed()) {
                    c.setCollapsed(false);
                    expandedCommunitiesNames.add(c.name);
                }
            });
        }
        for (const e of config.edges) {
            this.cyEdge(e.data.id)!.setSelected(true);
        }

        // beacon边设置未选中
        const id = CyFindPathBeaconEdge.idFor(src.data.id, target.data.id);
        const findPathResult = this.findPathResults.get(id)!;
        findPathResult.setSelected(false);

        // 从当前beaconEdge中删除该路径
        findPathResult.data.assortedInnerPathMap.delete(config.assortedPath.id);

        // 如果所有路径都已经被展示
        if (findPathResult.data.assortedInnerPathMap.size === 0) {
            this.findPathResults.delete(id);
        }
        return Array.from(expandedCommunitiesNames).join(',');
    }

    // 新加入任何元素时，把之前选中的元素清除选中
    @action
    public clearSelectedStatus() {
        this.cyNodesMap.forEach((n) => n.setSelected(false));
        this.cyEdgesMap.forEach((e) => e.setSelected(false));
        this.cyDescriptionMap.forEach((n) => n.setSelected(false));
        this.cyTextMap.forEach((n) => n.setSelected(false));
    }

    @action
    public clearNewElementStats() {
        this.newNodeStats.clear();
        this.newEdgeStats.clear();
        this.cyNodesMap.forEach((n) => n.becomeVisible());
        this.cyNodesMap.forEach((n) => n.becomeVisible());
        this.cyEdgesMap.forEach((e) => e.becomeVisible());
        this.cyDescriptionMap.forEach((n) => n.becomeVisible());
        this.cyTextMap.forEach((n) => n.becomeVisible());
    }

    /**
     *
     * @param {any[]} elements cytoscape类型的混合类型，有边，普通节点，社群节点等
     */
    @action
    public removeMixture(elementsData: CyElementData[]) {
        this.drawService.timeFilterService.setShowTimeFilter(false);
        this.doRemove(elementsData);
    }

    // only nodes and edges
    @action
    public removeAndAddElements(
        drawService: CanvasDrawService,
        toBeRemovedNodeIds: string[],
        toBeRemovedEdgeIds: string[],
        toBeAddedNodes: CyNode[],
        toBeAddedEdges: CyEdge[]) {
        for (const id of toBeRemovedNodeIds) {
            this.removeNodeById(id);
        }
        for (const id of toBeRemovedEdgeIds) {
            this.cyEdgesMap.delete(id);
        }
        this.addElementConfig = null;
        this.addMixture({
            nodes: toBeAddedNodes,
            edges: toBeAddedEdges,
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    @computed
    get sortedCommunities(): Community[] {
        const communities = Array.from(this.communities.values());

        const result = [];
        for (const c of communities) {
            c.childCommunities = [];
        }

        for (const c of communities) {
            if (c.parent === '') {
                result.push(c);
            } else {
                const parent = this.getCommunityById(c.parent)!;
                parent.childCommunities.push(c);
            }
        }
        for (const c of communities) {
            c.childCommunities.sort((c1: Community, c2: Community) => {
                if (!c1.createdTime || !c2.createdTime) {
                    return -1;
                } else {
                    if (c1.createdTime < c2.createdTime) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            });
        }

        return result;
    }

    // 假设有5个community
    // a=>level 3,b=>level2,c=>level1,d=>level1,e=>level0
    // 返回 [[a],[b],[c,d],[e]]
    @computed
    get layeredCommunities() {
        const sortedCommunities = this.communities.sort((c1, c2) => {
            return c1.level < c2.level ? -1 : 1;
        });
        const result: Community[][] = [];
        let lastCommunityLevel = -1;
        sortedCommunities.forEach((c) => {
            let group: Community[];
            if (c.level !== lastCommunityLevel) {
                group = [];
                result.push(group);
            } else {
                group = result[result.length - 1];
            }
            lastCommunityLevel = c.level;
            group.push(c);
        });
        return result;
    }

    private removeNodeById(id: string) {
        this.cyNodesMap.delete(id);
        // 删除相关的所有边
        const relatedEdgesId = this.getRelatedEdges(id).map((e) => e.data.id);
        relatedEdgesId.forEach((id) => this.cyEdgesMap.delete(id));
        // 删除相关的所有路径
        Array.from(this.findPathResults.keys())
            .forEach(beaconId => {
                const [src, target] = CyFindPathBeaconEdge.getSrcAndTarget(beaconId);
                if (src === id || target === id) {
                    this.findPathResults.delete(beaconId);
                }
            });
    }

    private doRemove(elementsData: CyElementData[]) {
        for (const data of elementsData) {
            const id = data.id;
            if (data instanceof CyNodeData) {
                this.removeNodeById(id);
            } else if (data instanceof CyEdgeData) {
                this.cyEdgesMap.delete(id);
            } else if (data instanceof CyEdgeGroupData) {
                const victimEdges = this.cyEdges.filter((e) => e.data.emi === data.id);
                victimEdges.forEach((e) => this.cyEdgesMap.delete(e.data.id));
            } else if (data instanceof CyFindPathBeaconEdgeData) {
                this.findPathResults.delete(data.id);
            } else if (data instanceof CyCommunityNodeData) {
                this.destroyCommunity(data.id);
            } else if (data instanceof CyDescriptionContainerData) {
                this.cyDescriptionMap.delete(data.id);
            } else if (data instanceof CyTextData) {
                this.cyTextMap.delete(data.id);
            } else {
                throw new Error('not supported');
            }
        }
    }

    public static updateNodePosition(drawService: CanvasDrawService, elementToBeDrawn: NodeWithPosition) {
        const elementInCy = drawService.cy.filter(filterCommonId(elementToBeDrawn.data.id));
        if (elementInCy.length > 0) {
            elementToBeDrawn.position = Object.assign({}, elementInCy.position());
        }
    }

    public static updateCommunityPosition(drawService: CanvasDrawService, communityId: string) {
        const community = drawService.cyState.getCommunityById(communityId)!;
        const communityContainer = drawService.cyState.getVisibleContainerForCyCommunity(communityId);

        // 容器可能也被隐藏了
        if (communityContainer) {
            const container = drawService.cy.filter(filterCommonId(communityContainer.id));

            const newPosition = container.position() as IPoint;
            const oldPosition = community.position;
            if (community.computedCollapsed) {
                if (!!oldPosition) {
                    const positionDiff = {x: newPosition.x - oldPosition.x, y: newPosition.y - oldPosition.y};
                    const cyNodes = drawService.cyState.cyChildNodesByCommunity(community.id);
                    cyNodes.forEach((n) => {
                        n.position.x += positionDiff.x;
                        n.position.y += positionDiff.y;
                    });
                    community.position!.x += positionDiff.x;
                    community.position!.y += positionDiff.y;

                }
            }
            if (!community.isHidden()) {
                community.position = Object.assign({}, newPosition);
            }
        }
    }

    public updateViewport(cy: any) {
        this.zoom = cy.zoom();
        this.pan = {...cy.pan()}; // break reference
    }

    @action
    public addNewCommunity(community: Community) {
        this.communitiesMap.set(community.id, community);
    }

    // 只删除community，所有子元素parent重置为空，但不删除这些子元素
    @action
    public deleteCommunity(cid: string) {
        this.communitiesMap.delete(cid);
        this.cyNodes.forEach((n) => {
            if (n.data.parent === cid) {
                n.data.parent = '';
            }
        });
        this.communities.forEach((c) => {
            if (c.parent === cid) {
                c.parent = '';
            }
        });
    }

    // 删除community以及所有子元素
    private destroyCommunity(cid: string) {
        const community = this.getCommunityById(cid)!;
        if (!community) {
            console.warn('找不到社群' + cid + ',可能在父社群被删除时已经连带删除了');
            return;
        }
        const victimNodesData = this.cyNodes.filter((n) => community.isAncestorOfCyNode(n)).map((n) => n.data);
        this.doRemove(victimNodesData);
        const victimCommunities = this.communities.filter((c) => community.isAncestorOfCommunity(c)).concat(community);
        for (const victimCommunity of victimCommunities) {
            this.communitiesMap.delete(victimCommunity.id);
        }
        debug('以下社群被删除,' + victimCommunities.map(c => c.name).join(','));
    }

    @action
    public clearCommunities() {
        const cids = this.communitiesMap.keys();
        for (const cid of cids) {
            this.deleteCommunity(cid);
        }
    }

    @action
    public clearAll() {
        this.cyEdgesMap.clear();
        this.cyNodesMap.clear();
        this.cyDescriptionMap.clear();
        this.cyTextMap.clear();
        this.communitiesMap.clear();
        this.findPathResults.clear();
    }

    // store退出时清理内存，其实没有存在的必要
    public destroy() {
        this.cyNodesMap.clear();
        this.cyEdgesMap.clear();
        this.cyTextMap.clear();
        this.cyDescriptionMap.clear();
        this.communitiesMap.clear();
        this.findPathResults.clear();
        this.nodeTypeConfigs.clear();
        this.edgeConfigs.clear();
        this.mergedEmis.clear();
        this.canvasSetting = new CanvasSetting();
    }

    @computed
    get isEmpty() {
        return this.cyEdgesMap.size === 0
            && this.cyNodesMap.size === 0
            && this.cyDescriptionMap.size === 0
            && this.cyTextMap.size === 0
            && this.communitiesMap.size === 0
            && this.findPathResults.size === 0;
    }

    @computed
    get edgeByType() {
        const classifier: Classifier<string, CyEdge> = new Classifier();
        for (const edge of this.cyEdges) {
            classifier.add(edge.data.name, edge);
        }
        return classifier;
    }

    // 根据当前边的filter配置获取传递给使用者的结构
    get edgesFilterConfig(): EdgeFieldsFilterConfig {
        if (this.edgeFilterConditions.timeAttributes.length === 0) {
            return {};
        }
        const result: EdgeFieldsFilterConfig = {};
        for (const c of this.edgeFilterConditions.timeAttributes) {
            const relation = c.relation;
            const attr = c.attribute;
            let fieldLimits: FieldLimit[] = result[relation];
            if (!fieldLimits) {
                result[relation] = [];
                fieldLimits = result[relation];
            }
            if (typeof c.condition === 'string') {
                fieldLimits.push({
                    fieldName: attr,
                    openAt: c.condition,
                });
            } else {
                const limit: FieldLimit = {
                    fieldName: attr,
                    openAt: '',
                };
                if (c.condition.from) {
                    limit.from = c.condition.from.valueOf();
                }
                if (c.condition.to) {
                    limit.to = c.condition.to.valueOf();
                }
                fieldLimits.push(limit);
            }
        }
        return result;
    }

    // 获得社群或者CyNode的可视社群节点
    public getVisibleContainerForCyNode(data: CyNodeData) {
        return this.doGetVisibleContainer(data.parent);
    }

    // 如果是社群本身，那么循环从本身开始
    public getVisibleContainerForCyCommunity(communityId: string) {
        return this.doGetVisibleContainer(communityId);
    }

    private doGetVisibleContainer(startId: string) {
        while (startId !== '') {
            const parent = this.getCommunityById(startId)!;
            if (!parent.isHidden()) {
                return parent;
            }
            startId = parent.parent;
        }
        return null;
    }

    public getAllAncestorIds(startId: string, includeSelf = true) {
        const result = includeSelf ? [startId] : [];
        while (startId) {
            const community = this.getCommunityById(startId)!;
            if (community.parent) {
                result.push(community.parent);
                startId = community.parent;
            } else {
                break;
            }
        }
        return result;
    }

    private eligible(data: CyEdgeData | CyNodeData, idOrName: string) {
        idOrName = idOrName.toLowerCase();
        return data.id.toLowerCase().indexOf(idOrName) !== -1
            || data.name.toLowerCase().indexOf(idOrName) !== -1;
    }

    /**
     * 在当前nextState中的所有边和节点中寻找id或者name是否匹配关键字，返回所有这些结果的id
     * @param {string} idOrName
     */
    public searchFor(idOrName: string) {
        const eligibleNodeIds: string[] = this.cyNodes.filter((n) => this.eligible(n.data, idOrName))
            .map(n => n.data.id);

        const eligibleEdgeIds: string[] = this.cyEdges.filter((e) => this.eligible(e.data, idOrName))
            .map(e => e.data.id);
        return [...eligibleEdgeIds, ...eligibleNodeIds];
    }

}
