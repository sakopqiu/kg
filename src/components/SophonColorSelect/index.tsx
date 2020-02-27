import React, {useCallback, useRef, useState} from 'react';
import './index.scss';
import {ArrowDownIcon} from '../../icons/ArrowDownIcon';
import SketchPicker from 'react-color/lib/components/sketch/Sketch';
import {CrossIcon} from '../../icons/CrossIcon';
import {ColorResult} from 'react-color';

interface ISophonColorSelectProps {
    value?: string;
    onChange?: (value: string) => void;
}

// TODO: 当超出screen时候重新计算位置
export function SophonColorSelect(props: ISophonColorSelectProps) {
    const [showPicker, setShowPicker] = useState(false);
    const divRef = useRef<HTMLDivElement>();
    const onClose = useCallback(() => {
        setShowPicker(false);
    }, []);
    function onToggle(event: React.MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        setShowPicker(!showPicker);
    }
    const onChangeComplete = useCallback((event: ColorResult) => {
        if (props.onChange) {
            props.onChange(event.hex);
        }
    }, [props.onChange]);
    return (
        <div className='sophon-color-select' ref={(ref: HTMLDivElement) => divRef.current = ref}>
            <div className='color-select' onClick={onToggle}>
                <div className='color-code'>{props.value}</div>
                <ArrowDownIcon />
            </div>
            <div className='color-indicator' style={{backgroundColor: props.value}}/>
            {showPicker &&
            <div
                className='color-picker'
                style={{
                    top: divRef.current!.getBoundingClientRect().top + 32,
                    left: divRef.current!.getBoundingClientRect().left}}
            >
                <CrossIcon onClick={onClose} className='color-picker-close' />
                <SketchPicker
                    color={props.value}
                    onChangeComplete={onChangeComplete}
                />
            </div>}
        </div>
    );
}
