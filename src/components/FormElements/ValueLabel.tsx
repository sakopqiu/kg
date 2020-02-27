import * as React from 'react';
import {RequiredMark} from '../RequiredMark';
import {SophonHint} from '../SophonHint/SophonHint';

export interface IValueLabel {
    required: boolean;
    label: string;
    hint?: string;
}

export class ValueLabel extends React.Component<IValueLabel> {
    render() {
        return (
            <div className='value-label-name'>
                {this.props.required ? <RequiredMark/> : null}
                {this.props.label}
                {this.props.hint && <SophonHint
                    className='value-hint'
                    hint={this.props.hint}/>}
            </div>
        );
    }
}
