import {CanvasTabStore} from '../../common/CanvasTabStore';
import {EditModePipelineModel} from '../../../models/EditModePipelineModel';
import {DrawWhat, IEditModeContext, IPipeline} from '../interfaces';
import {action, observable, runInAction} from 'mobx';
import {cacheUtils} from '../../../cacheUtils';
import {WidgetModel} from '../../../models/WidgetModel';
import {CYTO_FIT_PADDING, defaulGetErrorMsg, getTranslation, IPoint, loadingEffect, showError} from '../../../utils';
import {LoadingTargets} from '../../../stores/LoadableStoreImpl';
import {EditModeCanvasStore} from './EditModeCanvasStore';
import _get from 'lodash/get';
import {ITreeFileBase} from '../../../stores/TreeStore/interface';

/**
 * RawType指的是TreeFile对象转换之前的原生对象
 */
export class EditModeCanvasTabStore<T extends EditModeCanvasStore = EditModeCanvasStore, TreeFileRawType = any, TreeFolderRawType = any> extends CanvasTabStore<T> {

    @observable public gridGap: number = 10;
    public rectHeight: number = 0;
    public rectWidth: number = 0;
    public circleRadius: number = 0;
    // 当前画布展现的是何种类型的图形
    public widgetType: DrawWhat;
    public canvasConfig: IEditModeContext;

    // cytoscape related instance
    public cy: any;

    public singleton: boolean = false; // 如果是true，算子复制出来后新算子和老算子拥有一套ParamsContainer

    constructor(public ConsturctorFn: new (store: EditModeCanvasTabStore<T>) => T = (EditModeCanvasStore as any)) {
        super();
    }

    // 打开一个新的tab来展现pipeline，如果曾经已经打开过了，就用原来的，不然加载新的
    // 编辑模式时，json默认不知道，为空，通过调用callback函数加载api数据
    // 如果是在一个已经打开的界面上再打开一个新的pipeline的话，需要把当前的svgWidth和height传进去
    public async openEditablePipeline(callback: () => Promise<IPipeline>,
                                      initDatasetsCallback: ((pipeline: IPipeline) => Promise<ITreeFileBase[]>) | null,
                                      svgWidth?: number,
                                      svgHeight?: number,
                                      mainCanvasClientPosition?: IPoint,
    ): Promise<EditModePipelineModel> {
        const tabStore = this.mainStore;
        const pipelineId = cacheUtils.getCurrentSelectedEditablePipeline().pipelineId;

        // 如果canvasStore是空，说明从未打开过该pipeline，或者被之前的操作关闭了
        let canvasStore = tabStore.storesByTab.get(pipelineId) as (EditModeCanvasStore | null);
        let pipeline: EditModePipelineModel;
        if (canvasStore) {
            pipeline = canvasStore.pipeline!;
        } else {
            const json = await callback!(); // 编辑模式，读取从api返回的数据
            pipeline = new EditModePipelineModel(json, this.canvasConfig.panningType);
            canvasStore = new this.ConsturctorFn(tabStore);
            if (initDatasetsCallback) {
                const datasets = await initDatasetsCallback(pipeline.toJson())!;
                canvasStore.datasetTree.initFrom(datasets!);
            }
            canvasStore.setEditablePipeline(pipeline!);
            runInAction(() => {
                tabStore.storesByTab.set(pipeline!.pipelineId, canvasStore! as T);
            });
            pipeline.initDetails(canvasStore, json);
            if (canvasStore.definitionMissing) {
                showError(this.canvasConfig.elementTruncateWarningMsg || 'some element got truncated because its dataset is not provided');
            }
            if (_get(this.canvasConfig, 'events.onPipelineFirstTimeRendered')) {
                this.canvasConfig.events!.onPipelineFirstTimeRendered!(pipeline);
            }
        }
        runInAction(() => {
            if (svgWidth && svgHeight && mainCanvasClientPosition) {
                canvasStore!.setSvgWidth(svgWidth);
                canvasStore!.setSvgHeight(svgHeight);
                canvasStore!.setMainCanvasClientPosition(mainCanvasClientPosition);
            }
            tabStore.setCurrentSelectedPipelineId(pipeline.pipelineId);
        });
        return pipeline!;
    }

