import React from 'react';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import './index.scss';
import {RadioChangeEvent} from 'antd/es/radio';
import {action, observable} from 'mobx';
import {complexInject} from '../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../ComplexModeCanvasComponent';
import {CanvasContextModal} from '../CanvasContextModal';
import {getTranslation} from '../../../../../utils';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';

const RadioGroup = Radio.Group;

@complexInject
export default class MergeEntitiesModal extends ComplexModeCanvasComponent {
    // Merge entities requires at least two nodes, default selected id is the first one
    @observable private selectedId: string = this.helperService.selectedCyNodesData[0].id;

    get service() {
        return this.currentActiveStore!.canvasDrawService;
    }

    public render() {
        return (
            <CanvasContextModal
                loading={this.currentActiveStore!.isLoading(LoadingTargets.BUTTON_OK)}
                header={<span className='merge-entities-header'>{getTranslation(this.locale, 'Merge Entities')}</span>}
                onConfirm={this.onConfirm}
                onClose={this.onClose}
                className='merge-entities-wrapper'
            >
                <RadioGroup
                    name='entities'
                    className='merge-entities'
                    onChange={this.onChange}
                    value={this.selectedId}
                >
                    {this.helperService.selectedCyNodesData.map((node) => (
                        <div key={node.id}>
                            <Radio value={node.id}>{node.name}</Radio>
                            {this.selectedId === node.id && Array.from(node.params.keys()).map((attr) => (
                                <div className='attr-row' key={attr}>
                                    <span className='attr-label'>{attr}: </span>
                                    <span className='attr-value'>{node.getValue(attr)}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </RadioGroup>
                <Divider/>
            </CanvasContextModal>
        );
    }

    @action
    private onChange = (event: RadioChangeEvent) => {
        this.selectedId = event.target.value;
    }

    private onConfirm = async () => {
        const callbacks = this.canvasConfig!.displayModeConfig!.callbacks;
        if (callbacks && callbacks.nodesMerged) {
            await callbacks.nodesMerged(this.selectedId, this.helperService.selectedCyNodesData.map((node) => node.id));
        }
        this.stateService.setShowMergeEntitiesModal(false);
    }

    private onClose = () => {
        this.stateService.setShowMergeEntitiesModal(false);
    }
}
