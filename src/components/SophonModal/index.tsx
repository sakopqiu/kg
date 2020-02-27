import * as React from 'react';
import {getTranslation, Locales} from '../../utils';
import './index.scss';
import classNames from 'classnames';
import Button from 'antd/es/button';
import 'antd/es/button/style';

import {default as animationMount, ShowStateProps} from '../AnimationMount';
import {createPortal} from 'react-dom';
import {FullScreenSquareIcon} from '../../icons/FullScreenSquareIcon';
import {CanvasFitIcon} from '../../icons/CanvasFitIcon';
import {CloseIcon} from '../../icons/CloseIcon';

export interface ISophonModalProps extends ShowStateProps {
    locale: Locales;
    title: string | React.ReactNode;
    children: React.ReactNode;
    width?: number | string;
    height?: number | string;
    topPadding?: number;
    bottomPadding?: number;
    style?: React.CSSProperties;
    bodyStyle?: React.CSSProperties;
    noShadow?: boolean;
    className?: string;
    buttonsStyle?: React.CSSProperties;
    loading?: boolean;
    buttonAlign?: 'center' | 'left' | 'right';
    cancelOption?: {
        text?: string;
        showCross: boolean;
        onCancel?: () => void;
        disabled?: boolean;
    };
    confirmOption?: {
        text?: string;
        onConfirm?: () => void;
        disabled?: boolean;
    };
    fref?: React.RefObject<any>; // forwarded ref
    // 是否detach到外层div，以portal形式展现
    renderAsPortal?: boolean;
    shadowStyles?: React.CSSProperties; // modal 底层阴影的样式,可以用它控制台modal的居中效果
    hitShadowClose?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode; // customized footer
    showMaximizeButton?: boolean; // 控制最大化按钮显示
    defaultMaximize?: boolean; // 默认最大化
    draggble?: boolean;        // 是否允许拖拽
}

interface SophonModalStateConfig {
    height: string | number;
    width: string | number;
    disX: number;
    disY: number;
    maximize: boolean;
    dragged: boolean;   // 如果触发拖拽后，整体布局就不能使用flex布局
}

@animationMount('sophon-fade', 'sophon-modal')
export class SophonModal extends React.Component<ISophonModalProps, SophonModalStateConfig> {
    resizeEvent: Event;
    modalRef: React.RefObject<any> = React.createRef();

