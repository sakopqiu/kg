import * as React from 'react';
import './MiniIcon.scss';
import {IIconConfig} from '../../../interfaces';
import classNames from 'classnames';
import {complexInject} from '../../../DisplayCanvasUtils';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import uuid from 'uuid';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';

interface IMiniIconProps extends ComplexModeCanvasComponentProps {
    iconConfig: IIconConfig;
}

@complexInject
export class MiniIcon extends ComplexModeCanvasComponent<IMiniIconProps> {

    private onClick = (e: any) => {
        this.props.iconConfig.onClick(e);
    }

    public render() {
        const {title, icon: IconElement, hint, enabledFunc, hideTriangle, popoverOverlayClassName = ''} = this.props.iconConfig;
        const id = this.props.iconConfig.id || uuid();
        const body =
            <React.Fragment>
                <IconElement disabled={!enabledFunc()}/>
                {title}
                {!hideTriangle && <div className='down-triangle'/>}
            </React.Fragment>;

        return this.props.iconConfig.popover ?
            <Popover trigger='click' overlayClassName={popoverOverlayClassName}
                     placement={'bottom'}
                     content={this.props.iconConfig.popover}>
                <div id={id} className={classNames('mini-icon-wrapper', {disabled: !enabledFunc()})}>
                    {body}
                </div>
            </Popover>
            :
            this.props.iconConfig.hint ?
                <Tooltip title={this.props.iconConfig.hint}>
                    <div id={id} title={hint || title} onClick={this.onClick}
                         className={classNames('mini-icon-wrapper', {disabled: !enabledFunc()})}>
                        {body}
                    </div>
                </Tooltip>
                : <div id={id} title={hint || title} onClick={this.onClick}
                       className={classNames('mini-icon-wrapper', {disabled: !enabledFunc()})}>
                    {body}
                </div>;
    }
}
