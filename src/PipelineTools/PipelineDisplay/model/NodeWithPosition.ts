import {IPoint} from '../../../utils';
import {CyElement, CyElementData} from './CyElement';
import {ElementGroup} from 'cytoscape';

export class NodeWithPosition extends CyElement {
    data: NodeWithPositionData;
    position: IPoint;

    isHidden() {
        return false;
    }

    // cytoscape固定值
    get group() {
        return 'nodes' as ElementGroup;
    }
}

export abstract class NodeWithPositionData extends CyElementData {
}
