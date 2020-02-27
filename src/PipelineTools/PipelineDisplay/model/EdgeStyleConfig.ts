import {ColorConfig} from './ColorConfig';
import {SpecialLineColors} from '../components/complex/interface';
import {observable, action} from 'mobx';
import {mockEmptyRuleJson, SqlRuleJson} from '../../../AttributeSelector/sql/SqlRule';

export class EdgeStyleConfig {
    @observable label: string = ''; // 关系名字
    @observable rule: SqlRuleJson = {} as any; // 该关系所对应的规则
    colorConfig: ColorConfig; // 可以认为，关系名和规则是key，colorConfig是value

    private constructor() {
    }

    static emptyObj() {
        const ret = new EdgeStyleConfig();
        ret.rule = mockEmptyRuleJson();
        ret.colorConfig = ColorConfig.fromJSON(null, SpecialLineColors.COLOR1);
        return ret;
    }

    @action
    setLabel(val: string) {
        this.label = val;
    }

    // 返回空时调用方应该忽略该条配置
    // 当json为空，且returnNullOnNull为false时
    static fromJSON(json: any, returnNullOnNull = true): EdgeStyleConfig | null {
        const ret = new EdgeStyleConfig();
        if (!json && returnNullOnNull) {
            return null;
        }
        // legacy数据是edgeLabel
        ret.label = json.edgeLabel || json.label;
        ret.rule = json.rule;
        ret.colorConfig = ColorConfig.fromJSON(json.colorConfig, SpecialLineColors.COLOR1);
        if ((!ret.label || !ret.rule) && returnNullOnNull) {
            return null;
        }
        return ret;
    }
}
