// 负责分桶的模块
import {CanvasDrawService} from './CanvasDrawService';
import {Community} from '../model/Community';
import {getTranslation, isNumberType, Locales, try2ConvertToNumber} from '../../../utils';
import {CyNode} from '../model/CyNode';
import {action} from 'mobx';
import {CommonService} from './CommonService';
import {BucketManager} from '../../../algorithms/bucket/BucketManager';
import {EvenSizeStrategy} from '../../../algorithms/bucket/strategy/EvenSizeStrategy';
import {IdentityTransformer} from '../../../algorithms/bucket/transformer/IdentityTransformer';

export class CommunityService extends CommonService {
    constructor(public drawService: CanvasDrawService) {
        super(drawService);
    }

    // 手动探索设置社群
    public async updateManualCommunity(nodeType: string, newType: string, communityCount?: number) {
        if (!newType) {
            this.updateCommunity(nodeType, '', '');
        } else {
            const clusterBy = newType.split(':')[0];
            const clusterByType = newType.split(':')[1];
            this.updateCommunity(nodeType, clusterBy, clusterByType, communityCount);
        }
    }

    // 如果是数字类型，就进行范围分桶
    @action
    private updateCommunity(nodeType: string, clusterBy: string,
                            clusterByType: string, bucketCount: number = 10) {
        this.cyState.clearCommunities();
        // 取消社群分组，重置所有widget的parent属性并直接退出
        if (clusterBy === '') {
            return;
        }

        // 如果是数字类型，统计是否有超过bucketCount个不同的值，如果有的话，就给分成bucketCount个类
        // 如果不是，就假设有超级多的分桶,实际就是模拟一个值一个桶
        if (!isNumberType(clusterByType)) {
            bucketCount = Infinity;
        }

        this.generateNewCommunities(nodeType, clusterBy, clusterByType, bucketCount);
        this.setParentForNodes();
    }

    private generateNewCommunities(nodeType: string, clusterBy: string, clusterByType: string, bucketCount: number) {
        const valueSet: Set<any> = new Set<any>();
        this.cyState.cyNodes.forEach((n: CyNode) => {
            if (n.data.nodeType === nodeType) {
                let v = n.getValue(clusterBy);
                if (v === undefined) {
                    v = 'undefined';
                }
                valueSet.add(v);
            }
        });

        const bucketManager = new BucketManager(new EvenSizeStrategy(), new IdentityTransformer());
        const bucketsInfo = bucketManager.generateBuckets(Array.from(valueSet), bucketCount, clusterByType).reverse();

        for (const b of bucketsInfo) {
            const newCommunity = Community.newManualCommunity(this.cyState, nodeType, clusterBy, b.from, b.to);
            const newColor = this.drawService.colorManager.getColorForType(newCommunity.name);
            newCommunity.setColor(newColor);
            this.cyState.addNewCommunity(newCommunity);
        }
    }

    private setParentForNodes() {
        const cyNodes = this.cyState.cyNodes;
        for (const node of cyNodes) {
            node.data.parent = '';
            for (const community of this.cyState.communities) {
                if (community.nodeType === node.data.nodeType) {
                    // TODO, 当前val可以预留数值转换，比如log
                    const val = node.getValue(community.clusterBy!);
                    if (try2ConvertToNumber(community.from) <= val && try2ConvertToNumber(community.to) >= val) {
                        node.data.parent = community.id;
                        break;
                    }
                }
            }
        }
    }

    @action
    addNewCommunity(locale: Locales) {
        let i = 1;
        const prefix = getTranslation(locale, 'Community');
        const communityNames = Array.from(this.stateService.cyState.communities.values())
            .map((c: Community) => c.name);
        while (true) {
            const newName = prefix + i;
            if (communityNames.includes(newName)) {
                i++;
            } else {
                const newCommunity = new Community(this.cyState);
                newCommunity.id = Community.genId();
                newCommunity.customizedName = newName;
                newCommunity.color = this.drawService.colorManager.getColorForType(newCommunity.id);
                this.cyState.setNoRedraw(true);
                this.cyState.addNewCommunity(newCommunity);
                return;
            }
        }
    }

    @action
    public setCommunityColor(c: Community, newColor: string) {
        c.setColor(newColor);
    }

    @action
    public deleteCommunityNode(cid: string) {
        this.cyState.deleteCommunity(cid);
    }

    @action
    public clearCommunities() {
        this.cyState.clearCommunities();
    }

    @action
    public collapseAllCommunities = () => {
        this.cyState.setNoRedraw(false);
        this.cyState.communities.forEach((c) => c.setCollapsed(true));
    }

    @action
    public expandAllCommunities = () => {
        const cs = this.cyState;
        cs.setNoRedraw(false);
        cs.noReconcile = true;
        cs.communitiesToBeExpanded.clear();
        cs.communities.forEach((c) => {
            c.setCollapsed(false);
            cs.communitiesToBeExpanded.add(c.id);
        });
    }

    @action
    public expandCommunity(cid: string, recursive: boolean) {
        const cs = this.cyState;
        cs.noReconcile = true;
        cs.setNoRedraw(false);
        const cte = cs.communitiesToBeExpanded;
        cte.clear();
        const community = cs.getCommunityById(cid)!;

        const childCommunities = recursive ? community.getAncestorCommunities() : [];
        cte.add(cid);
        community.setCollapsed(false);

        for (const child of childCommunities) {
            cte.add(child.id);
            child.setCollapsed(false);
        }
    }

    @action
    public collapseCommunity(cid: string) {
        this.cyState.setNoRedraw(false);
        const community = this.cyState.getCommunityById(cid)!;
        community.setCollapsed(true);
    }

}
