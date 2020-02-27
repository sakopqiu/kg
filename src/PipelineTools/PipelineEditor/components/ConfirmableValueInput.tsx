import * as React from 'react';
import {observer} from 'mobx-react';
import {Locales} from '../../../utils';
import {ValueLabel} from '../../../components/FormElements/ValueLabel';

export interface IConfirmableValueInputProps {
    locale: Locales;
    label: string;
    hint?: string;
    value: string;
    placeholder?: string;
    onConfirm: (val: string) => boolean;
    errorMsg: string;
}

interface ValueState {
    value: string;
    isEdit: boolean;
    error: boolean;
}

@observer
export class ConfirmableValueInput extends React.Component<IConfirmableValueInputProps, ValueState> {

    private inputRef = React.createRef<HTMLInputElement>();
    private focusedOnBlur = false;
    private blurredByCancel = false;
    state = {
        value: this.props.value,
        isEdit: false,
        error: false,
    };

    constructor(props: IConfirmableValueInputProps) {
        super(props);
        this.cancel = this.cancel.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    private onFocus() {
        if (!this.focusedOnBlur) {
            this.setState({
                isEdit: true,
                error: false,
            });
        }
        this.focusedOnBlur = false;
    }

    private cancel() {
        this.setState({
            isEdit: false,
            value: this.props.value,
            error: false,
        });
        this.blurredByCancel = true;
        this.inputRef.current!.blur();
    }

    get v() {
        return this.state.value.trim();
    }

    private onBlur() {
        const exitNow = this.blurredByCancel;
        this.blurredByCancel = false;
        if (exitNow) {
            return;
        }
        // 等于没修改
        if (this.v === this.props.value) {
            this.setState({
                error: false,
                value: this.v,
                isEdit: false,
            });
            return;
        }
        const validated = this.props.onConfirm(this.v);
        if (validated) {
            this.setState({
                error: false,
                isEdit: false,
                value: this.v,
            });

        } else {
            this.setState({
                error: true,
                isEdit: true,
                value: this.v,
            });
            this.focusedOnBlur = true;
            this.inputRef.current!.focus();
        }
    }

    public render() {
        // 如果value一开始为空，不允许cancel
        return (
            <div className='value-render value-input'>
                <div className='value-label-name'>
                    <ValueLabel required={true} label={this.props.label} hint={this.props.hint}/>
                    {/*{this.state.isEdit && this.props.value ?*/}
                    {/*<span*/}
                    {/*onClick={this.cancel}*/}
                    {/*className='attribute-interaction cancel-singleton'>*/}
                    {/*{getTranslation(this.props.locale, 'Cancel')}*/}
                    {/*</span>*/}
                    {/*: null*/}
                    {/*}*/}
                </div>
                <input
                    style={{
                        padding: '4px 11px',
                    }}
                    ref={this.inputRef}
                    placeholder={this.props.placeholder}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    value={this.state.value} onChange={(e: React.ChangeEvent<any>) => {
                    this.setState({
                        error: false,
                        value: e.target.value,
                    });
                }}/>
                {
                    this.state.error ?
                        <div className={'confirm-error-msg'}>{this.props.errorMsg}</div>
                        : null
                }
            </div>
        );
    }
}
