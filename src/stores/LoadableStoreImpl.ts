import {defaulGetErrorMsg, getLocale, getTranslation, showError, showMessage} from '../utils';
import {observable, action, ObservableMap} from 'mobx';
import {AxiosError} from 'axios';
import _get from 'lodash/get';

export enum LoadingTargets {
    'LIST' = 'LIST',
    'API_GET' = 'API_GET', // 从API获取数据
    'LOAD_CONFIG' = 'LOAD_CONFIG',
    'DYANMIC' = 'DYANMIC', // 目标是动态的，也就是说target没有办法提前预知，比如说层级目录，每一次都不知道下一次要去点哪个目录，也没有办法给哪个目录绑定一个target
    'MODAL_LOADING' = 'MODAL_LOADING', // loading界面位于modal内部
    'FEATURE_MAPPING' = 'FEATURE_MAPPING',
    'MODAL_OK' = 'MODAL_OK', // modal内部按ok
    'EXPORT_OK' = 'EXPORT_OK', // modal内部按ok
    'DELETE_MODAL_OK' = 'DELETE_MODAL_OK', // modal内部按delete ok
    'DELETE_BUTTON_OK' = 'DELETE_BUTTON_OK', // 普通页面按ok
    'BUTTON_OK' = 'BUTTON_OK', // 普通页面按ok
    'TEST_CONNECTION' = 'TEST_CONNECTION', // 普通页面按ok
    'BUTTON_NEXT' = 'BUTTON_NEXT', // 普通页面下一步
    'BUTTON_SAVE_DEPLOY' = 'BUTTON_SAVE_DEPLOY', // 普通页面的保存并部署
    'Test' = 'Test',
    'TestButton' = 'TestButton',
    'MUTATE' = 'MUTATE',
    'OPERATION' = 'OPERATION',
    'UPLOAD' = 'UPLOAD',
    'Login' = 'Login',
    'RESOURCE' = 'RESOURCE',
    'REFRESH' = 'REFRESH',
    'NOTEBOOK' = 'NOTEBOOK',
    'SAVING' = 'SAVING',
    'AUTO_SAVING' = 'AUTO_SAVING',
    'STOP_NOTEBOOK' = 'STOP_NOTEBOOK',
    'CONFIG' = 'CONFIG',
    'BUTTON_EXEC_SQL' = 'BUTTON_EXEC_SQL', // 复杂SQL执行语句
    'SAMPLING' = 'SAMPLING',
    'CANVAS_LAYOUT' = 'CANVAS_LAYOUT', // 绘制cytoscape界面
    'ADD_ELEMENTS' = 'ADD_ELEMENTS',
    'LOADING_MINI_MAP' = 'LOADING_MINI_MAP',
    'LOAD_MORE' = 'LOAD_MORE',
    'LOAD_HISTORY' = 'LOAD_HISTORY',
    'SESSION_OPERATION' = 'SESSION_OPERATION',
    'SESSION_SWITCH' = 'SESSION_SWITCH',
    'FIELD_MODIFIER_INLINE' = 'FIELD_MODIFIER_INLINE', // 文本域编辑器loading状态
    'CASCADE_INLINE' = 'CASCADE_INLINE', // 联动异步加载loading状态
    'PANEL_LOADING' = 'PANEL_LOADING', // 用于异步显示面板遮罩层的loading状态
    'DASHBOARD_THEME_LOADING' = 'DASHBOARD_THEME_LOADING', // dashboard 主题loading状态
    'DASHBOARD_TASK_LOADING' = 'DASHBOARD_TASK_LOADING', // dashboard 任务loading状态
    'DASHBOARD_USER_LOADING' = 'DASHBOARD_USER_LOADING', // dashboard 用户loading状态
    'TREE_INLINE' = 'TREE_INLINE', // 树形组件异步加载的loading状态
    'TREE_MENU_LOADING' = 'TREE_MENU_LOADING', // 树形菜单loading
    'BUTTON_OK_NO_HINT' = 'BUTTON_OK_NO_HINT', // 点了ok操作成功后不显示操作成功提示的
    'CHART' = 'CHART', // 图表loading状态
    'LOG' = 'LOG', // 打印日志loading状态
    'GRAPH' = 'GRAPH', // 图形可视化loading状态
    'DRAWER_LOADING' = 'DRAWER_LOADING', // 抽屉loading状态
}

// 如果操作成功，需要显示操作状态的目标，一遍是增删改操作
export const OperationNoticeTargets = [
    LoadingTargets.MODAL_OK,
    LoadingTargets.SAVING,
    LoadingTargets.DELETE_MODAL_OK,
    LoadingTargets.BUTTON_OK,
    LoadingTargets.BUTTON_SAVE_DEPLOY,
    LoadingTargets.OPERATION,
    LoadingTargets.REFRESH,
    LoadingTargets.STOP_NOTEBOOK,
];

export interface Loadable {
    mainStore: LoadableStoreImpl;
}

const DEFAULT_SUCCESS_MESSAGEMAP = {
    [LoadingTargets.SAVING]: 'Saved successfully',
    [LoadingTargets.REFRESH]: 'Refreshed successfully',
};

export class LoadableStoreImpl {
    loadingTargets: ObservableMap<any> = observable.map({});

    @action
    resetStatus() {
        this.loadingTargets.clear();
    }

    @action
    resetLoadingStatus() {
        this.loadingTargets.clear();
    }

    @action
    finishLoading(key: LoadingTargets) {
        this.loadingTargets.delete(key);
    }

    @action
    addLoadingTarget(key: LoadingTargets) {
        this.loadingTargets.set(key, {});
    }

    isLoading(key: LoadingTargets) {
        return this.loadingTargets.has(key);
    }

    getErrorMsg(error: AxiosError): string | React.ReactNode {
        return defaulGetErrorMsg(error);
    }

    displayError(error: AxiosError, options: DisplayOptions) {
        const errMsg = this.getErrorMsg(error);
        // 404未找到服务暂且使用notification进行提示
        showError(errMsg, options.duration, options.toBottom);
    }

    displaySuccess(target: string, options: DisplayOptions) {
        const successMessageKey = DEFAULT_SUCCESS_MESSAGEMAP[target] || 'Operation Done';
        showMessage(getTranslation(getLocale(), successMessageKey), options.duration, options.toBottom);
    }

    displayMessage(msg: string, options: DisplayOptions) {
        showMessage(msg, options.duration, options.toBottom);
    }
}

export interface DisplayOptions {
    duration?: number;
    toBottom?: number;
}
