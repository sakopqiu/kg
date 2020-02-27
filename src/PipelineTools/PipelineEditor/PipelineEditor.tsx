import * as React from 'react';
import '../common/common.scss';
import WidgetDetailsPanel from './right/WidgetDetailsPanel';
import SvgBackground from './SvgBackground';
import {getTranslation, loadingEffect, scrollPipeline} from '../../utils';
import {LoadingTargets} from '../../stores/LoadableStoreImpl';
import {TargetedLoading} from '../../components/TargetedLoading';
import {DrawWhat, IEditModeContext, IPipeline} from './interfaces';
import {cacheUtils} from '../../cacheUtils';
import invariant from 'invariant';
import {SophonModal} from '../../components/SophonModal/index';
import {observer} from 'mobx-react';
import EditModeBottomToolBar from './components/EditModeBottomToolBar';
import {EditModeCanvasTabs} from './stores/EditModeCanvasTabs';
import {EditModeCanvasConfigProvider, leftPanelWidth} from './EditCanvasUtils';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import ReadOnlyDetailsPanel from './right/ReadonlyDetailsPanel';
import EditModeCytoBottomToolBar from './components/EditModeCytoBottomToolBar';
import _get from 'lodash/get';
import CytoBackground from './cyto/CytoBackground';

@observer
export class PipelineEditor extends React.Component<IEditModeContext> {

    public constructor(props: IEditModeContext) {
        super(props);
    }

    warnDeprecated() {
        if (this.props.callbacks.getWidgetParamDefs) {
            console.warn('getWidgetParamDefs将被废弃，尝试使用customDetailPanel代替');
        }
        if (this.props.callbacks.getLinkParamDefs) {
            console.warn('getLinkParamDefs，尝试使用customDetailPanel代替');
        }
    }

    // init所有store需要用到的信息
    public componentWillMount() {
        const s = this.mainStore;
        this.warnDeprecated();
        this.mainStore.canvasConfig = this.props;
        if (this.props.rectConfig) {
            const {opWidth, opHeight} = this.props.rectConfig;
            s.setRectSize(opWidth, opHeight);
            s.setWidgetType(DrawWhat.DRAW_RECT);
        } else if (this.props.circleConfig) {
            s.setCircleRadius(this.props.circleConfig.circleRadius);
            s.setWidgetType(DrawWhat.DRAW_CIRCLE);
        } else if (this.props.renderType === 'svg') {
            throw new Error('没有配置任何图形的信息');
        }
        s.setLocale(this.props.locale);
    }

    public async componentDidMount() {
        const pipelineId = cacheUtils.getCurrentSelectedEditablePipeline().pipelineId;
        if (!pipelineId) {
            throw new Error('editablePipeline id should be set by calling cacheUtils.setCurrentSelectedEditablePipeline() ' +
                'before rendering <Canvas/>');
        }

        await this.loadEditablePipelineConfigs(pipelineId);
    }

    @loadingEffect(LoadingTargets.LOAD_CONFIG)
    private async loadEditablePipelineConfigs(pipelineId: string) {
        invariant(this.props.callbacks, 'Please provide callbacks when using editing mode');
        const callbacks = this.props.callbacks!;
        const pipeline = await this.mainStore.openEditablePipeline(
            async () => {
                return await callbacks.loadPipeline(pipelineId);
            },
            callbacks.loadInitialDatasets ? async (pipeline: IPipeline) => {
                return await callbacks.loadInitialDatasets!(pipeline);
            } : null,
        );

        setTimeout(() => {
            // openEditablePipeline会导致下一个eventloop render方法被重绘，因此导致dom节点全部被加载，
            // scrollPipeline需要在再下一个eventloop中才能获得dom节点的引用
            scrollPipeline(pipeline.scrollDimension);
        });
    }

    get mainStore() {
        return this.props.mainStore;
    }

    rightPanel() {
        if (!!this.props.hideDetailsPanel) {
            return null;
        }

        const s = this.mainStore.currentActiveStore!;
        const pipeline = s.pipeline!;
        return pipeline.readonly ? <ReadOnlyDetailsPanel/> : <WidgetDetailsPanel/>;
    }

    public render() {
        const toBeClosed = this.mainStore.currentToBeClosedPipeline;
        const currentActiveStore = this.mainStore.currentActiveStore;
        const renderType = this.props.renderType || 'svg';
        if (!currentActiveStore) {
            return <TargetedLoading
                store={this.mainStore} loadingTarget={LoadingTargets.LOAD_CONFIG}/>;
        }
        let WidgetPanelComponent = null;
        if (!this.props.hideDatasetPanel && !currentActiveStore.isPipelineReadOnly) {
            WidgetPanelComponent = React.lazy(() => import('./left/DatasetsPanel'));
        }

        const leftWidth = leftPanelWidth(this.props);

        return (
            <EditModeCanvasConfigProvider value={this.props}>
                <div className='pipelinetool-canvas' id={this.props.id}>
                    {WidgetPanelComponent ?
                        <React.Suspense fallback={<div style={{width: leftWidth, padding: 10}}>Loading...</div>}>
                            <WidgetPanelComponent/>
                        </React.Suspense>
                        : null}
                    <div className='drawing-context-wrapper'
                         style={{width: currentActiveStore.canvasWidth}}
                    >
                        {!_get(this.props, 'tabConfig.hideTab') && <EditModeCanvasTabs/>}
                        {renderType === 'svg' ? <SvgBackground/> : <CytoBackground/>}
                        {renderType === 'svg' ? <EditModeBottomToolBar/> : <EditModeCytoBottomToolBar/>}
                    </div>

                    {this.rightPanel()}

                    <SophonModal
                        width={510}
                        shadowStyles={{alignItems: 'center'}}
                        buttonAlign='center'
                        showState={!!toBeClosed}
                        locale={this.props.locale}
                        title={getTranslation(this.props.locale, 'Confirm Closure')}
                        cancelOption={{
                            showCross: true,
                            onCancel: () => {
                                this.mainStore.setCurrentToBeClosedPipeline(null);
                            },
                        }}
                        confirmOption={{
                            onConfirm: async () => {
                                const tabRemains = await this.mainStore.closeTab(this.mainStore.currentToBeClosedPipeline! as any);
                                this.mainStore.setCurrentToBeClosedPipeline(null);
                                if (!tabRemains) {
                                    if (_get(this, 'props.events.onTabCleared')) {
                                        this.props.events!.onTabCleared!();
                                    }
                                }
                            },
                        }}
                        hitShadowClose={true}
                    >
                        {!!toBeClosed &&
                        <div style={{
                            marginTop: 35,
                            fontSize: 16,
                            color: '#28374F',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                        }}>
                            <Icon style={{color: '#FAAD14', fontSize: 60, marginBottom: 20}} type='exclamation-circle'/>
                            <span style={{
                                fontWeight: 'bold',
                                wordBreak: 'break-all',
                                wordWrap: 'break-word',
                                overflow: 'hidden',
                            }}>
                                {!!toBeClosed && getTranslation(this.props.locale, 'Dirty flow closure hint', {name: toBeClosed!.pipelineName})}</span>
                        </div>
                        }
                    </SophonModal>

                    <TargetedLoading
                        message={getTranslation(this.props.locale, 'Saving') + '..'}
                        store={this.mainStore}
                        loadingTarget={LoadingTargets.SAVING}
                    />
                </div>
            </EditModeCanvasConfigProvider>
        );
    }
}
