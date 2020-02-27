import {action, observable, computed} from 'mobx';
import {IPoint, try2ConvertToNumber} from '../../../utils';
import uuidv1 from 'uuid/v1';
import {HasParent} from './CyElement';
import {CyState} from './CyState';
import {CyNode} from './CyNode';

// 社群相关
export class Community implements HasParent {
    @observable public color: string;
    public id: string;
    public nodeType?: string;
    public clusterBy?: string;
    // 自定义社群的名字
    @observable public customizedName: string = '';
    public from: any;
    public to: any;
    @observable public show: boolean = true;
    createdTime: number;
    @observable private collapsed: boolean = false;
    position: IPoint | null;
    @observable public parent = '';
    // 用于分层显示使用，每次都是临时计算的，不需要保存
    childCommunities: Community[] = [];

    public constructor(public cyState: CyState) {
        this.createdTime = +new Date();
    }

    static genId() {
        return 'community' + (uuidv1());
    }

    getCollapsed() {
        return this.collapsed;
    }

    get level() {
        let result = 0;
        let startId = this.parent;
        while (startId !== '') {
            const community = this.cyState.getCommunityById(startId)!;
            startId = community.parent;
            result++;
        }
        return result;
    }

    isHidden(): boolean {
        if (!this.show) {
            return true;
        }

        const activeParents = this.cyState.drawService.dataDriverProcessor.activeParents;
        if (!activeParents.has(this.id)) {
            return true;
        }

        // 一个社群的父节点如果是collapsed的话，也需要隐藏
        if (this.parent !== '') {
            const parent = this.cyState.getCommunityById(this.parent)!;
            if (!parent.show || parent.computedCollapsed) {
                return true;
            }
        }

        return false;
    }

    isAncestorOfCyNode(cyNode: CyNode) {
        return this._ancestorOf(cyNode.data.parent);
    }

    isAncestorOfCommunity(community: Community) {
        if (community.parent) {
            return this._ancestorOf(community.parent);
        }
        return false;
    }

    // 获取当前community的所有子社群
    getAncestorCommunities() {
        return this.cyState.communities.reduce((result, c: Community) => {
            if (c !== this) {
                if (this.isAncestorOfCommunity(c)) {
                    result.push(c);
                }
            }
            return result;
        }, [] as Community[]);
    }

    private _ancestorOf(startId: string) {
        while (startId) {
            if (startId === this.id) {
                return true;
            }
            const community = this.cyState.getCommunityById(startId)!;
            startId = community.parent;
        }
        return false;
    }

    // 一个社群在两种情况下被认为是collapsed，要么是本身被collapsed，
    @computed
    get computedCollapsed() {
        const condition1 = this.collapsed;
        let condition2 = false;

        let parentId = this.parent;
        while (parentId !== '') {
            const parent = this.cyState.getCommunityById(parentId)!;
            if (parent.collapsed) {
                // 不能提前break，需要让mobx完全检测整个hierarchy
                condition2 = true;
            }
            parentId = parent.parent;
        }
        return condition1 || condition2;
    }

    // 手动探索生成的社群
    @action
    static newManualCommunity(cyState: CyState, nodeType: string, clusterBy: string,
                              from: string, to: string) {
        const c = new Community(cyState);
        c.nodeType = nodeType;
        c.clusterBy = clusterBy;
        c.from = from;
        c.to = to;
        c.id = Community.genId();
        c.collapsed = false;
        return c;
    }

    @action
    public setCustomizedName(val: string) {
        this.customizedName = val;
    }

    @action
    public setColor(color: string) {
        this.color = color;
    }

    @action
    public setCollapsed(val: boolean) {
        this.collapsed = val;
    }

    get name() {
        // 自定义社群
        if (this.customizedName) {
            return this.customizedName;
        }
        // 按标签分的社群
        const {nodeType, clusterBy} = this;
        const from = try2ConvertToNumber(this.from.toString());
        const to = try2ConvertToNumber(this.to.toString());
        if (from !== to) {
            return `${clusterBy}=${from}~${to}`;
        } else {
            return `${clusterBy}=${from} (${nodeType})`;
        }
    }

    get simpleName() {
        if (this.customizedName) {
            return this.customizedName;
        }
        const from = try2ConvertToNumber(this.from.toString());
        const to = try2ConvertToNumber(this.to.toString());
        if (from !== to) {
            return `${from}~${to}`;
        } else {
            return `${from}`;
        }
    }

    @action
    setShow(val: boolean) {
        this.show = val;
    }

    toJSON() {
        const result = Object.assign({}, this);
        delete result.cyState;
        return result;
    }

    @action
    static fromJSON(cyState: CyState, json: any) {
        const community = new Community(cyState);
        Object.assign(community, json);
        return community;
    }
}
