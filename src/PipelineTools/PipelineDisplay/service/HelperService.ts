/**
 * 定义所有的工具便捷方法
 */
import {CommonService} from './CommonService';
import {CanvasDrawService} from './CanvasDrawService';
import {CyNode, CyNodeData} from '../model/CyNode';
import {computed} from 'mobx';
import {CyElementData, CyType} from '../model/CyElement';
import {CyEdgeCommon, CyEdgeCommonData} from '../model/CyEdgeCommonData';
import {CyText} from '../model/CyText';
import {CyDescriptionContainer} from '../model/CyDescriptionContainer';
import {CyEdge} from '../model/CyEdge';
import {CyFindPathBeaconEdge} from '../model/CyFindPathBeaconEdge';
import {filterCommonId} from '../../../utils';
import {Community} from '../model/Community';
import {CyElementDefaultClass} from '../interfaces';

const normalNodesFilter = (n: any) => n.hasClass('normal') || n.hasClass(CyElementDefaultClass.COLLAPSED_COMMUNITY);

export class HelperService extends CommonService {
    constructor(drawService: CanvasDrawService) {
        super(drawService);
    }

    // 后缀带onCanvas或者方法名里有selected都是cytoscape图上的元素，后缀带有data的是cyState里的数据
    cySelectedEdges(): any {
        if (!this.cy) {
            return [];
        }
        return this.cy.edges(':selected');
    }

    cySelectedNodes(): any {
        return this.cy.nodes(':selected')
            .filter(normalNodesFilter);
    }

    /* 以下是CyState中的数据 */

    // 所有可以被移动到其他社群的节点
    cyMovableNodesData(): CyNodeData[] {
        return this.selectedCyNodesData.filter((data) => {
            return this.cy.filter(filterCommonId(data.id)).length > 0;
        });
    }

    cyMovableCommunities(): Community[] {
        return this.cy.filter(`node.${CyElementDefaultClass.COLLAPSED_COMMUNITY}:selected`).map((n: any) => {
            return this.cyState.getCommunityById(n.id())!;
        });
    }

    @computed
    get selectedCyNodes(): CyNode[] {
        return this.cyState.cyNodes.filter((n) => n.selected);
    }

    @computed
    get selectedCyTexts(): CyText[] {
        return this.cyState.cyTexts.filter((n) => n.selected);
    }

    @computed
    get selectedFindResultBeacons(): CyFindPathBeaconEdge[] {
        return Array.from(this.cyState.findPathResults.values()).filter((n) => n.selected);
    }

    @computed
    get isCollapsedCommunityClicked() {
        if (this.stateService.canvasContextMenuType === 'COMMUNITY') {
            const node = this.stateService.canvasContextMenuNode;
            if (!node) {
                return false;
            }
            const community = this.cyState.getCommunityById(node.id)!;
            return community.getCollapsed();
        }
        return false;
    }

    @computed
    get selectedCyDescriptionContainers(): CyDescriptionContainer[] {
        return this.cyState.cyDescriptionContainers.filter((n) => n.selected);
    }

    @computed
    get selectedCyNodesData(): CyNodeData[] {
        return this.selectedCyNodes.map((n) => n.data);
    }

    @computed
    get selectedCyEdgesCommon(): CyEdgeCommon[] {
        return this.dataDriverProcessor.allVisibleEdges.filter((e) => e.selected)
            .map((e: CyEdgeCommon) => {
                // ddp计算出来的cyEdge不会带上params
                if (e instanceof CyEdge) {
                    return this.cyState.cyEdge(e.data.id)!;
                } else {
                    return e;
                }
            });
    }

    @computed
    get selectedCyEdgesCommonData(): CyEdgeCommonData[] {
        return this.selectedCyEdgesCommon.map((e) => e.data);
    }

    selectedElementsData(): CyElementData[] | never {
        const cyState = this.cyState;
        const ddp = this.dataDriverProcessor;
        return this.cy.elements(':selected')
            .filter((n: any) => {
                const data = n.data() as CyElementData;
                const type: CyType = data.cyType;
                if (type === 'COMMUNITY') {// 只有当community为collapse时才能被选中
                    const community = this.cyState.getCommunityById(data.id)!;
                    return community.getCollapsed();
                }
                return true;
            })
            .map((n: any) => {
                const data = n.data() as CyElementData;
                const id = data.id;
                const type: CyType = data.cyType;
                switch (type) {
                    case 'NODE':
                        return cyState.cyNode(id)!.data;
                    case 'EDGE':
                    case 'EDGEGROUP':
                        return ddp.allVisibleEdges.find((e) => e.data.id === id)!.data;
                    case 'PATH_BEACON_EDGE':
                        return cyState.findPathResults.get(data.id)!.data;
                    case 'COMMUNITY':
                        return ddp.allVisibleCommunityNodes.find((c) => c.data.id === id)!.data;
                    case 'DESCRIPTION':
                        return cyState.cyDescriptionContainer(id)!.data;
                    case 'TEXT':
                        return cyState.cyText(id)!.data;
                    default:
                        throw new Error('not implemented');
                }
            });
    }
}
