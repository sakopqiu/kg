import React, {useCallback} from 'react';
import './IconSelect.scss';
import Cascader, {CascaderOptionType, CascaderProps} from 'antd/es/cascader';
import 'antd/es/cascader/style';
import {getTranslation, Locales} from '../../../../utils';
import {CyTheme} from '../../../PipelineDisplay/model/CyState';
import {DEFAULT_ICON_OPTIONS, IconOption} from '../../../common/cytoscapeCommonStyle';
import _capitalize from 'lodash/capitalize';

interface IIconSelectProps extends Pick<CascaderProps, Exclude<keyof CascaderProps, 'options'>> {
    iconOptions?: IconOption[]; // 不传默认用DEFAULT_ICON_OPTIONS;
    locale: Locales;
    theme?: CyTheme; // 目前未用到
}

interface IconImageProps {
    size?: number;
    image: string;
    value: string;
}

function IconImage(props: IconImageProps) {
    const size = props.size || 20;
    return (
        <span key={props.value} className='icon-image-wrapper'>
            <img style={{width: size, height: size}} className='icon-image' src={props.image} alt={props.value} />
        </span>
    );
}

export function IconSelect(props: IIconSelectProps) {
    const {iconOptions, value, ...rest} = props;
    // handle old value, 兼容老数据, "0" 代表默认第一个值
    const precessedValue = (value || []).length === 1 ? [value![0], '0'] : value;
    const cascaderOptions = (iconOptions || DEFAULT_ICON_OPTIONS(props.theme || 0)).map((option) => (
        {
            label: getTranslation(props.locale, _capitalize(option.category)),
            value: option.category,
            children: option.icons.map((icon) => ({
                label: <IconImage size={30} image={icon.image} value={icon.value}/>,
                value: icon.value,
                image: icon.image,
            })),
        }
    ));

    const displayRender = useCallback((value: string[], selectedOptions: CascaderOptionType[]) => {
        // selectedOptions 第一个值为category第二个值为选中的icon
        return !!value.length ? (
            <span key={'display-value'}>
                <IconImage image={selectedOptions[1].image} value={selectedOptions[1].value || ''}/>
                <span className='display-category'>{selectedOptions[0].label}</span>
            </span>
        ) : '';
    }, []);

    return (
        <Cascader
            value={precessedValue}
            className={'icon-select-wrapper'}
            displayRender={displayRender}
            popupClassName={'icon-select-pop-wrapper'}
            placeholder={'left'}
            options={cascaderOptions}
            {...rest}
        />
    );
}
