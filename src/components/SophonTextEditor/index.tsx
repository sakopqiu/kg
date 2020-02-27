import React, {useState} from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import {useGetElementRef, useInputValueChange} from '../../components/SophonHooks/hookUtils';
import './index.scss';
import {EditorIcon} from '../../icons/EditorIcon';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import {useLoadingEffect} from '../../components/SophonHooks/LoadingEffect';

interface ISophonTextEditorProps {
    value: string;
    onChange: (value?: string) => Promise<void>;
    size?: 'large' | 'small' | 'default'; // large: 20px, small: 12px, default: 14px
    showTooltip?: boolean;
    className?: string;
    placeholder?: string;
    color?: string;
}

export function SophonTextEditor(props: ISophonTextEditorProps) {
    const [inputValue, onInputChange, setInputValue] = useInputValueChange();
    const [inputRef, getInputRef] = useGetElementRef<Input>();
    const [show, setShow] = useState();
    const [onChangeWrapper, onChangeWrapperLoading] = useLoadingEffect(props.onChange);
    async function handleInputConfirm() {
        await onChangeWrapper(inputValue);
        setShow(false);
    }
    function edit() {
        setShow(true);
        setInputValue(props.value);
        setTimeout(() => {
            inputRef.current!.focus();
        });
    }
    const realSize = props.size || 'default';
    return (
        <div className={`sophon-text-editor ${props.className || ''}`}>
            {show &&
                <Input
                    placeholder={props.placeholder}
                    className={`text-input ${realSize}`}
                    ref={getInputRef}
                    size={realSize as any}
                    value={inputValue}
                    onChange={onInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    suffix={onChangeWrapperLoading ? <Icon type={'loading'} /> : undefined}
                    style={{color: props.color}}
                />
            }
            {!show && (
                <span
                    title={props.showTooltip ? props.value : undefined}
                    className={`text-label ${props.showTooltip ? 'one-line' : ''} ${realSize}`}
                    onClick={edit}
                    // TODO antd small input在chrome 下 高度不是16是17这边特殊处理了下
                    style={{color: props.color}}
                >
                    {props.value || props.placeholder}
                    <EditorIcon />
                </span>
            )}
        </div>
    );
}
