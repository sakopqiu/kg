import {CanvasDrawService} from './CanvasDrawService';
import {filterCommonId, getLayoutSpecificConfigs} from '../../../utils';
import {CyNode} from '../model/CyNode';
import {CommonService} from './CommonService';
import {action, runInAction} from 'mobx';
import {CyElementDefaultClass} from '../interfaces';

export class SelectionService extends CommonService {
    constructor(public drawService: CanvasDrawService) {
        super(drawService);
    }

    @action
    public invertSelection(includeAuxiliaryElements = true) {
        const cy = this.cyState;
        for (const cyNode of cy.cyNodes) {
            cyNode.setSelected(!cyNode.selected);
            if (cyNode.isHidden()) {
                cyNode.setSelected(false);
            }
        }
        for (const cyEdge of cy.cyEdges) {
            cyEdge.setSelected(!cyEdge.selected);
            if (cyEdge.isHidden()) {
                cyEdge.setSelected(false);
            }
        }
        for (const bEdge of cy.cyBeaconEdges) {
            bEdge.setSelected(!bEdge.selected);
            if (bEdge.isHidden()) {
                bEdge.setSelected(false);
            }
        }

        if (includeAuxiliaryElements) {
            for (const container of cy.cyDescriptionContainers) {
                container.setSelected(!container.selected);
            }
            for (const text of cy.cyTexts) {
                text.setSelected(!text.selected);
            }
        }
        cy.noLoadingEffect = true;
        cy.centerSelectedNodes = false;
    }

    // 将currentIds设置为非选择状态，剩余的设置为选择状态
    @action
    public invertSelectionBy(currentIds: string[]) {
        const cy = this.cyState;
        const currentIdSet: Set<string> = new Set<string>(currentIds);
        for (const cyNode of cy.cyNodes) {
            if (cyNode.isHidden()) {
                cyNode.setSelected(false);
            } else {
                cyNode.setSelected(!currentIdSet.has(cyNode.data.id));
            }
        }
        for (const cyEdge of cy.cyEdges) {
            if (cyEdge.isHidden()) {
                cyEdge.setSelected(false);
            } else {
                cyEdge.setSelected(!currentIdSet.has(cyEdge.data.id));
            }
        }

        cy.noLoadingEffect = true;
        cy.centerSelectedNodes = false;
    }

    @action
    unselectAll() {
        const cy = this.cyState;
        for (const cyNode of cy.cyNodes) {
            cyNode.setSelected(false);
        }
        for (const cyEdge of cy.cyEdges) {
            cyEdge.setSelected(false);
        }

        for (const container of cy.cyDescriptionContainers) {
            container.setSelected(false);
        }
        for (const text of cy.cyTexts) {
            text.setSelected(false);
        }

        cy.noLoadingEffect = true;
        cy.centerSelectedNodes = false;
    }

    @action
    selectAll() {
        const cy = this.cyState;
        for (const cyNode of cy.cyNodes) {
            cyNode.setSelected(!cyNode.isHidden());
        }
        for (const cyEdge of cy.cyEdges) {
            cyEdge.setSelected(!cyEdge.isHidden());
        }
        for (const beaconEdge of cy.cyBeaconEdges) {
            beaconEdge.setSelected(!beaconEdge.isHidden());
        }

        for (const container of cy.cyDescriptionContainers) {
            container.setSelected(false);
        }
        for (const text of cy.cyTexts) {
            text.setSelected(false);
        }

        cy.noLoadingEffect = true;
        cy.centerSelectedNodes = false;
    }

    selectNodeType(nodeType: string) {
        const ids = this.cyState.cyNodesByNodeType(nodeType).map((n: CyNode) => n.data.id);
        this.selectElementsByIds(ids);
    }

    selectEdgesByLabel(label: string) {
        const edgeConfig = this.cyState.edgeConfigs.get(label)!;
        if (edgeConfig.show) {
            const ids = this.cyState.cyEdges.filter((e) => e.data.name === label && !e.isHidden()).map((e) => e.data.id);
            this.selectionService.selectElementsByIds(ids);
        }
    }

    selectElementsByIds(ids: string[], needCenter: boolean = true, appendMode: boolean = false) {
        if (ids.length === 0) {
            return;
        }
        const idSet = new Set<string>(ids);

        const cyState = this.cyState;
        runInAction(() => {
            // id要么是边要么是node，因为边和node的id结构不同，理论上不会冲突
            cyState.noLoadingEffect = true;
            cyState.centerSelectedNodes = needCenter;

            for (const cyNode of cyState.cyNodes) {
                if (idSet.has(cyNode.data.id)) {
                    cyNode.setSelected(true);
                } else if (!appendMode) {
                    cyNode.setSelected(false);
                }
            }

            for (const cyEdge of cyState.cyEdges) {
                if (idSet.has(cyEdge.data.id)) {
                    cyEdge.setSelected(true);
                } else if (!appendMode) {
                    cyEdge.setSelected(false);
                }
            }
        });
    }

    selectNodesByTag(tag: string, needCenter: boolean = true) {
        const cyNodes = this.cyState.visibleCyNodes.filter((n: CyNode) => {
            return n.data.tags.includes(tag);
        });
        const ids = cyNodes.map((n: any) => n.data.id);
        this.selectElementsByIds(ids);
    }

    selectCommunity(communityId: string, needCenter = true, e?: any) {
        const cyNodes = this.cyState.cyNodesByCommunity(communityId);
        const ids = cyNodes.map((n) => n.data.id);
        this.selectElementsByIds(ids, needCenter, e && e.originalEvent && e.originalEvent.metaKey);
    }

    public selectNeighboringNodes() {
        this.cy.batch(() => {
            const nodes = this.helperService.cySelectedNodes() as any;
            nodes.neighborhood('node').select();
            const edges = this.helperService.cySelectedEdges() as any;
            edges.connectedNodes().select();
        });
    }

    public selectNeighboringEdges() {
        const nodes = this.helperService.cySelectedNodes() as any;
        nodes.connectedEdges().select();
    }

    public selectAllNeighbors() {
        this.cy.batch(() => {
            const nodes = this.helperService.cySelectedNodes() as any;
            nodes.neighborhood().select();
            const edges = this.helperService.cySelectedEdges() as any;
            edges.connectedNodes().select();
        });
    }

    public selectLeafNodes() {
        const leafNodes = this.cy.filter((n: any) => {
            return n.is(`node.${CyElementDefaultClass.NORMAL_NODE}`) && n.outdegree(true) === 0;
        }).map((n: any) => n.id());
        return this.selectElementsByIds(leafNodes);
    }

    public layoutSelected(layout: string) {
        const selectedElements = this.cy.filter(`node.${CyElementDefaultClass.NORMAL_NODE}:selected,node.${CyElementDefaultClass.COLLAPSED_COMMUNITY},edge:selected`);
        // 如果节点被选中的话，他们的parent也要被选中
        const communityIds = new Set<string>();
        selectedElements.forEach((ele: any) => {
            if (ele.isNode() && ele.data().parent) {
                communityIds.add(filterCommonId(ele.data().parent));
            }
        });
        if (communityIds.size > 0) {
            const allCommunities = this.cy.filter(Array.from(communityIds).join(','));
            selectedElements.merge(allCommunities);
        }

        const layoutConfig = getLayoutSpecificConfigs(layout, 0);
        layoutConfig.boundingBox = selectedElements.boundingBox();
        layoutConfig.fit = false;
        console.log('Select layout config', layoutConfig);
        selectedElements.layout({
            ...layoutConfig,
            stop: () => {
                this.historyService.push();
            },
        }).run();
    }
}
