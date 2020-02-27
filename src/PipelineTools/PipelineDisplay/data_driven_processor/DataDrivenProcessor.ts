import {CanvasDrawService} from '../service/CanvasDrawService';
import {CyNode} from '../model/CyNode';
import {computed} from 'mobx';
import {CyEdge, CyEdgeData} from '../model/CyEdge';
import {cytoStyle} from '../service/style';
import {CommonService} from '../service/CommonService';
import {CyCommunityNode} from '../model/CyCommunityNode';
import {CyEdgeCommon} from '../model/CyEdgeCommonData';
import {CyElement} from '../model/CyElement';
import {CyEdgeGroup} from '../model/CyEdgeGroup';
import {EvenRangeStrategy} from '../../../algorithms/bucket/strategy/EvenRangeStrategy';
import {BucketManager} from '../../../algorithms/bucket/BucketManager';
import {CyDescriptionContainer} from '../model/CyDescriptionContainer';
import {CyText} from '../model/CyText';
import _every from 'lodash/every';
import {PERFORMANCE_THRESHOLD} from '../interfaces';
import {TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';
import {CyFindPathBeaconEdge} from '../model/CyFindPathBeaconEdge';
import {filterCommonId} from '../../../utils';

export class DataDrivenProcessor extends CommonService {

    constructor(drawService: CanvasDrawService) {
        super(drawService);
    }

    // 根据时间范围处于可视范围的元素
    @computed
    public get eligibleElementsIds() {
        const filterRange = this.timeFilterService.timeFilterRange;
        const result: Set<string> = new Set<string>();
        if (filterRange.size === 0) {
            return result;
        }
        const {series} = this.stateService.statsService.statsForTimeProperty;

        for (const currSeries of series) {
            if (!filterRange.has(currSeries.seriesName)) {
                continue;
            }
            const xAxisIndices = filterRange.get(currSeries.seriesName)!;
            for (const xAxisIndex of xAxisIndices) {
                const dataArr = currSeries.data[xAxisIndex];
                if (!dataArr) {// 展开时间过滤并且删除一个community时会npe
                    continue;
                }
                for (const data of dataArr) {
                    result.add(data.id);
                    // 如果是边的话，要把他的src和target也算上，即使他们不符合时间条件
                    if (data instanceof CyEdgeData) {
                        const srcNode = this.cyState.cyNode(data.source)!;
                        const targetNode = this.cyState.cyNode(data.target)!;
                        if (!srcNode.isHidden() && !targetNode.isHidden()) {
                            result.add(data.source);
                            result.add(data.target);
                        }
                    }
                }
            }
        }
        return result;
    }

    @computed
    get allVisibleNormalNodes(): CyNode[] {
        const cStart = performance.now();
        const result: CyNode[] = [];

        this.cyState.cyNodes
            .forEach((n: CyNode) => {
                const isTempHidden = n.hasClass(TEMP_HIDDEN_CLASS);
                // 时间序列里，可能会改变节点的class，所以每次重绘前先重置一下
                // 但是cyState.addNodes中为了防止新元素闪屏，会把新节点添加一个hidden-element类
                // 这个还是需要加回去的
                n.resetClassSet();
                if (isTempHidden) {
                    n.becomeTempInvisible();
                }
                if (!n.isHidden()) {
                    if (this.timeFilterService.showTimeFilter) {
                        const eligibleElementsIds = this.eligibleElementsIds;
                        if (!eligibleElementsIds.has(n.data.id)) {
                            if (this.cyState.transparentizeElements) {
                                n.transparentize();
                            } else {// 不加入该元素到渲染列表
                                return;
                            }
                        }
                    }
                    result.push(n);
                }
            });

        const cEnd = performance.now();
        console.log('C ' + (cEnd - cStart));
        return result;
    }

    @computed
    get allVisibleNormalNodeIds() {
        return new Set<string>(this.allVisibleNormalNodes.map((n) => n.data.id));
    }

    deducedEdge(id: string) {
        return this.allVisibleEdges.find((e) => e.data.id === id);
    }

    // 为了避免混淆，和普通的edge以及edgeGroup区分
    @computed
    get allFindPathEdges(): CyFindPathBeaconEdge[] {
        const result: CyFindPathBeaconEdge[] = [];
        const findPathEdges = this.cyState.findPathResults.values();
        for (const pathEdge of findPathEdges) {
            if (!pathEdge.isHidden()) {
                result.push(pathEdge);
                pathEdge.selfLoopSetup();
            }
        }
        return result;
    }

    @computed
    get allVisibleEdges(): CyEdgeCommon[] {
        const eStart = performance.now();
        const finalEdges: CyEdgeCommon[] = [];
        const visibleEdges: CyEdge[] = [];
        // filter隐藏的，并且对边进行一些属性的重设
        this.cyState.cyEdges.forEach((e: CyEdge) => {
            if (!e.isHidden()) {
                if (this.timeFilterService.showTimeFilter) {
                    const eeids = this.eligibleElementsIds;

                    if (!eeids.has(e.data.id)) {
                        if (this.cyState.transparentizeElements) {
                            e.transparentize();
                        } else {// 不加入该元素到渲染列表
                            return;
                        }
                    }
                }
                visibleEdges.push(e);
            }
        });

        const eeids = this.eligibleElementsIds;
        // key为mei，value是相同mei的所有边, 只有有任意一条边是新加入的，那么edgeGroup也要被选中
        const emiEdgesMap: Map<string, CyEdge[]>
            = new Map<string, CyEdge[]>();

        // 对所有可见边进行分类，如果该边的emi是合并的话，那么键入到map里，不然加入到finalEdges里
        for (const edge of visibleEdges) {
            if (edge.data.isMerged) {
                const mei = edge.data.emi;
                let classmates = emiEdgesMap.get(mei);
                if (!classmates) {
                    classmates = [];
                    emiEdgesMap.set(mei, classmates);
                }
                classmates.push(edge);
            } else {
                finalEdges.push(edge);
            }
        }

        // bucketManager根据cyEdgeGroup的所有weight值进行分桶
        const subEdgesCount = [];

        for (const key of emiEdgesMap.keys()) {
            const arr = emiEdgesMap.get(key)!;

            const child = arr[0].data;
            const edgeGroup = new CyEdgeGroup(this.cyState, child.source, child.target, child.name);
            edgeGroup.data.childrenCount = arr.length;
            edgeGroup.data.weight = arr.length;

            // 如果该edgeGroup中所有元素都不在时间框内，那么该edgeGroup也设置半透明或不可见
            // TODO此处可在之前的for循环进行优化
            if (this.timeFilterService.showTimeFilter) {

                if (_every(arr, (e) => !eeids.has(e.data.id))) {
                    if (this.cyState.transparentizeElements) {
                        edgeGroup.transparentize();
                    } else {// 不加入该元素到渲染列表
                        continue;
                    }
                }
            }

            // 如果某个edgeGroup已经存在在图上了，就不需要让他暂时变成透明的
            // 不然为了防止闪屏，暂时让他变成透明的
            if (this.cy && this.cy.filter(filterCommonId(edgeGroup.data.id)).length === 0) {
                edgeGroup.becomeTempInvisible();
            }
            finalEdges.push(edgeGroup);
            subEdgesCount.push(arr.length);
        }

        const bucketManager = new BucketManager(new EvenRangeStrategy());
        bucketManager.generateBuckets(subEdgesCount, 5, '');
        finalEdges.forEach((edge: CyEdgeCommon) => {
            if (edge instanceof CyEdgeGroup) {
                edge.data.factorIndex = bucketManager.getBucketPositionForElement(edge.data.childrenCount);
            }
        });

        for (const edge of finalEdges) {
            edge.selfLoopSetup();
        }

        const eEnd = performance.now();
        console.log('E ' + (eEnd - eStart));
        return finalEdges;
    }

    @computed
    get activeParents() {
        const allParents = this.allVisibleNormalNodes.reduce((set: Set<string>, current: CyNode) => {
            if (current.data.parent) {
                for (const ancestor of this.cyState.getAllAncestorIds(current.data.parent)) {
                    set.add(ancestor);
                }
            }
            return set;
        }, new Set<string>());
        return allParents;
    }

    @computed
    get allVisibleCommunityNodes(): CyCommunityNode[] {
        const ret: CyCommunityNode[] = [];
        // 计算所有节点的父节点，如果一个社群一个子节点都不显示的话，就不显示他了
        const activeParents = this.activeParents;
        for (const community of this.cyState.communities) {
            if (activeParents.has(community.id) && !community.isHidden()) {
                const node: CyCommunityNode = new CyCommunityNode(this.cyState);
                // 社群节点id和社群id保持一致，社群id是uuidv1随机生成的
                node.data.id = community.id;
                node.data.name = community.name;
                node.data.parent = community.parent;

                if (community.computedCollapsed) {
                    node.switchToCollapsedMode();
                }

                ret.push(node);

                if (this.timeFilterService.showTimeFilter) {
                    const eeids = this.eligibleElementsIds;

                    const children = this.cyState.cyNodesByCommunity(community.id);
                    if (_every(children, (e) => !eeids.has(e.data.id))) {
                        if (this.cyState.transparentizeElements) {
                            node.transparentize();
                        } else {// 不加入该元素到渲染列表
                            continue;
                        }
                    }
                }
            }
        }
        return ret;
    }

    @computed
    get allVisibleCyDescriptionContainers(): CyDescriptionContainer[] {
        return this.cyState.cyDescriptionContainers;
    }

    @computed
    get allVisibleCyTexts(): CyText[] {
        return this.cyState.cyTexts;
    }

    @computed
    get nextState() {
        let elements: CyElement[] = [];
        const nextStateStart = performance.now();
        const aStart = performance.now();
        const bStart = performance.now();
        this.algorithmService.resetPageRankRange(this.cyState.allCyNodesData);
        let allNodes = this.allVisibleNormalNodes;
        const bEnd = performance.now();

        const dStart = performance.now();
        let allEdges = this.allVisibleEdges;
        const dEnd = performance.now();
        const aEnd = performance.now();
        console.log('A ' + (aEnd - aStart));
        console.log('B ' + (bEnd - bStart));
        console.log('D ' + (dEnd - dStart));

        // 隐藏显示不需要的社群节点
        const allCommunityNodes = this.allVisibleCommunityNodes;
        // 由于CyCommunityNode是计算并缓存在内存中的，下一次计算可能因为没有任何相关的改变而继续使用缓存的值，所以需要手动清一下
        allCommunityNodes.forEach((c) => c.becomeVisible());

        // 合并社群的id集合
        const accIds = this.cyState.collapsedCommunitiesIds;
        let beaconEdges = this.allFindPathEdges;
        // 如果存在被合并的社群
        if (accIds.size > 0) {
            // 先删除内部边
            allEdges = allEdges.filter((e) => {
                return this.filterEdgesInSameAcc(e, allNodes);
            });

            // 调整边的src和target
            allEdges = allEdges.map((e: CyEdgeCommon) => {
                return this.resetEdgeSourceTarget(e, allNodes) as CyEdgeCommon;
            });

            // 先删除内部边
            beaconEdges = beaconEdges.filter((e) => {
                return this.filterEdgesInSameAcc(e, allNodes);
            });
            beaconEdges = beaconEdges.map((e: CyFindPathBeaconEdge) => {
                return this.resetEdgeSourceTarget(e, allNodes) as CyFindPathBeaconEdge;
            });

            // 不显示所有位于集群里的节点
            allNodes = allNodes.filter((n) => {
                return !accIds.has(n.data.parent);
            });
        }

        this.hideExpandedCommunities(allNodes, allEdges, beaconEdges, allCommunityNodes);

        elements = elements.concat(allNodes).concat(allEdges)
            .concat(beaconEdges)
            .concat(allCommunityNodes).concat(this.allVisibleCyDescriptionContainers)
            .concat(this.allVisibleCyTexts);
        const performanceMode = elements.length > PERFORMANCE_THRESHOLD;

        const nextStateEnd = performance.now();
        console.log('nextState total: ' + (nextStateEnd - nextStateStart));

        return {
            nodeCount: allNodes.length,
            elements,
            style: cytoStyle as any,
            wheelSensitivity: .5,
            hideEdgesOnViewport: performanceMode,
        };
    }

    // 为了防止社群展开时闪屏，先把他的子节点变成不可见
    private hideExpandedCommunities(allNodes: CyNode[], allEdges: CyEdgeCommon[], allBeaconEdges: CyFindPathBeaconEdge[],
                                    communityNodes: CyCommunityNode[],
    ) {

        const cte = this.cyState.communitiesToBeExpanded;
        const hiddenNodeIds: Set<string> = new Set<string>();
        for (const cyNode of allNodes) {
            if (cte.has(cyNode.data.parent)) {
                cyNode.becomeTempInvisible();
                hiddenNodeIds.add(cyNode.data.id);
            }
        }
        for (const cyEdge of allEdges) {
            if (hiddenNodeIds.has(cyEdge.data.source) || hiddenNodeIds.has(cyEdge.data.target)) {
                cyEdge.becomeTempInvisible();
            }
        }
        for (const bEdge of allBeaconEdges) {
            if (hiddenNodeIds.has(bEdge.data.source) || hiddenNodeIds.has(bEdge.data.target)) {
                bEdge.becomeTempInvisible();
            }
        }
        for (const communityNode of communityNodes) {
            if (cte.has(communityNode.data.id)) {
                communityNode.becomeTempInvisible();
            }
        }

    }

    // 过滤掉所有位于一个社群里的边，并且改边已经出于collapsed模式
    private filterEdgesInSameAcc(e: CyEdgeCommon | CyFindPathBeaconEdge, allNodes: CyNode[]) {
        const accIds = this.cyState.collapsedCommunitiesIds;
        const data = e.data;
        const sourceNode = allNodes.find((n) => n.data.id === data.source)!;
        const targetNode = allNodes.find((n) => n.data.id === data.target)!;

        const sourceNodeContainer = this.cyState.getVisibleContainerForCyNode(sourceNode.data)!;
        const targetNodeDataParent = this.cyState.getVisibleContainerForCyNode(targetNode.data)!;
        const sourceNodeContainerId = sourceNodeContainer ? sourceNodeContainer.id : '';
        return !(sourceNodeContainer === targetNodeDataParent && accIds.has(sourceNodeContainerId));
    }

    // 对于合并的节点直接的边，重新设置他们的src和target
    private resetEdgeSourceTarget(e: CyEdgeCommon | CyFindPathBeaconEdge, allNodes: CyNode[]) {
        const data = e.data;
        const accIds = this.cyState.collapsedCommunitiesIds;
        const sourceNode = allNodes.find((n) => n.data.id === data.source)!;
        const sourceNodeParent = sourceNode.data.parent;
        const targetNode = allNodes.find((n) => n.data.id === data.target)!;
        const targetNodeParent = targetNode.data.parent;

        // 因为要修改边的src和target，需要深度clone一个对象出来
        if (accIds.has(sourceNodeParent) || accIds.has(targetNodeParent)) {
            let result = null;
            if (e instanceof CyEdge) {
                result = CyEdge.clone(e, this.cyState);
            } else if (e instanceof CyEdgeGroup) {
                result = CyEdgeGroup.fromJSON(e, this.cyState);
            } else if (e instanceof CyFindPathBeaconEdge) {
                result = CyFindPathBeaconEdge.fromJSON(e, this.cyState);
            } else {
                throw new Error('Logic not implemented');
            }

            if (accIds.has(sourceNodeParent)) {
                result.data.originalSrcId = e.data.source;
                result.data.source = this.cyState.getVisibleContainerForCyNode(sourceNode.data)!.id;
            }
            if (accIds.has(targetNodeParent)) {
                result.data.originalTargetId = e.data.target;
                result.data.target = this.cyState.getVisibleContainerForCyNode(targetNode.data)!.id;
            }
            return result;
        } else {
            return e;
        }
    }
}
