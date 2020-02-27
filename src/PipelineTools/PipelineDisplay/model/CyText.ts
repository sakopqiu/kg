import {NodeWithPosition, NodeWithPositionData} from './NodeWithPosition';
import {CyType} from './CyElement';
import {CyState} from './CyState';
import {observable} from 'mobx';
import uuidv1 from 'uuid/v1';

export class CyTextData extends NodeWithPositionData {
    @observable text: string = 'Add Description';

    get cyType() {
        return CyType.TEXT;
    }

    constructor(cyState?: CyState) {
        super(cyState);
        this.id = 'text' + uuidv1();
    }

    static fromJSON(json: any, cyState: CyState) {
        const d = new CyTextData(cyState);
        d.text = json.text;
        return d;
    }
}

export class CyText extends NodeWithPosition {
    static defaultClass = 'description-text';
    public data: CyTextData = new CyTextData(this.cyState);

    static fromJSON(json: any, cyState: CyState) {
        const t = new CyText(cyState);
        t.initClassSet(json.classSet);
        t.position = json.position;
        t.selected = json.selected || false;
        t.data = CyTextData.fromJSON(json.data, cyState);
        return t;
    }
}
