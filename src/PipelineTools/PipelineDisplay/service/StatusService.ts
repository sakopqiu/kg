import {CommonService} from './CommonService';
import {computed} from 'mobx';

export class StatusService extends CommonService {

    get edgeClicked() {
        return this.stateService.canvasContextMenuType === 'EDGE';
    }

    get communityClicked() {
        return this.stateService.canvasContextMenuType === 'COMMUNITY';
    }

    get bgClicked() {
        return this.stateService.canvasContextMenuType === 'BACKGROUND';
    }

    get normalNodeClicked() {
        return this.stateService.canvasContextMenuType === 'NODE';
    }

    get findPathEdgeClicked() {
        return this.stateService.canvasContextMenuType === 'FIND_PATH_EDGE';
    }

    @computed
    private get selectedNodesData() {
        return this.helperService.selectedCyNodesData;
    }

    @computed
    private get selectedCyEdgesCommonData() {
        return this.helperService.selectedCyEdgesCommonData;
    }

    @computed
    get menuOnlyForBgContext() {
        return this.selectedCyEdgesCommonData.length === 0 && this.selectedNodesData.length === 0 && (this.bgClicked);
    }

    @computed
    get menuShowForSingleNode() {
        return this.showForSingleNode && (this.normalNodeClicked || this.bgClicked);
    }

    @computed
    get showForSingleNode() {
        return this.selectedNodesData.length === 1;
    }

    @computed
    get showForSingleEdge() {
        return this.selectedCyEdgesCommonData.length === 1;
    }

    @computed
    get isAnyEdgesSelected() {
        return this.selectedCyEdgesCommonData.length > 0;
    }

    @computed
    get menuShowForMultipleNodes() {
        return this.showForMultipleNodes && (this.normalNodeClicked || this.bgClicked);
    }

    @computed
    get showForMultipleNodes() {
        return this.selectedNodesData.length > 1;
    }

    @computed
    get menuShowDeleteSelected() {
        const h = this.helperService;
        // 都需要被计算。不然mobx检测不到后面的条件
        const c1 = h.selectedCyNodes.length > 0;
        const c2 = h.selectedCyEdgesCommon.length > 0;
        const c3 = h.selectedCyTexts.length > 0;
        const c4 = h.selectedCyDescriptionContainers.length > 0;
        const c5 = h.selectedFindResultBeacons.length > 0;
        const c6 = h.isCollapsedCommunityClicked;
        return c1 || c2 || c3 || c4 || c5 || c6;
    }

}
