import * as React from 'react';
import '../../../common/common.scss';
import './index.scss';
import {observer} from 'mobx-react';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import {computed} from 'mobx';
import className from 'classnames';
import {CategoryConfig, IDisplayModeContext, SectionChildType, SectionConfig} from '../../interfaces';
import {SectionComponent} from '../../WordTabSections/components/SectionCategory/SectionComponent';
import {MiniIcon} from '../../WordTabSections/components/MiniIcon/MiniIcon';
import {DisplayModeCanvasStore} from '../../stores/DisplayModeCanvasStore';
import {LargeIcon} from '../../WordTabSections/components/LargeIcon/LargeIcon';
import {allSectionsConfig} from '../../WordTabSections/AllSections';
import {deepClone, getTranslation, identityFunc} from '../../../../utils';
import {ComplexCanvasConfigProvider} from '../../DisplayCanvasUtils';
import {SophonWordTabContainer} from '../../../../components/SophonWordTabContainer/SophonWordTab';
import {ComplexCanvasTabs} from '../../tabs/ComplexCanvasTabs';
import {CanvasBackground} from './CanvasBackground';
import DisplayModeBottomToolBar from '../../components/complex/DisplayModeBottomToolBar';
import {SophonModal} from '../../../../components/SophonModal';
import {LoadingTargets} from '../../../../stores/LoadableStoreImpl';
import {TargetedLoading} from '../../../../components/TargetedLoading';
import {cacheUtils} from '../../../../cacheUtils';
import DetailsPanel from '../../right/DetailsPanel/DetailsPanel';
import {StatsAnalysisModal} from '../../components/complex/StatsAnalysisModal/StatsAnalysisModal';
import {EdgeMoreSettingModal} from '../../components/complex/EdgeMoreSettingModal/EdgeMoreSettingModal';
import {BranchBreadCrumb} from '../../components/common/BranchBreadCrumb/BranchBreadCrumb';
import {NodeMoreSettingModal} from '../../components/complex/NodeMoreSettingModal/NodeMoreSettingModal';

@observer
export class ComplexPipelineDisplay extends React.Component<IDisplayModeContext> {

    public constructor(props: IDisplayModeContext) {
        super(props);
    }

    // init所有store需要用到的信息
    public componentWillMount() {
        const s = this.mainStore;
        s.setLocale(this.props.locale);
        this.mainStore.displayModeContext = this.props;
    }

    public async componentDidMount() {
        const pipelineId = cacheUtils.getCurrentSelectedDisplayPipeline().pipelineId;
        const displayConfig = this.props.displayModeConfig;
        if (!pipelineId) {
            throw new Error('editablePipeline id should be set by calling cacheUtils.setCurrentSelectedEditablePipeline() ' +
                'before rendering <Canvas/>');
        }

        const cytoData = this.props.displayModeConfig!.cytoData || '{}';
        await this.mainStore.openCanvas(cytoData, displayConfig!.pipelineSchema);
    }

    get mainStore() {
        return this.props.mainStore;
    }

    get locale() {
        return this.props.locale;
    }

    mapSection = (sectionConfig: SectionConfig): React.ReactNode => {
        const s = this.mainStore.currentActiveStore! as DisplayModeCanvasStore;
        return (
            <SectionComponent title={sectionConfig.title} key={sectionConfig.key}>
                {sectionConfig.children.map((child) => {
                    if (child.type === SectionChildType.MINI) {
                        const miniChild = child;
                        return (
                            <MiniIcon key={miniChild.title} iconConfig={{
                                id: miniChild.id,
                                title: miniChild.title!,
                                icon: miniChild.icon!,
                                hint: miniChild.hint,
                                hideTriangle: miniChild.hideTriangle,
                                popover: miniChild.popover,
                                popoverOverlayClassName: miniChild.popoverOverlayClassName,
                                onClick: (e: any) => {
                                    if (!miniChild.popover && miniChild.enabledFunc!()) {
                                        s.canvasDrawService.stateService.closeAllContextMenu();
                                        miniChild.onClick!(e);
                                    }
                                },
                                enabledFunc: miniChild.enabledFunc!,
                            }}/>
                        );
                    } else if (child.type === SectionChildType.LARGE) {
                        const largeChild = child;
                        return (
                            <LargeIcon
                                key={largeChild.title}
                                iconConfig={{
                                    id: largeChild.id,
                                    title: largeChild.title!,
                                    icon: largeChild.icon!,
                                    hint: largeChild.hint,
                                    popover: largeChild.popover,
                                    popoverOverlayClassName: largeChild.popoverOverlayClassName,
                                    onClick: (e: any) => {
                                        if (!largeChild.popover && largeChild.enabledFunc!()) {
                                            s.canvasDrawService.stateService.closeAllContextMenu();
                                            largeChild.onClick!(e);
                                        }
                                    },
                                    enabledFunc: largeChild.enabledFunc!,
                                }}/>
                        );
                    } else if (child.type === SectionChildType.CUSTOM) {
                        return child.render!();
                    } else {
                        throw new Error('Invalid child type ' + child.type);
                    }
                })}
            </SectionComponent>
        );
    }

