import {CommonService} from './CommonService';
import {CyNodeData} from '../model/CyNode';
import {NODE_NORMAL_SIZE} from '../../common/cytoscapeCommonStyle';
import {AttributeTab, CanvasContextMenuType} from '../CanvasDrawUtils';
import {NodeShape} from '../interfaces';
import {getTranslation, IDimension, Locales} from '../../../utils';
import {action, computed, observable} from 'mobx';
import {CyEdgeCommonData} from '../model/CyEdgeCommonData';
import {CyFindPathBeaconEdgeData} from '../model/CyFindPathBeaconEdge';
import {convertCurrentStateToDataset} from '../DisplayCanvasUtils';

// 保存所有状态的服务
export class StateService extends CommonService {
    // 当前右击选中的上下文节点
    @observable public canvasContextMenuNode: CyNodeData | null;
    @observable public canvasContextMenuEdge: CyEdgeCommonData | null;
    @observable public canvasContextFindPathEdge: CyFindPathBeaconEdgeData | null;

    // 是否显示算子的上下文菜单
    @observable public showCanvasContextMenu: boolean = false; // 展示时，且renderAsCanvas
    @observable public showNodeNote: boolean = false; // 是否显示 注释弹框，右键添加注释
    @observable public showCanvasTagSelectionModal: boolean = false; // 是否显示 添加标签弹框
    @observable public showCanvasMergeEntitiesModal: boolean = false; // 是否显示 合并实体弹框
    @observable public canvasContextMenuType: CanvasContextMenuType; // 展示时，且renderAsCanvas
    @observable public canvasContextMenuX: number | string = 0; // 展示时，且renderAsCanvas
    @observable public canvasContextMenuY: number | string = 0; // 展示时，且renderAsCanvas
    // renderAsCanvas时的比例
    @observable public canvasRatio: number = 1;
    @observable public attributeTab: AttributeTab = 'CANVAS_INFO';
    @observable public collapseWordTab: boolean = false;

    // 是否显示寻找相邻节点的modal
    @observable public showNeighborFilterModal: boolean = false;
    @observable public showPathDiscoveryModal: boolean = false;
    @observable public showCustomizedCommunityMenu: boolean = false;
    @observable public showFindPathResultModal: boolean = false;
    @observable public showNodeStyleConfigurer: boolean = false;

    // 是否显示最短路径 配置modal
    @observable public showShortestPathConfigModal: boolean = false;

    @observable public lastTimeEntitySize: number = NODE_NORMAL_SIZE;
    @observable public lastTimeEntityShape: NodeShape = 'polygon';
    @observable public lastTimeEntityColor: string = '#35DC57';

    // 社群划分时以该属性进行分组
    @observable public conceptType: string = '';
    @observable public showCommunityPanel: boolean = false;
    @observable public showSettingPanel: boolean = false;
    // 当前上方菜单的tab哪个被选中
    @observable public activeWordTabKey: string = 'style';

    // 统计分析modal
    @observable public showStatsAnalysisModal = false;
    @observable public showDescriptionTextEditor: boolean = false;
    // 关系样式modal
    @observable public showRelationStyleModal = false;
    // 实体样式modal
    @observable public showNodeStyleModal = false;
    // 展示搜索框
    @observable public showSearchBox: boolean = false;
    @observable public textEditorDimension: IDimension | null = null;
    @observable public descriptionTextValue: string = '';

    @action
    public setShowCommunityPanel(val: boolean) {
        this.showCommunityPanel = val;
    }

    @action
    public setShowSettingPanel(val: boolean) {
        this.showSettingPanel = val;
    }

    @action
    public setActiveWordTabKey(key: string) {
        this.activeWordTabKey = key;
    }

    @action
    public setShowRelationStyleModal(val: boolean) {
        this.showRelationStyleModal = val;
    }

    @action
    public setShowNodeStyleModal(val: boolean) {
        this.showNodeStyleModal = val;
    }

    @action
    public setConceptType(val: string) {
        this.conceptType = val;
    }

    @action
    public setCollapseWordTab(val: boolean) {
        this.collapseWordTab = val;
    }

    @action
    public setLastTimeEntitySize(val: number) {
        this.lastTimeEntitySize = val;
    }

    @action
    public setLastTimeEntityShape(val: NodeShape) {
        this.lastTimeEntityShape = val;
    }

    @action
    public setLastTimeEntityColor(val: string) {
        this.lastTimeEntityColor = val;
    }

    @action
    setShowSearchBox(val: boolean) {
        this.showSearchBox = val;
    }

    @action
    setShowDescriptionTextEditor(val: boolean) {
        this.showDescriptionTextEditor = val;
    }

    @action
    setShowStatsAnalysisModal(val: boolean) {
        this.showStatsAnalysisModal = val;
    }

