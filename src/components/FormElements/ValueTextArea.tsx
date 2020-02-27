import './index.scss';
import * as React from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';

import {observer} from 'mobx-react';
import {ValueLabel} from './ValueLabel';

const TextArea = Input.TextArea;

export interface IValueTextAreaProps {
    label: string;
    value: string;
    hint?: string;
    required: boolean;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<any>) => void;
}

@observer
export class ValueTextArea extends React.Component<IValueTextAreaProps> {
    public render() {
        return (
            <div className='value-render value-text-area'>
                <ValueLabel required={this.props.required} label={this.props.label}
                            hint={this.props.hint}
                />
                <TextArea
                    placeholder={this.props.placeholder}
                    value={this.props.value} onChange={(e: React.ChangeEvent<any>) => {
                    this.props.onChange(e);
                }}/>
            </div>
        );
    }
}
