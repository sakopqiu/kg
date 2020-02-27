import {NodeWithPosition, NodeWithPositionData} from './NodeWithPosition';
import {CyType} from './CyElement';
import {CyState} from './CyState';
import uuidv1 from 'uuid/v1';

export type CyDescriptionContainerShape = 'ellipse' | 'rectangle' | 'diamond';

export class CyDescriptionContainerData extends NodeWithPositionData {
    width: number = 200;
    height: number = 120;
    shape: CyDescriptionContainerShape = 'rectangle';

    constructor(cyState: CyState) {
        super(cyState);
        this.id = '$desc$' + uuidv1();
    }

    get cyType() {
        return CyType.DESCRIPTION;
    }

    static fromJSON(json: any, cyState: CyState) {
        const data = new CyDescriptionContainerData(cyState);
        data.id = json.id;
        data.shape = json.shape;
        data.width = json.width;
        data.height = json.height;
        return data;
    }
}

export class CyDescriptionContainer extends NodeWithPosition {
    public data: CyDescriptionContainerData = new CyDescriptionContainerData(this.cyState!);
    static defaultClass: string = 'description-container';

    constructor(cyState: CyState, shape: CyDescriptionContainerShape) {
        super(cyState);
        this.data.shape = shape;
    }

    static fromJSON(json: any, cyState: CyState): CyDescriptionContainer {
        const c = new CyDescriptionContainer(cyState, json.data.shape);
        c.initClassSet(json.classSet);
        c.position = json.position;
        c.selected = json.selected || false;
        c.data = CyDescriptionContainerData.fromJSON(json.data, cyState);
        return c;
    }
}
