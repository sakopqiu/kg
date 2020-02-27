import React from 'react';
import Select from 'antd/es/select';
import 'antd/es/select/style';

import './index.scss';
import {getTranslation} from '../../../../../utils';
import {complexInject} from '../../../DisplayCanvasUtils';
import {CanvasContextModal} from '../../complex/CanvasContextModal';
import _first from 'lodash/first';
import {CyNodeData} from '../../../model/CyNode';
import {observable, runInAction} from 'mobx';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import {ComplexModeCanvasComponent} from '../ComplexModeCanvasComponent';

const Option = Select.Option;

@complexInject
export class TagSelect extends ComplexModeCanvasComponent {
    @observable private temporaryChanges: string[] = this.initializedTags;
    private selectRef: HTMLSelectElement;

    get initializedTags() {
        const selectedNodes = this.stateService.helperService.selectedCyNodesData;
        // initialize the existing tags only for one node selected
        if (selectedNodes.length === 1) {
            // 只有一个节点被选中的话，显示已经被打上的标签
            return _first(selectedNodes)!.tags.filter((t) => t.trim().length > 0);
        } else {
            // 多个节点选中的情况下，默认tags为空，因为每个节点已有tags不一样
            return [];
        }
    }

    public render() {
        return (
            <CanvasContextModal
                loading={this.currentActiveStore!.isLoading(LoadingTargets.BUTTON_OK)}
                header={<span className='tag-header'>{getTranslation(this.locale, 'Tags')}</span>}
                onConfirm={this.onSave}
                onClose={this.onClose}
                className='tags-wrapper'
            >
                <div className='tag-label'>{getTranslation(this.locale, 'Current Tags')}</div>
                <Select
                    ref={this.getRef}
                    mode='tags'
                    placeholder={getTranslation(this.locale, 'Select tag')}
                    value={this.temporaryChanges}
                    onChange={this.onChange}
                    style={{width: '100%'}}
                    notFoundContent={getTranslation(this.locale, 'Type and create your own tag')}
                >
                    {this.currentActiveStore!.allTags.map((tag) => (
                        <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                </Select>
            </CanvasContextModal>
        );
    }

    private getRef = (ref: any) => {
        this.selectRef = ref;
    }

    private onChange = (values: string[]) => {
        runInAction(() => {
            this.temporaryChanges = values.filter((v) => v.trim().length > 0);
        });
        this.selectRef.blur();
    }

    private onSave = async () => {
        const nodesData = this.stateService.helperService.selectedCyNodesData;
        const callbacks = this.canvasConfig!.displayModeConfig!.callbacks;

        if (callbacks && callbacks.tagUpdated) {
            await callbacks.tagUpdated(nodesData.map((data: CyNodeData) => ({
                nodeId: data.id,
                nodeType: data.nodeType,
            })), this.temporaryChanges);
        }
        this.stateService.elementService.updateTags(nodesData, this.temporaryChanges);
        this.onClose();
    }

    private onClose = () => {
        this.stateService.setShowCanvasTag(false);
    }
}
