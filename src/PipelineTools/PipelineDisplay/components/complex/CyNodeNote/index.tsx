import React from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';

import {action} from 'mobx';
import './index.scss';
import _first from 'lodash/first';
import {complexInject} from '../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../ComplexModeCanvasComponent';
import {CanvasContextModal} from '../CanvasContextModal';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import {getTranslation} from '../../../../../utils';

const TextArea = Input.TextArea;

@complexInject
export class CyNodeNote extends ComplexModeCanvasComponent {
    private note: string;

    get currentNode() {
        const selectedNode = _first(this.stateService.helperService.selectedCyNodesData);
        return selectedNode ? this.cyState.cyNode(selectedNode.id)! : null;
    }

    get oldNote() {
        return this.currentNode ? this.currentNode.data.note : undefined;
    }

    public render() {
        return (
            this.currentActiveStore && this.stateService.showNodeNote ?
                <CanvasContextModal
                    loading={this.currentActiveStore!.isLoading(LoadingTargets.BUTTON_OK)}
                    className='annotation-wrapper'
                    onClose={this.onClose}
                    onConfirm={this.onSave}
                    header={<span className='note-header'>{getTranslation(this.locale, 'Note')}</span>}
                >
                    <TextArea
                        rows={16}
                        cols={64}
                        className='annotation-content'
                        defaultValue={this.oldNote}
                        onChange={this.onChange}
                    />
                </CanvasContextModal>
                : null
        );
    }

    @action
    private onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.note = event.target.value.trim();
    }

    private onSave = async () => {
        const data = this.currentNode!.data;
        const callbacks = this.canvasConfig!.displayModeConfig!.callbacks;
        if (callbacks) {
            if (callbacks.noteChanged) {
                await callbacks.noteChanged(data.id, data.nodeType, this.note);
            }
        }
        data.setNote(this.note.trim());
        this.onClose();
    }

    @action
    private onClose = () => {
        this.stateService.setShowNodeNote(false);
    }
}