    @computed
    private get tabs() {
        const s = this.mainStore.currentActiveStore! as DisplayModeCanvasStore;
        const defaultConfig = allSectionsConfig(this.locale, s.canvasDrawService.statusService);
        const config = this.props.displayModeConfig.wordTabConfigs ?
            this.props.displayModeConfig.wordTabConfigs(deepClone(defaultConfig, 3))
            : defaultConfig;

        return config.map((category: CategoryConfig) => {
            return {
                key: category.title,
                title: category.title,
                sections: category.sections.map(this.mapSection),
            };
        });
    }

    private updateActiveWordTab = (newKey: string) => {
        const s = this.mainStore.currentActiveStore as DisplayModeCanvasStore;
        s.canvasDrawService.stateService.setActiveWordTabKey(newKey);
    }

    // hack
    private breadCrumb() {
        const s = this.mainStore.currentActiveStore as DisplayModeCanvasStore;
        const pipeline = s.pipeline!;
        const parent = pipeline.parents![pipeline.parents!.length - 1];

        return (
            <BranchBreadCrumb
                style={{paddingLeft: 20, paddingRight: 30}}
                onBackClicked={this.props.onBackClicked!}
                parent={parent.name!} name={s.pipeline!.pipelineName}
            />
        );
    }

    public render() {
        const toBeClosed = this.mainStore.currentToBeClosedPipeline;
        const currentActiveStore = this.mainStore.currentActiveStore as DisplayModeCanvasStore;
        if (!currentActiveStore) {
            return null;
        }
        const service = currentActiveStore.canvasDrawService;
        const stateService = service.stateService;
        return (
            <ComplexCanvasConfigProvider value={{
                ...this.props,
                fieldAlias: this.props.fieldAlias || identityFunc,
            }}>
                <div className={className(`pipelinetool-display-wrapper ${this.props.className || ''}`,
                    {highlightCursor: service.elementService.showBlazer})}
                     style={this.props.style || {}}>
                    <StatsAnalysisModal service={service} locale={this.locale}
                                        fieldsAlias={this.props.fieldAlias || identityFunc}/>
                    {service.stateService.showRelationStyleModal &&
                    <EdgeMoreSettingModal locale={this.locale} mainStore={currentActiveStore}/>}

                    {service.stateService.showNodeStyleModal &&
                    <NodeMoreSettingModal locale={this.locale} mainStore={currentActiveStore}/>
                    }
                    <SophonWordTabContainer
                        tabs={this.tabs}
                        tabsLeft={this.breadCrumb()}
                        disabled={false}
                        collapseTab={stateService.collapseWordTab}
                        onTabsToggled={stateService.setCollapseWordTab.bind(stateService)}
                        currentActiveTabKey={stateService.activeWordTabKey}
                        onTabClicked={this.updateActiveWordTab}/>

                    <div className='pipelinetool-canvas' style={{flex: 1}}>
                        <div className='drawing-context-wrapper'
                             style={{width: currentActiveStore.canvasWidth}}
                        >
                            <ComplexCanvasTabs/>
                            <CanvasBackground/>
                            <DisplayModeBottomToolBar/>
                        </div>
                        <DetailsPanel
                            showCommunityPanel
                            mainStore={currentActiveStore} locale={this.locale}/>
                        <SophonModal
                            width={510}
                            shadowStyles={{alignItems: 'center'}}
                            className='community-panel'
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
                                    const tabRemains = await this.mainStore.closeTab(this.mainStore.currentToBeClosedPipeline!);
                                    this.mainStore.setCurrentToBeClosedPipeline(null);
                                    if (!tabRemains) {
                                        this.props.onTabCleared();
                                    }
                                },
                            }}
                            buttonAlign='center'
                        >
                            {!!toBeClosed && <div style={{
                                marginTop: 35,
                                fontSize: 16,
                                color: '#28374F',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column',
                            }}>
                                <Icon style={{color: '#FAAD14', fontSize: 60, marginBottom: 20}}
                                      type='exclamation-circle'/>
                                <span style={{
                                    fontWeight: 'bold',
                                    wordBreak: 'break-all',
                                    wordWrap: 'break-word',
                                    overflow: 'hidden',
                                }}>
                                    {getTranslation(this.props.locale, 'Dirty flow closure hint', {name: toBeClosed!.pipelineName})}</span>
                            </div>}
                        </SophonModal>
                        <TargetedLoading
                            store={this.mainStore} loadingTarget={LoadingTargets.LOAD_CONFIG}/>
                        <TargetedLoading
                            message={getTranslation(this.props.locale, 'Saving') + '..'}
                            store={this.mainStore}
                            loadingTarget={LoadingTargets.SAVING}
                        />
                    </div>

                </div>
            </ComplexCanvasConfigProvider>
        );
    }
}