    public setRectSize(rectWidth: number, rectHeight: number) {
        this.rectHeight = rectHeight;
        this.rectWidth = rectWidth;
    }

    public isCytoMode() {
        return !!this.cy;
    }

    public setWidgetType(type: DrawWhat) {
        this.widgetType = type;
    }

    public setCircleRadius(r: number) {
        this.circleRadius = r;
    }

    public fit() {
        this.cy.fit(CYTO_FIT_PADDING);
    }

    // TODO scrollLeft会造成layout，效率太差，优化成监听onscroll事件
    // 这里的scroll仅仅限于当前canvas内部的滚动条，如果组件外部还有滚动条，会造成连线紊乱
    public static scrollDiffs() {
        const background = document.querySelector('.pipeline-background') as HTMLDivElement;
        if (!background) {
            return {scrollLeft: 0, scrollTop: 0};
        }
        return {scrollLeft: background.scrollLeft, scrollTop: background.scrollTop};
    }

    private widgetRight(widget: WidgetModel) {
        return widget.x + this.rectWidth;
    }

    private widgetBottom(widget: WidgetModel) {
        return widget.y + this.rectHeight;
    }

    public widgetBoundingArea(widget: WidgetModel) {
        if (this.widgetType === DrawWhat.DRAW_RECT) {
            return {
                startPoint: {x: widget.x, y: widget.y},
                endPoint: {x: this.widgetRight(widget), y: this.widgetBottom(widget)},
            };
        } else if (this.widgetType === DrawWhat.DRAW_CIRCLE) {
            return {
                startPoint: {x: widget.x, y: widget.y},
                endPoint: {x: widget.x + this.circleRadius * 2, y: widget.y + this.circleRadius * 2},
            };
        } else {
            throw new Error('Widget type not found');
        }
    }

    @action
    public checkPipeline() {
        const s = this.currentActiveStore!;

        s.widgets.forEach((w) => w.setCheckFormFailed(false));
        s.links.forEach((e) => e.setCheckFormFailed(false));

        if (!s.checkForm()) {
            showError(getTranslation(this.locale, 'Field is not filled in'));
            return false;
        }
        return true;
    }

    @loadingEffect(LoadingTargets.SAVING, {
        successMsgFunc(this: CanvasTabStore) {
            return getTranslation(this.locale, 'Saved');
        },
    })
    public async save() {
        const pipeline = this.currentActiveStore!.pipeline!;
        if (pipeline.readonly) {
            return false;
        }
        const beforeSave = _get(this.canvasConfig, 'events.beforeSave', () => true);
        const result = beforeSave(pipeline);
        if (!result) {
            // TODO beforeSave中会检测widget配置是否合理，目前只有field未填写时会报错，以后这个报错语句要改
            showError(getTranslation(this.locale, 'Field is not filled in'));
            return false;
        }
        if (pipeline) {
            if (!this.checkPipeline()) {
                return false;
            } else {
                try {
                    await this.canvasConfig.callbacks.savePipeline!(pipeline.toJson());
                    pipeline!.setDirty(false);
                    return true;
                } catch (e) {
                    console.error(e);
                    showError(defaulGetErrorMsg(e));
                    return false;
                }
            }
        }
        throw new Error('Pipeline is not ready');
    }

    async switchTab(newPipeline: EditModePipelineModel) {
        const oldStore = this.currentActiveStore!;

        if (newPipeline === oldStore.pipeline) {
            return;
        }
        const oldPipeline = oldStore.pipeline!;

        this.mainStore.setCurrentSelectedPipelineId(newPipeline!.pipelineId);
        await this.currentActiveStore!.onSwitchedFrom(oldStore);

        if (_get(this, 'canvasConfig.events.onTabSwitched')) {
            this.canvasConfig.events!.onTabSwitched!(oldPipeline, newPipeline);
        }
    }

    async closeTab(pipeline: EditModePipelineModel) {
        const tabRemains: boolean = await super.closeTab(pipeline);
        if (!tabRemains) {
            if (_get(this, 'canvasConfig.events.onTabCleared')) {
                this.canvasConfig.events!.onTabCleared!();
            }
        }
        return tabRemains;
    }
}
