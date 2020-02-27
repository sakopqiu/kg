import {COMMON_OPACITY, CyDiffCommon, CyDiffCommonData} from './CyDiffCommon';
import {ElementGroup} from 'cytoscape';
import DeleteAction from '../../../../../../images/diff/deleteAction.jpg';
import EditAction from '../../../../../../images/diff/editAction.jpg';
import AddAction from '../../../../../../images/diff/addAction.jpg';
import {VertexDataJson} from '../../../../kg-interface';
import {IconType} from '../../../../interfaces';
import {elementAttr, vertexName} from '../../../../DisplayCanvasUtils';
import {trimStr} from '../../../../../../utils';
import {BACKGROUND_IMAGE_RATIO, getBackgroundIcon, NODE_NORMAL_SIZE} from '../../../../../common/cytoscapeCommonStyle';

export class CyDiffNode extends CyDiffCommon {
    static defaultClass = 'diff-node';
    public data: CyDiffNodeData;

    constructor(vertex: VertexDataJson) {
        super();
        this.data = new CyDiffNodeData(vertex);
    }

    get group(): ElementGroup {
        return 'nodes';
    }
}

export class CyDiffNodeData extends CyDiffCommonData {
    id: string;
    name: string;
    labelType: string;
    nodeType: string;
    icon: IconType;

    constructor(vertex: VertexDataJson) {
        super(vertex);
        this.id = vertex.id;
        this.name = vertexName(vertex);
        this.icon = elementAttr(vertex, 'icon', 'default@@0');
    }

    get displayLabel() {
        return trimStr(this.name);
    }

    get size() {
        return NODE_NORMAL_SIZE;
    }

    get fontSize() {
        return 16;
    }

    get backgroundImage() {
        return [getBackgroundIcon(this.icon), this.getMutationIcon()];
    }

    get backgroundX() {
        return ['50%', '90%'];
    }

    get backgroundY() {
        return ['50%', '10%'];
    }

    get backgroundSize() {
        return [BACKGROUND_IMAGE_RATIO, '20%'];
    }

    get backgroundOpacity() {
        switch (this.mutationName) {
            case 'DeleteVertex':
                return [COMMON_OPACITY, 1];
            default:
                return [1, 1];
        }
    }

    get textOpacity() {
        switch (this.mutationName) {
            case 'DeleteVertex':
                return COMMON_OPACITY;
            default:
                return 1;
        }
    }

    private getMutationIcon() {
        switch (this.mutationName) {
            case 'AddVertex':
                return AddAction;
            case 'DeleteVertex':
                return DeleteAction;
            case 'Edit':
                return EditAction;
            default:
                return 'none';
        }
    }
}
