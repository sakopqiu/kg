import {Locales} from '../../utils';
import {LoadableStoreImpl} from '../../stores/LoadableStoreImpl';
import {action, computed, observable, ObservableMap} from 'mobx';
import {CanvasStore} from './CanvasStore';
import {SimplePipelineModel} from '../../models/SimplePipelineModel';

export abstract class CanvasTabStore<T extends CanvasStore = CanvasStore> extends LoadableStoreImpl {
    // pipeline只在构建时使用
    @observable currentSelectedPipelineId: string | null;
    @observable locale: Locales = Locales.zh;

    // 当前要被关闭的而且是dirty状态的pipeline
    @observable public currentToBeClosedPipeline: SimplePipelineModel | null;
    public storesByTab: ObservableMap<string, T> = observable.map<string, T>({});

    constructor(public ConsturctorFn: new (store: CanvasTabStore<T>) => T = (CanvasStore as any)) {
        super();
    }

    @action
    public setLocale(val: Locales) {
        this.locale = val;
    }

    @action
    public setCurrentToBeClosedPipeline(val: SimplePipelineModel | null) {
        this.currentToBeClosedPipeline = val;
    }

    @action
    public setCurrentSelectedPipelineId(val: string | null) {
        this.currentSelectedPipelineId = val;
    }

    public async closeTabById(pipelineId: string) {
        const store = this.storesByTab.get(pipelineId);
        if (!store) {
            return;
        }
        await this.closeTab(store.pipeline!);
    }

    // 返回true代表tab还没有全部关完，返回false则通知外部动作
    @action
    public async closeTab(pipeline: SimplePipelineModel) {
        const id = pipeline.pipelineId;
        const oldStore = this.storesByTab.get(id)!;
        // 如果外部传进来的id不存在
        if (!oldStore) {
            return this.storesByTab.size > 0;
        }
        oldStore.onPipelineClosed();
        this.storesByTab.delete(id);

        if (this.storesByTab.size > 0) {
            // 选取第一个tab
            const newStore = this.storesByTab.values().next().value;
            this.setCurrentSelectedPipelineId(newStore.pipeline!.pipelineId);
            await newStore.onSwitchedFrom(oldStore);
            return true;
        } else {
            return false;
        }
    }

    @computed
    public get currentActiveStore() {
        if (!this.currentSelectedPipelineId) {
            return null;
        }
        return this.storesByTab.get(this.currentSelectedPipelineId)!;
    }

    abstract async switchTab(newPipeline: SimplePipelineModel): Promise<any>;

    get mainStore() {
        return this;
    }

}
