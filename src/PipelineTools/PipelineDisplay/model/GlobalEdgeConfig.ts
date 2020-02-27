import {ColorConfig} from './ColorConfig';
import {action, observable} from 'mobx';
import _compact from 'lodash/compact';
import _get from 'lodash/get';
import {EdgeStyleConfig} from './EdgeStyleConfig';

export class GlobalEdgeConfig {
    // 全局relation颜色配置
    @observable edgeColorConfig: ColorConfig;
    // 根据relation名字，以及筛选条件确定的颜色配置
    @observable edgeStyleConfigs: EdgeStyleConfig[] = [];
    @observable hideEdgeLabel: boolean;
    @observable edgeFontSize: number;

    private constructor() {
    }

    @action
    resetEdgeStyleConfigs() {
        this.edgeStyleConfigs = [EdgeStyleConfig.emptyObj()];
        this.hideEdgeLabel = false;
        this.edgeColorConfig = ColorConfig.fromJSON(null);
        this.edgeFontSize = 12;
    }

    @action
    setEdgeStyleConfigs(val: EdgeStyleConfig[]) {
        this.edgeStyleConfigs = val;
        if (val.length === 0) {
            // 至少保证存在一个配置对象
            this.edgeStyleConfigs.push(EdgeStyleConfig.emptyObj());
        }
    }

    @action
    setHideEdgeLabel(val: boolean) {
        this.hideEdgeLabel = val;
    }

    @action
    setEdgeFontSize(val: number) {
        this.edgeFontSize = val;
    }

    static fromJSON(json: any) {
        json = json || {}; // 新加的功能，老数据里可能没有json
        const ret = new GlobalEdgeConfig();
        ret.edgeColorConfig = ColorConfig.fromJSON(json.edgeColorConfig);
        if (json.edgeStyleConfigs) {
            ret.edgeStyleConfigs =
                _compact(json.edgeStyleConfigs.map((c: any) => EdgeStyleConfig.fromJSON(c)));
        }
        // 至少保证存在一个配置对象
        if (ret.edgeStyleConfigs.length === 0) {
            ret.edgeStyleConfigs.push(EdgeStyleConfig.emptyObj());
        }

        ret.hideEdgeLabel = _get(json, 'hideEdgeLabel', false);
        ret.edgeFontSize = _get(json, 'edgeFontSize', 12);
        return ret;
    }
}
