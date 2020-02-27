import React from 'react';
import './SophonConfirmModal.scss';
import {observer} from 'mobx-react';
import {SophonModal} from './index';
import {getTranslation, Locales} from '../../utils';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';

interface ISophonConfirmModalProps {
    onClose?: () => void;
    onConfirm?: () => void;
    confirmMessage: string | React.ReactNode;
    locale: Locales;
    confirmText?: string;
    cancelText?: string;
    title: string;
    visible: boolean;
    loading?: boolean;
    className?: string;
    hideIcon?: boolean;
    footer?: React.ReactNode; // customized footer and discard all default footer
    disallowCloseOnHitShadow?: boolean;
    hideCross?: boolean;
}

@observer
export class SophonConfirmModal extends React.Component<ISophonConfirmModalProps> {
    public render() {
        return (
            <SophonModal
                width={510}
                shadowStyles={{alignItems: 'center'}}
                className={`sophon-confirm-modal ${this.props.className || ''}`}
                showState={this.props.visible}
                locale={this.props.locale}
                title={this.props.title || getTranslation(this.props.locale, 'Confirm')}
                loading={this.props.loading}
                cancelOption={!this.props.footer && this.props.onClose ? {
                    showCross: !this.props.hideCross,
                    onCancel: this.props.onClose,
                    text: this.props.cancelText,
                } : undefined}
                confirmOption={!this.props.footer ? {
                    onConfirm: this.props.onConfirm,
                    text: this.props.confirmText,
                } : undefined}
                buttonAlign='center'
                hitShadowClose={!this.props.disallowCloseOnHitShadow}
                footer={this.props.footer}
            >
                <div className='confirm-message-wrapper'>
                    {
                        this.props.hideIcon
                        ? null
                        : <Icon className='confirm-icon' type='exclamation-circle'/>
                    }
                    <div className='confirm-message' >{this.props.confirmMessage}</div>
                </div>
            </SophonModal>
        );
    }
}
