import * as React from 'react';
import './index.scss';
import className from 'classnames';
import _noop from 'lodash/noop';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';

type MouseEventHandler = (e: React.MouseEvent<any>) => void;

export interface SophonIconProps {
    className?: string;
    style?: object;
    title?: string;
    hint?: string;
    disabled?: boolean;
    onClick?: MouseEventHandler;
    onMouseEnter?: MouseEventHandler;
    onMouseLeave?: MouseEventHandler;
}

export abstract class SophonIcon extends React.Component<SophonIconProps> {

    abstract get selfClassName(): string;

    render(): React.ReactNode {
        const body = <i title={this.props.title}
                        className={className(`sophon-icon ${this.selfClassName} ${this.props.className || ''}`,
                            {disabled: this.props.disabled})}
                        onClick={(e) => {
                            (this.props.onClick || _noop)(e);
                        }}
                        onMouseEnter={(e) => {
                            (this.props.onMouseEnter || _noop)(e);
                        }}
                        onMouseLeave={(e) => {
                            (this.props.onMouseLeave || _noop)(e);
                        }}
                        style={this.props.style || {}}/>;
        return this.props.hint ?
            <Tooltip title={this.props.hint} placement='bottom'>
                {body}
            </Tooltip>
            : body;
    }
}
