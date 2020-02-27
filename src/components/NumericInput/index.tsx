import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';

import * as React from 'react';
import './index.scss';
import {getTranslation, Locales} from '../../utils';

// 摘自antd，Input控件的数字控件
function formatNumber(value: any) {
    value += '';
    const list = value.split('.');
    const prefix = list[0].charAt(0) === '-' ? '-' : '';
    let num = prefix ? list[0].slice(1) : list[0];
    let result = '';
    while (num.length > 3) {
        result = `,${num.slice(-3)}${result}`;
        num = num.slice(0, num.length - 3);
    }
    if (num) {
        result = num + result;
    }
    return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
}

export interface INumericInputProps {
    locale: Locales;
    onChange: (val: string) => void;
    style?: React.CSSProperties;
    className?: string;
    hideTooltip?: boolean;
    onBlur?: (val: string) => void;
    value: string;
}

const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

export class NumericInput extends React.Component<INumericInputProps> {

    onChange = (e: any) => {
        const {value} = e.target;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            this.props.onChange(value);
        }
    }

    // '.' at the end or only '-' in the input box.
    onBlur = () => {
        const {value, onBlur, onChange} = this.props;
        let newValue = value;
        if (value.charAt(value.length - 1) === '.' || value === '-') {
            newValue = value;
            onChange(newValue);
        }

        if (onBlur) {
            onBlur(newValue);
        }
    }

    render() {
        const {value} = this.props;
        const inputANumber = getTranslation(this.props.locale, 'Input a number');
        const title = value ?
            <span className='numeric-input-title'>
                {value !== '-' ? formatNumber(value) : '-'}
                </span>
            : inputANumber;

        const {hideTooltip, ...rest} = this.props;
        const input = <Input
            {...rest}
            onChange={this.onChange}
            onBlur={this.onBlur}
            placeholder={inputANumber}
            maxLength={25}
        />;
        return (
            hideTooltip ? input :
                <Tooltip
                    trigger={'focus'}
                    title={title}
                    placement='topLeft'
                    overlayClassName='numeric-input'
                >
                    {input}
                </Tooltip>
        );
    }
}