    @action
    openStatsAnalysis(locale: Locales) {
        this.showStatsAnalysisModal = true;
        const schema = this.drawService.canvasStore.displayModePipelineSchema;
        const newDatasets = convertCurrentStateToDataset(locale, schema, this.cyState);
        const defaultType = getTranslation(locale, 'Entity Type');
        this.drawService.statsAnalysisStore.setNewDatasets(newDatasets, defaultType);
    }

    @action
    setTextEditorDimension(val: IDimension) {
        this.textEditorDimension = val;
    }

    @action
    setShowNodeStyleConfigurer(show: boolean) {
        this.showNodeStyleConfigurer = show;
    }

    @action
    setDescriptionTextValue(val: string) {
        this.descriptionTextValue = val;
    }

    @action
    setShowCustomizedCommunityMenu(show: boolean) {
        this.showCustomizedCommunityMenu = show;
    }

    @action
    setShowShortestPathConfigModal(show: boolean) {
        this.showShortestPathConfigModal = show;
    }

    @action
    setShowNeighborFilterModal(val: boolean) {
        this.showNeighborFilterModal = val;
    }

    @action
    setShowMergeEntitiesModal(show: boolean) {
        this.showCanvasMergeEntitiesModal = show;
    }

    @action
    setShowPathDiscoveryModal(val: boolean) {
        this.showPathDiscoveryModal = val;
    }

    @action
    setAttributeTab(tab: AttributeTab) {
        this.attributeTab = tab;
    }

    @action
    public setShowCanvasContextMenu(val: boolean) {
        this.showCanvasContextMenu = val;
    }

    @action
    public setShowFindPathResultModal(val: boolean) {
        this.showFindPathResultModal = val;
    }

    // 修改此方法时不要忘记一起修改下方的方法
    @action
    public closeAllContextMenu() {
        this.showCanvasContextMenu = false;
        this.showNodeNote = false;
        this.showNeighborFilterModal = false;
        this.showShortestPathConfigModal = false;
        this.showPathDiscoveryModal = false;
        this.showCanvasTagSelectionModal = false;
        this.showCustomizedCommunityMenu = false;
        this.showCanvasMergeEntitiesModal = false;
        this.showNodeStyleConfigurer = false;
        this.showDescriptionTextEditor = false;
        this.showCommunityPanel = false;
        this.showSettingPanel = false;
        this.showFindPathResultModal = false;
        this.closeMenuPopovers();
    }

    // 关闭菜单栏中的popover
    public closeMenuPopovers() {
        const popoverOverlays = ['entity-size-configurer-overlay', 'entity-shape-configurer-overlay',
            'border-style-configurer-overlay'];

        popoverOverlays.forEach((className) => {
            const overlay = document.getElementsByClassName(className)[0];
            if (overlay && !overlay.classList.contains('ant-popover-hidden')) {
                overlay.classList.add('ant-popover-hidden');
            }
        });
    }

    // 按delete键删除时，只有所有弹出菜单全部关闭才有效果
    @computed
    get anyContextMenuOpen() {
        return this.showCanvasContextMenu || this.showNodeNote || this.showNeighborFilterModal
            || this.showShortestPathConfigModal || this.showPathDiscoveryModal || this.showCanvasTagSelectionModal
            || this.showCustomizedCommunityMenu || this.showCanvasMergeEntitiesModal
            || this.showNodeStyleConfigurer;
    }

    @action
    public setCanvasRatio(val: number) {
        this.canvasRatio = val;
    }

    @action
    public setCanvasContextMenuType(val: CanvasContextMenuType) {
        this.canvasContextMenuType = val;
    }

    @action
    public setCanvasContextMenuNode(val: CyNodeData | null) {
        this.canvasContextMenuNode = val;
    }

    @action
    public setCanvasContextMenuEdge(val: CyEdgeCommonData | null) {
        this.canvasContextMenuEdge = val;
    }

    @action
    public setCanvasContextFindPathEdge(val: CyFindPathBeaconEdgeData | null) {
        this.canvasContextFindPathEdge = val;
    }

    @action
    public setCanvasContextMenuPosition(x: number | string, y: number | string) {
        this.canvasContextMenuX = x;
        this.canvasContextMenuY = y;
    }

    @action
    public setCanvasContextMenuPositionY(y: number) {
        this.canvasContextMenuY = y;
    }

    @action
    public setCanvasContextMenuPositionX(x: number) {
        this.canvasContextMenuX = x;
    }

    @action
    public setShowNodeNote(show: boolean) {
        this.showNodeNote = show;
    }

    @action
    public setShowCanvasTag(show: boolean) {
        this.showCanvasTagSelectionModal = show;
    }
}
