import {CommonService} from './CommonService';
import {EdgeConfig} from '../model/EdgeConfig';
import {Community} from '../model/Community';
import {NodeTypeConfig} from '../model/NodeTypeConfig';

export class VisibilityService extends CommonService {
    public setNodeTypeVisibility(nodeType: NodeTypeConfig, show: boolean) {
        this.cyState.noReconcile = true;
        nodeType.setShow(show);
    }

    public setEdgeTypeVisibility(edgeType: EdgeConfig, show: boolean) {
        this.cyState.noReconcile = true;
        edgeType.setShow(show);
    }

    public setCommunityVisibility(community: Community, show: boolean) {
        this.cyState.noReconcile = true;
        community.setShow(show);
    }
}
