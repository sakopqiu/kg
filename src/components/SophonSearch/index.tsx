import * as React from 'react';
import {ChangeEvent, useCallback, useRef} from 'react';
import './index.scss';
import {SearchIcon} from '../../icons/SearchIcon';
import {CloseIcon} from '../../icons/CloseIcon';

export interface ISearchProps {
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
    onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function SophonSearch(props: ISearchProps) {
    const handleOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        props.onChange(e.target.value);
    }, [props.onChange]);

    const handleClear = useCallback(() => {
        props.onChange('');
        inputRef.current!.value = '';
    }, [props.onChange]);

    const inputRef = useRef<HTMLInputElement>();

    return (
        <div className={`sophon-search-div ${props.className || ''} `}
             style={props.style}
        >
            <input
                ref={(ref: HTMLInputElement) => inputRef.current = ref}
                className='sophon-search'
                onChange={handleOnChange}
                placeholder={props.placeholder}
                onKeyUp={props.onKeyUp}
            />
            <SearchIcon className='sophon-search-icon'/>
            {inputRef.current && inputRef.current.value && <CloseIcon onClick={handleClear} className='sophon-search-clear' />}
        </div>

    );
}
