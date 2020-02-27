import * as React from 'react';
import './index.scss';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';

export interface ISophonHintProps {
    style?: React.CSSProperties;
    className?: string;
    hint: string;
}

export class SophonHint extends React.Component<ISophonHintProps> {
    public render() {
        const className = `sophon-hint ${this.props.className || ''}`;
        return (
            <Tooltip title={this.props.hint}>
                <span className={className} style={this.props.style || {}}>
            ?
        </span>
            </Tooltip>
        );
    }
}
