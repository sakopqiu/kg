import * as React from 'react';
import classNames from 'classnames';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';

import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {EditModePipelineModel} from '../../../models/EditModePipelineModel';
import {editCanvasInject} from '../EditCanvasUtils';
import {EditModeCanvasStore} from './EditModeCanvasStore';
import {NonEditableIcon} from '../../../icons/NonEditableIcon';
import _get from 'lodash/get';
import {LockIcon} from '../../../icons/LockIcon';
import {SophonMoreToolsHookWrapper} from '../../../components/SophonMoreTools/SophonMoreToolsHook';
import {CanvasTabMoreBtnItem} from '../../common/CanvasTabMoreBtnItem/CanvasTabMoreBtnItem';

@editCanvasInject
export class EditModeCanvasTabs extends EditModeCanvasComponent {

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

    get allStores() {
        const s = this.mainStore;
        return Array.from(s.storesByTab.values());
    }

    public render() {

        const allStores = this.allStores;
        const activeStore = this.currentActiveStore;
        return (
            <SophonMoreToolsHookWrapper
                moreBtntrigger='click'
                debugId='edit-mode-canvas-tabs'
                moreToolMenuItem={(index) => {
                    const cStore = allStores[index];
                    return (
                        <CanvasTabMoreBtnItem
                            isActive={cStore === activeStore}
                            store={cStore}
                        />
                    );
                }}
                className='canvas-tabs'
                awareWindowResize
                moreBtnStyle={{marginRight: 10}}
            >
                {allStores.map((s: EditModeCanvasStore) => (
                    <EditModeCanvasTab key={s.pipeline!.pipelineId} pipeline={s.pipeline!}/>
                ))}
            </SophonMoreToolsHookWrapper>
        );
    }
}

interface IEditCanvasTabProps extends IEditModeCanvasComponentProps {
    pipeline: EditModePipelineModel;
}

@editCanvasInject
export class EditModeCanvasTab extends EditModeCanvasComponent<IEditCanvasTabProps> {

    constructor(props: IEditCanvasTabProps) {
        super(props);
        this.switchTab = this.switchTab.bind(this);
        this.quit = this.quit.bind(this);
    }

    get nonSwitchable() {
        return _get(this.canvasConfig, 'tabConfig.tabNonSwitchable');
    }

    private async switchTab() {
        this.mainStore.switchTab(this.props.pipeline!);
    }

    private async quit(e: any) {
        e.stopPropagation();
        const pipeline = this.props.pipeline;
        // 编辑模式下有脏检查，浏览模式下永远弹出警告框
        if (pipeline.dirty) {
            this.mainStore.setCurrentToBeClosedPipeline(pipeline);
        } else {
            this.mainStore.closeTab(pipeline);
        }
    }

    public render() {
        const pipeline = this.props.pipeline;
        const selected = this.currentActiveStore ? this.currentActiveStore!.pipeline === pipeline : false;
        const dirtyMark = pipeline.dirty ? <span style={{marginLeft: 5, overflow: 'hidden', display: 'inline-block'}}>*</span> : null;

        // TODO locked状态应该用LockIcon，需要设计做一个
        return (
            <Tooltip title={pipeline.canonicalName}>
                <span
                    onClick={this.switchTab}
                    className={classNames('canvas-tab', {
                        selected,
                        disabled: this.nonSwitchable && !selected,
                    })}>
                    {(pipeline.readonly && !pipeline.locked) &&
                    <NonEditableIcon style={{marginRight: 3, fontSize: 16, position: 'relative', top: -5}}/>}
                    {(pipeline.locked) &&
                    <LockIcon style={{marginRight: 3, fontSize: 16, position: 'relative', top: -5}}/>}
                    <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', display: 'inline-block'}}>{pipeline.pipelineName}</span>
                    {dirtyMark}
                    {!this.nonSwitchable && <span onClick={this.quit} className='cross'>+</span>}
            </span>
            </Tooltip>
        );
    }
}
