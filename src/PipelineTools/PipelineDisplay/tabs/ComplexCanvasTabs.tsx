import * as React from 'react';
import classNames from 'classnames';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import {DisplayModeCanvasStore} from '../stores/DisplayModeCanvasStore';
import {DisplayModePipelineModel} from '../../../models/DisplayModePipelineModel';
import {complexInject} from '../DisplayCanvasUtils';
import './index.scss';
import EllipsisText from '../../../components/EllipsisText';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../components/complex/ComplexModeCanvasComponent';
import {SophonMoreToolsHookWrapper} from '../../../components/SophonMoreTools/SophonMoreToolsHook';
import {CanvasTabMoreBtnItem} from '../../common/CanvasTabMoreBtnItem/CanvasTabMoreBtnItem';

@complexInject
export class ComplexCanvasTabs extends ComplexModeCanvasComponent {

    componentDidMount() {
        window.onbeforeunload = this.onLeaveHandler;
    }

    componentWillUnmount() {
        window.onbeforeunload = null;
    }

    private onLeaveHandler() {
        // 不需要做任何事，返回系统信息
        return true;
    }

    public render() {
        const s = this.mainStore;
        const allStores = Array.from(s.storesByTab.values());
        const activeStore = this.currentActiveStore;

        return (
            <SophonMoreToolsHookWrapper
                debugId='complex-canvas-tabs'
                moreBtntrigger='click'
                moreToolMenuItem={(index) => {
                    const cStore = allStores[index];
                    return (
                        <CanvasTabMoreBtnItem
                            isActive={cStore === activeStore}
                            store={cStore}
                        />
                    );
                }}
                className='display-mode-tabs  canvas-tabs'
                awareWindowResize
                moreBtnStyle={{marginRight: 10}}
            >
                {allStores.map((s: DisplayModeCanvasStore) => (
                    <ComplexCanvasTab key={s.pipeline!.pipelineId} pipeline={s.pipeline!}/>
                ))}
            </SophonMoreToolsHookWrapper>
        );
    }
}

interface IComplexCanvasTabProps extends ComplexModeCanvasComponentProps {
    pipeline: DisplayModePipelineModel;
}

@complexInject
export class ComplexCanvasTab extends ComplexModeCanvasComponent<IComplexCanvasTabProps> {

    constructor(props: IComplexCanvasTabProps) {
        super(props);
        this.switchTab = this.switchTab.bind(this);
        this.quit = this.quit.bind(this);
    }

    private switchTab() {
        this.mainStore.switchTab(this.props.pipeline);
    }

    private async quit(e: any) {
        e.stopPropagation();
        const p = this.props.pipeline!;
        // 编辑模式下有脏检查，浏览模式下永远弹出警告框
        this.mainStore.setCurrentToBeClosedPipeline(p);
        return;
    }

    public render() {
        const pipeline = this.props.pipeline;
        const selected = this.currentActiveStore ? this.currentActiveStore!.pipeline === pipeline : false;
        const content = (
            <span
                onClick={this.switchTab}
                className={classNames('display-mode-tab canvas-tab', {selected})}>
                    <EllipsisText noTooltip text={pipeline.name} length={18} mode='shownLength'/>
                    <span onClick={this.quit} className='cross'>+</span>
            </span>
        );
        return this.props.canvasConfig!.displayModeConfig.hideTabTooltip ?
            content : (
                <Tooltip title={pipeline.canonicalName} placement='bottom'>
                    {content}
                </Tooltip>
            );
    }
}