    constructor(props: ISophonModalProps) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onCrossClicked = this.onCrossClicked.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.resetModalSize(true);
        this.resizeEvent = document.createEvent('Event');
        this.resizeEvent.initEvent('resizeModal');
        if (this.props.fref) {
            this.modalRef = this.props.fref;
        }
    }

    get vPadding() {
        return (this.props.topPadding || 0) + (this.props.bottomPadding || 0);
    }

    onCancel() {
        if (!this.props.loading && this.props.cancelOption && this.props.cancelOption.onCancel) {
            this.props.cancelOption!.onCancel();
        }
    }

    onCrossClicked(e: any) {
        e.stopPropagation();
        this.onCancel();
    }

    onConfirm() {
        if (!this.props.loading && this.props.confirmOption!.onConfirm) {
            this.props.confirmOption!.onConfirm();
        }
    }

    onHitShadow() {
        if (!!this.props.hitShadowClose) {
            this.onCancel();
        }
    }

    stopPop(e: React.MouseEvent<HTMLElement>) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }

    onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Esc' || e.key === 'Escape' || e.keyCode === 27) {
            this.onCancel();
        }
    }

    modalMaximize = () => {
        this.setState({
            maximize: true,
            height: '90vh',
            width: '90vw',
        });
        if (this.resizeEvent) {
            this.resizeEvent['data'] = {maximize: true};  // 使用document.addEventListener('resizeModal', (e: Event) => setIsMaxSize(_get(e, 'data.maximize'))) 监听模态框变化事件
            document.dispatchEvent(this.resizeEvent);
        }
    }

    resetModalSize = (init?: boolean) => {
        const initState = {
            height: this.props.height || (!this.vPadding || window.innerHeight < this.vPadding ? 'auto' : `calc(100% - ${this.vPadding}px)`),
            width: this.props.width || '',
            maximize: false,
            disX: 0,
            disY: 0,
            dragged: false,
        };
        if (init) {
            this.state = initState;
        } else {
            this.setState(initState);
        }
        if (this.resizeEvent) {
            this.resizeEvent['data'] = {maximize: false};
            document.dispatchEvent(this.resizeEvent);
        }
    }

    mouseMove = (ev: MouseEvent) => {
        const dragModal = this.modalRef.current as any;
        const ev2 = ev || window.event;
        let x = ev2.clientX - this.state.disX;
        let y = ev2.clientY - this.state.disY;

        if (x < 0) {
            x = 0;
        } else if (x > document.documentElement!.clientWidth - dragModal!.clientWidth) {
            x = document.documentElement!.clientWidth - dragModal!.clientWidth;
        }

        if (y < 0) {
            y = 0;
        } else if (y > document.documentElement!.clientHeight - dragModal!.clientHeight) {
            y = document.documentElement!.clientHeight - dragModal!.clientHeight;
        }

        dragModal!.style.top = y + 'px';
        dragModal!.style.left = x + 'px';
    }

    mouseUp = () => {
        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener('mouseup', this.mouseUp);
    }

    onMouseDown = (e: React.MouseEvent) => {
        const ev1 = e || window.event;
        const dragModal = this.modalRef.current as any;
        const {offsetTop, offsetLeft} = dragModal!;
        const disX = ev1.clientX - offsetLeft;
        const disY = ev1.clientY - offsetTop;
        dragModal.style.marginTop = 0;

        this.setState(
            {
                disX,
                disY,
                dragged: true,
            },
            () => {
                dragModal.style.margin = 'unset';
                dragModal.style.top = offsetTop + 'px';
                dragModal.style.left = offsetLeft + 'px';
                document.addEventListener('mousemove', this.mouseMove);
                document.addEventListener('mouseup', this.mouseUp);
            },
        );
        return false;
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown, true);
        !!this.props.defaultMaximize && this.modalMaximize();
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown, true);
        document.removeEventListener('mousemove', this.mouseMove, true);
        document.removeEventListener('mouseup', this.mouseUp, true);
    }

    // 如果noShadow为true，那么sophon-shadow就作用在modal本身，并且外部传进来的shadowStyle也作用于modal
    getBody(shadowStyle: any) {
        const locale = this.props.locale;
        const cancelBtnDisabled = !!this.props.cancelOption && !!this.props.cancelOption.disabled;
        const confirmBtnDisabled = !!this.props.confirmOption && !!this.props.confirmOption.disabled;
        return (
            <div ref={this.props.fref || this.modalRef}
                 className={classNames('sophon-modal', this.props.className, this.props.noShadow ? 'sophon-shadow' : '')}
                 style={{
                     width: this.state.width,
                     height: this.state.height,
                     marginTop: this.state.maximize ? 30 : (this.props.topPadding || 0),
                     ...this.props.style,
                     ...(this.props.noShadow ? shadowStyle : {}),
                 }}
                 onClick={this.stopPop}
            >
                {this.props.header !== undefined ?
                    this.props.header
                    :
                    <div className='sophon-modal-header' onMouseDown={this.props.draggble ? this.onMouseDown : void 0}>
                        {this.props.title}
                        {this.props.showMaximizeButton ? (
                            this.state.maximize ?
                                <CanvasFitIcon
                                    className='maximize'
                                    onClick={() => this.resetModalSize()}
                                /> :
                                <FullScreenSquareIcon
                                    className='maximize'
                                    onClick={this.modalMaximize}
                                />
                        ) : null}
                        {!!this.props.cancelOption && this.props.cancelOption.showCross ?
                            <CloseIcon className='cross' onClick={this.onCrossClicked}/> : null}
                    </div>
                }
                <div className='sophon-modal-body' style={this.props.bodyStyle || {}}>
                    {this.props.children}
                </div>

                {this.props.footer !== undefined ? this.props.footer :
                    <div className='sophon-modal-footer' style={{textAlign: this.props.buttonAlign}}>
                        <div className='sophon-modal-buttons' style={this.props.buttonsStyle}>
                            <>
                                {
                                    !!this.props.cancelOption &&
                                    <Button onClick={this.onCancel}
                                            disabled={cancelBtnDisabled || this.props.loading}
                                            className='sophon-modal-button cancel-button'
                                    >{this.props.cancelOption.text || getTranslation(locale, 'Cancel')}</Button>
                                }
                                {
                                    !!this.props.confirmOption &&
                                    <Button onClick={this.onConfirm}
                                            loading={this.props.loading}
                                            disabled={confirmBtnDisabled || this.props.loading}
                                            className='sophon-modal-button confirm-button'
                                            type='primary'>{this.props.confirmOption.text || getTranslation(locale, 'Confirm')}</Button>
                                }
                            </>
                        </div>
                    </div>
                }
            </div>
        );
    }

    render() {
        // shadowStyles中可以通过 topPadding, bottomPadding 控制模态框垂直方向上的位置和高度, 若 topPadding 与 bottomPadding 不设置或之和大于屏高,高度会变为'auto'
        // topPadding, bottomPadding 不设置,又弹窗需要垂直居中时可设置 shadowStyles={{alignItems: 'center'}}
        const {position, ...restStyles} = this.props.shadowStyles || {position: 'fixed'} as React.CSSProperties;

        const shadowStyle = {
            position: position || 'fixed',
            justifyContent: 'center',
            ...restStyles,
            display: this.props.noShadow ? 'flex' : this.state.dragged ? 'block' : 'flex',
        };
        const body = this.getBody(shadowStyle);

        return this.props.renderAsPortal ?
            <PortalComponent
                shawdowStyle={shadowStyle}
                onClick={() => this.onHitShadow()}
                noShadow={!!this.props.noShadow}
                body={body}/>
            :
            (
                this.props.noShadow ? body :
                    <div className='sophon-shadow'
                         style={shadowStyle}
                         onClick={() => this.onHitShadow()}>
                        {body}
                    </div>
            );
    }
}

export interface ModalContainerProps {
    shawdowStyle: React.CSSProperties;
    onClick: () => void;
    noShadow: boolean;
    body: React.ReactNode;
}

const appRoot = document.getElementById('root');

class PortalComponent extends React.Component<ModalContainerProps> {
    render() {
        const {shawdowStyle, onClick} = this.props;
        if (this.props.noShadow) {
            return createPortal(
                this.props.body,
                appRoot!,
            );
        } else {
            return createPortal(
                <div className='sophon-shadow' style={shawdowStyle} onClick={onClick}>
                    {this.props.body}
                </div>,
                appRoot!,
            );
        }

    }
}
