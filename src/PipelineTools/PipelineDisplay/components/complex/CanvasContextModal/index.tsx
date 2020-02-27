import React from 'react';
import Button from 'antd/es/button';
import 'antd/es/button/style';

import {getTranslation} from '../../../../../utils';
import {complexInject} from '../../../DisplayCanvasUtils';
import './index.scss';
import {ComplexModeCanvasComponentProps} from '../ComplexModeCanvasComponent';
import {PositionHandler} from '../../../context_menu/PositionHandler';

interface ICanvasContextModalProps extends ComplexModeCanvasComponentProps {
    header?: string | React.ReactNode;
    onClose: () => void;
    onConfirm: () => void;
    className?: string;
    loading?: boolean;
}

@complexInject
export class CanvasContextModal extends PositionHandler<ICanvasContextModalProps> {
    public render() {
        return (
            <div
                ref={this.ref}
                className={`context-modal-wrapper ${this.props.className || ''}`}
                style={{left: this.stateService.canvasContextMenuX, top: this.stateService.canvasContextMenuY}}
            >
                {this.props.header &&
                <div className='context-modal-header'>
                    {this.props.header}
                </div>}
                <div className='context-modal-content'>
                    {this.props.children}
                </div>
                <div className='context-modal-footer'>
                    <Button size='small' className='cancel'
                            disabled={!!this.props.loading}
                            onClick={this.props.onClose}>{getTranslation(this.locale, 'Cancel')}</Button>
                    <Button
                        loading={this.props.loading}
                        size='small' type='primary' className='confirm'
                        onClick={this.props.onConfirm}>{getTranslation(this.locale, 'Confirm')}</Button>
                </div>
            </div>
        );
    }
}
