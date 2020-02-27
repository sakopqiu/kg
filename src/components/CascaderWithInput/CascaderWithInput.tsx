import * as React from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Cascader, {CascaderOptionType} from 'antd/es/cascader';
import 'antd/es/cascader/style';
import './index.scss';

export interface CascaderWithInputProps {
    value?: string;
    defaultValue?: string;
    onChange?: (inputValue: string) => any;
    cascaderOptions: CascaderOptionType[];
    width?: number;
    size?: 'small' | 'default' | 'large';
    className?: string;
    style?: React.CSSProperties;
}

export function CascaderWithInput(props: CascaderWithInputProps) {
    const [inputValue, setInputValue] = React.useState(props.defaultValue || props.value || '');

    const condition1 = !!(props.value !== void 0);
    const condition2 = !!(props.onChange);
    if ((condition1 && !condition2) || (!condition1 && condition2)) {
        console.warn('value属性和onChange属性必须同时存在或者同时不存在');
    }

    const doChangeValue = React.useCallback((newVal: string) => {
        // 如果用户没有提供value属性，那么这个属性不收外界控制，则使用内部状态
        if (props.value === void 0) {
            setInputValue(newVal);
        } else {
            props.onChange!(newVal);
        }
    }, [props]);

    const cascaderOnChange = React.useCallback((newValue: string[]) => {
        const val = newValue[newValue.length - 1] || '';
        doChangeValue(val);
    }, [props]);

    const inputOnChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        doChangeValue(e.target.value);
    }, []);

    const width = props.width || 150;
    const size = props.size || 'small';

    const realVal = props.value === void 0 ? inputValue : props.value;

    const style = props.style ? {width, ...props.style} : {width};
    return (
        <div style={style}
             className={`cascader-with-input-wrapper ${props.className || ''}`}>
            <Input size={size} value={realVal} onChange={inputOnChange} className='cascader-with-input-input'/>
            <Cascader
                size={size}
                className='cascader-with-input-cascader' options={props.cascaderOptions}
                onChange={cascaderOnChange}/>
        </div>
    );
}
