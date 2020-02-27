import {CyEdgeCommon, CyEdgeCommonData} from './CyEdgeCommonData';
import {trimStr} from '../../../utils';
import {CyType} from './CyElement';
import {CyState} from './CyState';
import {computed} from 'mobx';
import {emi} from './CyEdge';
import {CyElementDefaultClass} from '../interfaces';

export const EDGEGROUP_PREFIX = 'edgegroup';
// 当存在self loop时，越粗的线之间间隔应该适当增大
export const BEZIER_GAP = [20, 30, 40, 50, 60];
// 不通粗度的线的默认值
export const pixelArray = [2, 3.5, 5, 6.5, 8];
// export const colorArray = ["#88D488", "#CEC778", "#76A2B8", "#D383D1", "#D97D8E"];

// cyEdgeGroup不保存，只存在于内存中
// 保存的是canvasSetting的code是否为merge,从而计算nextState时通过MEI来算出CyEdgeGroup
export class CyEdgeGroup extends CyEdgeCommon {
    static defaultClass = CyElementDefaultClass.MERGED_EDGE;
    public data: CyEdgeGroupData = new CyEdgeGroupData(this.cyState);

    constructor(public cyState: CyState, src?: string, target?: string, name?: string) {
        super(cyState);
        if (src && target && name) {
            this.data.id = emi(src, target, name);
            this.data.source = src;
            this.data.target = target;
            this.data.name = name;
        }
    }

    @computed
    get selected() {
        const edges = this.cyState.allCyEdgesByMEI(this.data.id);
        let result = false;
        // 为了mobx能够track到所有子元素的变化，for循环不能提前退出
        for (const e of edges) {
            if (e.selected) {
                result = true;
            }
        }
        return result;
    }

    public transparentize() {
        this.addClass('low-priority-edgegroup');
    }

    static fromJSON(json: any, cyState: CyState) {
        const cyEdgeGroup = new CyEdgeGroup(cyState);
        cyEdgeGroup.initClassSet(json.classSet);
        cyEdgeGroup.data = CyEdgeGroupData.fromJSON(json.data, cyState);
        return cyEdgeGroup;
    }
}

export class CyEdgeGroupData extends CyEdgeCommonData {
    public childrenCount: number = 0;
    // 权重或者颜色处于第几档
    public factorIndex: number = 0;

    static fromJSON(json: any, cyState: CyState) {
        const data = new CyEdgeGroupData(cyState);
        data.target = json.target;
        data.source = json.source;
        data.name = json.name;
        data.id = json.id;
        data.childrenCount = json.childrenCount;
        data.factorIndex = json.factorIndex;
        data.edgeIndex = json.edgeIndex;
        return data;
    }

    get cyType() {
        return CyType.EDGEGROUP;
    }

    get width() {
        return pixelArray[this.factorIndex];
    }

    get displayLabel() {
        return this.showLabel() ? trimStr(this.name) : '';
    }
}
