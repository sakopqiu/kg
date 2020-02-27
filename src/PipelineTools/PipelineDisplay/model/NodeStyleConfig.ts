import {action, observable} from 'mobx';
import {mockEmptyRuleJson, SqlRuleJson} from '../../../AttributeSelector/sql/SqlRule';
import {NODE_NORMAL_SIZE} from '../../common/cytoscapeCommonStyle';
import {NodeBorderColors, NodeShape} from '../interfaces';

export class NodeStyleConfig {
    @observable label: string = ''; // 关系名字
    @observable rule: SqlRuleJson; // 该关系所对应的规则

    @observable size: number;
    @observable shape: NodeShape;
    @observable borderColor: string;

    private constructor() {
    }

    static emptyObj() {
        const ret = new NodeStyleConfig();
        ret.rule = mockEmptyRuleJson();
        ret.size = NODE_NORMAL_SIZE;
        ret.shape = 'polygon';
        ret.borderColor = NodeBorderColors[0];
        return ret;
    }

    @action
    setLabel(val: string) {
        this.label = val;
    }

    @action
    setSize(size: number) {
        this.size = size;
    }

    @action
    setShape(shape: NodeShape) {
        this.shape = shape;
    }

    @action
    setBorderColor(val: string) {
        this.borderColor = val;
    }

    // 返回空时调用方应该忽略该条配置
    // 当json为空，且returnNullOnNull为false时
    static fromJSON(json: any): NodeStyleConfig | null {
        const ret = NodeStyleConfig.emptyObj();
        if (!json) {
            return null;
        }
        ret.label = json.label;
        ret.rule = json.rule;
        ret.borderColor = json.borderColor;
        ret.size = json.size;
        ret.shape = json.shape;
        return ret;
    }
}
