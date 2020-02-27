import {CanvasTabStore} from '../../common/CanvasTabStore';
import {action, observable, runInAction} from 'mobx';
import {ContainerId, DisplayModePipelineSchema, IDisplayModeContext} from '../interfaces';
import {cacheUtils} from '../../../cacheUtils';
import {DisplayModeCanvasStore} from './DisplayModeCanvasStore';
import {DisplayModePipelineModel} from '../../../models/DisplayModePipelineModel';
import {NaiveColorManager} from '../color/NaiveColorManager';
import {CanvasDrawService} from '../service/CanvasDrawService';
import {nextEventLoop} from '../../../utils';

export class DisplayModeCanvasTabStore<T extends DisplayModeCanvasStore = DisplayModeCanvasStore> extends CanvasTabStore<T> {

    // 展示模式下，当前被展示的面板的id
    @observable currentSelectedDisplayId: string | null | undefined;
    displayModeContext: IDisplayModeContext;

    constructor(public ConsturctorFn: new (store: DisplayModeCanvasTabStore<T>) => T = (DisplayModeCanvasStore as any)) {
        super();
    }

    // 打开一个新的tab来展现pipeline，如果曾经已经打开过了，就用原来的，不然加载新的
    public async openCanvas(cyStateData: string, schema: DisplayModePipelineSchema) {
        const tabStore = this.mainStore;
        const pipelineParams = cacheUtils.getCurrentSelectedDisplayPipeline();
        const pipelineId = pipelineParams.pipelineId;
        const pipelineName = pipelineParams.pipelineName;

        // 如果canvasStore是空，说明从未打开过该pipeline，或者被之前的操作关闭了
        const canvasStore = tabStore.storesByTab.get(pipelineId) as DisplayModeCanvasStore | null;
        let pipeline: DisplayModePipelineModel | null = null;
        if (canvasStore) {
            pipeline = canvasStore.pipeline;
            tabStore.setCurrentSelectedPipelineId(pipeline!.pipelineId);
            const drawService = (tabStore.currentActiveStore! as DisplayModeCanvasStore).canvasDrawService;
            nextEventLoop(() => {
                drawService.cyState.resetOneTimeStatus();
                drawService.cyState.noHistory = true;
                drawService.newRedraw();
            });
        } else {
            pipeline = new DisplayModePipelineModel(pipelineId, pipelineName);
            if (pipelineParams.parents) {
                pipeline.parents = pipelineParams.parents;
            }

            const canvasStore = new this.ConsturctorFn(tabStore);
            tabStore.setCurrentSelectedPipelineId(pipeline!.pipelineId);
            canvasStore.setDisplayModePipelineSchema(schema);
            canvasStore.setDisplayPipeline(pipeline!);
            canvasStore.canvasDrawService = new CanvasDrawService(canvasStore, 'single', false, false,
                NaiveColorManager, cyStateData, {
                    afterRendering: this.displayModeContext.displayModeConfig.afterRendering,
                }, ContainerId.complex);
            runInAction(() => {
                tabStore.storesByTab.set(pipeline!.pipelineId, canvasStore);
            });
        }
        return pipeline!;
    }

    async switchTab(newPipeline: DisplayModePipelineModel) {
        const oldStore = this.currentActiveStore!;
        const oldPipeline = oldStore.pipeline as DisplayModePipelineModel;
        oldStore.canvasDrawService.destroyOldCy();
        oldStore.canvasDrawService.stateService.closeAllContextMenu();
        this.setCurrentSelectedPipelineId(newPipeline.pipelineId);
        await this.mainStore.currentActiveStore!.onSwitchedFrom(oldStore);
        if (this.displayModeContext.onTabSwitched) {
            this.displayModeContext.onTabSwitched(oldPipeline, newPipeline);
        }
    }

    @action
    public setCurrentSelectedDisplayId(val: string | undefined) {
        this.currentSelectedDisplayId = val;
    }
}
