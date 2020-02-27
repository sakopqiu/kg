import * as React from 'react';
import {observer} from 'mobx-react';
import Tooltip, {TooltipPlacement} from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import _noop from 'lodash/noop';
import _each from 'lodash/each';
import {getShownText} from '../utils';

export interface EllipsisTextProps {
    text: string;
    title?: string;
    length: number | string;
    cursor?: string;
    noTrailing?: boolean;
    mode?: 'textLength' | 'dimension' | 'shownLength'; // shownLength 会把非ascii码长度当做2, ascii码长度为1
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => any;
    noTooltip?: boolean;
    tooltipPlacement?: TooltipPlacement;
}

@observer
export default class EllipsisText extends React.Component<EllipsisTextProps> {

    get mode() {
        return this.props.mode || 'textLength';
    }

    render() {
        const {length, text} = this.props;

        let modifiedText = text;
        if (this.mode === 'textLength' && text.length > length) {
            const trailing = this.props.noTrailing ? '' : '..';
            modifiedText = text.substring(0, length as number) + trailing;
        } else if (this.mode === 'shownLength' && text) {
            const shownText = getShownText(text, length as number);
            if (text !== shownText) {
                const trailing = this.props.noTrailing ? '' : '..';
                modifiedText = shownText + trailing;
            }
        }
        let style: React.CSSProperties = {
            cursor: this.props.cursor !== undefined ? this.props.cursor : 'pointer',
            userSelect: 'none',
        };
        if (this.mode === 'dimension') {
            style.width = this.props.length;
            style.overflow = 'hidden';
            style.display = 'inline-block';
            style.whiteSpace = 'nowrap';
            style.textOverflow = 'ellipsis';
        }

        style = Object.assign(style, this.props.style || {});
        const className = this.props.className ? `sophon-ellipse-text ${this.props.className}` :
            'sophon-ellipse-text';

        const body = (
            <span data-name={this.props.title || text} style={style} onClick={this.props.onClick || _noop}
                  className={className}>
                {modifiedText}
                </span>
        );
        if (this.props.noTooltip) {
            return body;
        } else {
            return <Tooltip placement={this.props.tooltipPlacement || 'top'} title={this.props.title || text}>
                {body}
            </Tooltip>;
        }
    }

}
