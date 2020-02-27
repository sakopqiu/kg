import * as React from 'react';
import './LargeIcon.scss';
import {IIconConfig} from '../../../interfaces';
import {complexInject} from '../../../DisplayCanvasUtils';
import classNames from 'classnames';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';

import uuid from 'uuid';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';

interface ILargeIconProps extends ComplexModeCanvasComponentProps {
    iconConfig: IIconConfig;
}

@complexInject
export class LargeIcon extends ComplexModeCanvasComponent<ILargeIconProps> {
    private onClick = (e: any) => {
        this.props.iconConfig.onClick(e);
    }

    public render() {
        const {title, icon: IconElement, enabledFunc, popoverOverlayClassName = ''} = this.props.iconConfig;
        const id = this.props.iconConfig.id || uuid();

        const disabled = !this.props.iconConfig.enabledFunc();
        const body = <React.Fragment>
            {<IconElement disabled={disabled}/>}
            <span className='large-icon-title'>{title}</span>
        </React.Fragment>;

        return this.props.iconConfig.popover ?
            <Popover trigger='click'
                     overlayClassName={popoverOverlayClassName}
                     placement={'bottom'}
                     content={this.props.iconConfig.popover}>
                <div id={id} className={classNames('large-icon-wrapper', {disabled: !enabledFunc()})}>
                    {body}
                </div>
            </Popover>
            :
            this.props.iconConfig.hint ?
                <Tooltip title={this.props.iconConfig.hint}>
                    <div id={id} onClick={this.onClick} className={classNames('large-icon-wrapper', {disabled})}>
                        {body}
                    </div>
                </Tooltip>
                : <div id={id} onClick={this.onClick} className={classNames('large-icon-wrapper', {disabled})}>
                    {body}
                </div>;
    }
}
