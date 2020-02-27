import {COMMON_OPACITY, CyDiffCommon, CyDiffCommonData, ModificationColor} from './CyDiffCommon';
import {ElementGroup} from 'cytoscape';
import {EdgeDataJson} from '../../../../kg-interface';
import {EDGE_NORMAL_WIDTH} from '../../../../../common/cytoscapeCommonStyle';
import {trimStr} from '../../../../../../utils';

export class CyDiffEdge extends CyDiffCommon {
    static defaultClass = 'diff-edge';

    public data: CyDiffEdgeData;

    constructor(edge: EdgeDataJson) {
        super();
        this.data = new CyDiffEdgeData(edge);
    }

    get group() {
        return 'edges' as ElementGroup;
    }
}

export class CyDiffEdgeData extends CyDiffCommonData {
    id: string;
    label: string;
    source: string;
    target: string;

    constructor(edge: EdgeDataJson) {
        super(edge);
        this.id = edge.id;
        this.label = edge.label;
        this.source = edge.srcId;
        this.target = edge.dstId;
    }

    get displayLabel() {
        let name = trimStr(this.label);
        if (!!this.mutationName) {
            name = '占位符' + name;
        }
        return name;
    }

    get width() {
        return EDGE_NORMAL_WIDTH;
    }

    get selectedWidth() {
        return this.width * 2;
    }

    get lineColor() {
        return ModificationColor.default;
        // switch(this.mutationName){
        //     case 'AddEdge':
        //         return ModificationColor.add;
        //     case 'DeleteEdge':
        //         return ModificationColor.delete;
        //     case 'Edit':
        //         return ModificationColor.update;
        //     default:
        //         return ModificationColor.default;
        // }
    }

    get lineStyle() {
        switch (this.mutationName) {
            case 'DeleteEdge':
                return 'dashed';
            default:
                return 'solid';
        }
    }

    get opacity() {
        switch (this.mutationName) {
            case 'DeleteEdge':
                return COMMON_OPACITY;
            default:
                return 1;
        }
    }
}
