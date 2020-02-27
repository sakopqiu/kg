import React, {useCallback, useState} from 'react';
import Tag from 'antd/es/tag';
import 'antd/es/tag/style';
import _remove from 'lodash/remove';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import {useGetElementRef, useInputValueChange} from '../SophonHooks/hookUtils';
import {getTranslation, Locales} from '../../utils';
import './index.scss';

interface ISophonTagProps {
    value?: string[];
    onChange?: (tags: string[]) => void;
    locale: Locales;
}

export function SophonTag(props: ISophonTagProps) {
    const [inputValue, onInputChange, setInputValue] = useInputValueChange();
    const [inputRef, getInputRef] = useGetElementRef<Input>();
    const [show, setShow] = useState();
    const {value, onChange} = props;
    const tags = value || [];
    const handleClose = useCallback((tag: string) => {
        const newTags = [...tags];
        _remove(newTags, tag);
        if (onChange) {
            onChange(newTags);
        }
    }, [onChange]);
    function handleInputConfirm() {
        if (inputValue && tags.indexOf(inputValue) === -1) {
            const newTags = [...tags, inputValue];
            if (onChange) {
                onChange(newTags);
            }
        }
        setInputValue('');
        setShow(false);
        inputRef.current!.blur();
    }
    function handleAddTag() {
        setShow(true);
        setTimeout(() => {
            inputRef.current!.focus();
        });
    }
    return (
        <div className={'sophon-tag-wrapper'}>
            {tags.map(tag => (
                <Tag key={tag} closable onClose={() => handleClose(tag)}>
                    {tag}
                </Tag>))}
            {show && (
                <Input
                    ref={getInputRef}
                    type='text'
                    size='small'
                    style={{ width: 78 }}
                    value={inputValue}
                    onChange={onInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!show && (
                <Tag className='new-tag-btn' onClick={handleAddTag}>
                    <Icon type='plus' /> {getTranslation(props.locale, 'New Tag')}
                </Tag>
            )}
        </div>
    );
}
