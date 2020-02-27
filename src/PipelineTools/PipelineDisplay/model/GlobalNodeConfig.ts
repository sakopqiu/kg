import {action, observable} from 'mobx';
import _compact from 'lodash/compact';
import {NodeStyleConfig} from './NodeStyleConfig';

export class GlobalNodeConfig {

    // 根据node的类型，以及筛选条件确定的颜色，字体，形状等配置
    @observable nodeStyleConfigs: NodeStyleConfig[] = [];

    private constructor() {
    }

    @action
    resetNodeStyleConfigs() {
        this.nodeStyleConfigs = [NodeStyleConfig.emptyObj()];
    }

    @action
    setNodeStyleConfigs(val: NodeStyleConfig[]) {
        this.nodeStyleConfigs = val;
    }

    static fromJSON(json: any) {
        json = json || {}; // 新加的功能，老数据里可能没有json
        const ret = new GlobalNodeConfig();
        if (json.nodeStyleConfigs) {
            ret.nodeStyleConfigs =
                _compact(json.nodeStyleConfigs.map((c: any) => NodeStyleConfig.fromJSON(c)));
        }
        // 至少有一个空的配置对象
        if (ret.nodeStyleConfigs.length === 0) {
            ret.nodeStyleConfigs.push(NodeStyleConfig.emptyObj());
        }
        return ret;
    }
}
