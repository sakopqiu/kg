import './index.scss';
import * as React from 'react';
import Select, {SelectValue} from 'antd/es/select';
import 'antd/es/select/style';
import {getTranslation, KEY_VALUE_SEPARATOR, Locales} from '../../utils';
import classNames from 'classnames';
import {observer} from 'mobx-react';
import {ValueLabel} from './ValueLabel';

const Option = Select.Option;

export interface IValueSelectorProps {
    label?: string;
    locale: Locales;
    value?: SelectValue;
    hint?: string;
    required: boolean;
    placeholder?: string;
    hideLabel?: boolean;
    // 每一个option有两种格式，第一种为value@@showName，比如12345@@dataset1，那么显示给用户看的是dataset1，但是value是12345，
    // 或者是12345，那么显示给用户的和实际保存的都是12345，
    options: string[];
    onChange: (newValue: SelectValue) => void;
    onSelectAll?: (e: any) => void;
    multiple: boolean;
    style?: React.CSSProperties;
    className?: string;
    disallowClear?: boolean;
    disabled?: boolean;
}

@observer
export class ValueSelector extends React.Component<IValueSelectorProps> {

    constructor(props: IValueSelectorProps) {
        super(props);
        this.filterOption = this.filterOption.bind(this);
    }

    private filterOption(input: string, option: any) {
        const optionValue = option.props.children;
        return optionValue.toLowerCase().includes(input.toLowerCase());
    }

    public render() {
        const multipleMode = this.props.multiple ? {mode: 'multiple'} : {};
        const value = {value: this.props.value || ''} as any;
        return (
            <div
                style={this.props.style}
                className={classNames('value-selector', this.props.className, {'value-render': !this.props.hideLabel})}>
                {this.props.hideLabel ? null :
                    <div className='value-label-name'>
                        <ValueLabel required={this.props.required} label={this.props.label || ''}
                                    hint={this.props.hint}
                        />
                        {this.props.multiple ? <span
                            onClick={this.props.onSelectAll}
                            style={{
                                marginLeft: 10,
                                color: '#549BE7',
                                cursor: 'pointer',
                            }}>{getTranslation(this.props.locale, 'SelectAll')}</span> : null}
                    </div>
                }
                <Select
                    disabled={this.props.disabled}
                    {...multipleMode}
                    {...value}
                    placeholder={this.props.placeholder}
                    showSearch
                    allowClear={!this.props.disallowClear}
                    filterOption={this.filterOption}
                    onChange={(val: string) => {
                        this.props.onChange(val);
                    }}>
                    {this.props.options.map((o) => {
                        const [value, showName] = o.split(KEY_VALUE_SEPARATOR);
                        return (
                            <Option key={value} value={value}>{showName || value}</Option>
                        );
                    })}
                </Select>
            </div>
        );
    }
}
