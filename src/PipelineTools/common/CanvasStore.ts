import {LoadableStoreImpl} from '../../stores/LoadableStoreImpl';
import {CanvasTabStore} from './CanvasTabStore';
import {SimplePipelineModel} from '../../models/SimplePipelineModel';
import {observable, action} from 'mobx';
import {Locales, VoidFunction} from '../../utils';
import _remove from 'lodash/remove';

export abstract class CanvasStore extends LoadableStoreImpl {

    public pipeline: SimplePipelineModel | null;
    public hideDetailsPanel = false;
    @observable public detailsPanelCollapsed: boolean = false;
    @observable public leftPanelCollapsed: boolean = false;

    // 监听页面css造成的size变化 比如右边栏panel隐藏显示
    public resizeListeners: VoidFunction[] = [];

    // 方便store缓存一些比较重量级的对象
    public cache: Map<string, any> = new Map();

    constructor(public parent?: CanvasTabStore<CanvasStore>) {
        super();
    }

    get locale() {
        return this.parent ? this.parent.locale : Locales.zh;
    }

    abstract get canvasWidth(): string | number;

    // 当pipeline被关闭时调用
    abstract onPipelineClosed(): void;

    // 当其他tab被切过来时调用
    abstract async onSwitchedFrom(oldStore: CanvasStore): Promise<void>;

    @action
    public toggleDetailsPanelCollapsed() {
        this.detailsPanelCollapsed = !this.detailsPanelCollapsed;
    }

    @action
    public toggleLeftPanelCollapsed() {
        this.leftPanelCollapsed = !this.leftPanelCollapsed;
    }

    public addResizeListener(listener: VoidFunction) {
        this.resizeListeners.push(listener);
    }

    public removeResizeListener(listener: VoidFunction) {
        _remove(this.resizeListeners, listener);
    }
}
