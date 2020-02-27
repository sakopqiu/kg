import {TimeFilterType} from '../interfaces';
import {GlobalEdgeConfig} from './GlobalEdgeConfig';
import _get from 'lodash/get';
import {GlobalNodeConfig} from './GlobalNodeConfig';

export class CanvasSetting {
    hideNodeLabel: boolean = false;
    timeFilterType: TimeFilterType = TimeFilterType.TRANSPARENTIZE;
    // 全局边配置
    globalEdgeConfig: GlobalEdgeConfig;
    globalNodeConfig: GlobalNodeConfig;

    static fromJSON(json: any = {}) {
        const setting = new CanvasSetting();
        setting.hideNodeLabel = _get(json, 'hideNodeLabel', false);
        setting.timeFilterType = _get(json, 'timeFilterType', TimeFilterType.TRANSPARENTIZE);
        setting.globalEdgeConfig = GlobalEdgeConfig.fromJSON(json.globalEdgeConfig);
        setting.globalNodeConfig = GlobalNodeConfig.fromJSON(json.globalNodeConfig);
        return setting;
    }
}
