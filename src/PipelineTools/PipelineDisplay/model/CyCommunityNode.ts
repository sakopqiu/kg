import {CyElement, CyElementData, CyType, HasParent} from './CyElement';
import {ElementGroup} from 'cytoscape';
import {CyState} from './CyState';
import {computed} from 'mobx';
import {CyElementDefaultClass} from '../interfaces';

export class CyCommunityNodeData extends CyElementData implements HasParent {
    public name: string;
    public id: string;
    public parent: string = '';

    get cyType() {
        return CyType.COMMUNITY;
    }

    get displayName() {
        return this.cyState!.cyNodesByCommunity(this.id).length;
    }

    get backgroundColor() {
        return this.cyState!.getCommunityById(this.id)!.color;
    }

    static fromJSON(json: any, cyState: CyState) {
        const ret = new CyCommunityNodeData(cyState);
        ret.id = json.id;
        ret.name = json.name;
        return ret;
    }
}

export class CyCommunityNode extends CyElement {
    static defaultClass = 'normal-community';

    public data: CyCommunityNodeData = new CyCommunityNodeData(this.cyState);

    get group() {
        return 'nodes' as ElementGroup;
    }

    public transparentize() {
        this.addClass('low-priority-community-node');
    }

    @computed
    get selected() {
        const children = this.cyState!.cyNodesByCommunity(this.data.id)!;
        let result = false;
        for (const c of children) {
            if (c.selected) {
                result = true;
            }
        }
        return result;
    }

    get selectable() {
        return this.hasClass(CyElementDefaultClass.COLLAPSED_COMMUNITY);
    }

    switchToCollapsedMode() {
        this.addClass(CyElementDefaultClass.COLLAPSED_COMMUNITY);
    }

    get position() {
        const community = this.cyState!.getCommunityById(this.data.id)!;
        if (community.computedCollapsed) {
            return Object.assign({}, community.position);
        } else {
            return null;
        }
    }

    static fromJSON(json: any, cyState: CyState) {
        const ret = new CyCommunityNode(cyState);
        ret.initClassSet(json.classSet);
        ret.data = CyCommunityNodeData.fromJSON(json.data, cyState);
        return ret;
    }

}
