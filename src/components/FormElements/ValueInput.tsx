import './index.scss';
import * as React from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import {observer} from 'mobx-react';
import {ValueLabel} from './ValueLabel';

export interface IValueInputProps {
    label: string;
    value: string;
    hint?: string;
    required: boolean;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<any>) => void;
    readonly?: boolean;
}

@observer
export class ValueInput extends React.Component<IValueInputProps> {
    public render() {
        return (
            <div className='value-render value-input'>
                <ValueLabel required={this.props.required} label={this.props.label}
                hint={this.props.hint}
                />
                <Input
                    placeholder={this.props.placeholder}
                    disabled={this.props.readonly}
                    value={this.props.value} onChange={(e: React.ChangeEvent<any>) => {
                    if (this.props.onChange) {
                        this.props.onChange(e);
                    }
                }}/>
            </div>
        );
    }
}
