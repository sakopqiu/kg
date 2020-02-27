import React from 'react';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import {getTranslation, Locales} from '../../../utils';
import {StatsType} from '../../../BiUtils';

const Option = Select.Option;

interface StatsTypeSelectorProps {
    className?: string;
    locale: Locales;
    value: StatsType;
    excludeMode?: boolean;
    includeCount?: boolean;
    onChange: (value: StatsType) => void;
}

export function StatsTypeSelector(props: StatsTypeSelectorProps) {
    const locale = props.locale;
    return (
        <Select
            dropdownClassName='stats-selector-dropdown'
            value={props.value} className={props.className || ''} onChange={props.onChange} size='small'>
            {props.includeCount &&
            <Option value={'COUNT'} title={getTranslation(locale, 'Count')}>
                {getTranslation(locale, 'Count')}
            </Option>
            }
            <Option value={'SUM'} title={getTranslation(locale, 'Sum')}>
                {getTranslation(locale, 'Sum')}
            </Option>
            <Option value={'MEAN'} title={getTranslation(locale, 'Mean')}>
                {getTranslation(locale, 'Mean')}
            </Option>
            <Option value={'MAX'} title={getTranslation(locale, 'Max')}>
                {getTranslation(locale, 'Max')}
            </Option>
            <Option value={'MIN'} title={getTranslation(locale, 'Min')}>
                {getTranslation(locale, 'Min')}
            </Option>
            <Option value={'STDEV'} title={getTranslation(locale, 'Stdev')}>
                {getTranslation(locale, 'Stdev')}
            </Option>
            <Option value={'MEDIAN'} title={getTranslation(locale, 'Median')}>
                {getTranslation(locale, 'Median')}
            </Option>
            <Option value={'QUARTILES'} title={getTranslation(locale, 'Quartiles')}>
                {getTranslation(locale, 'Quartiles')}
            </Option>
            <Option value={'QUANTILES'} title={getTranslation(locale, 'Quantiles')}>
                {getTranslation(locale, 'Quantiles')}
            </Option>
            <Option value={'75'} title={getTranslation(locale, '75 Percentiles')}>
                {getTranslation(locale, '75 Percentiles')}
            </Option>
            {!props.excludeMode ? <Option value={'MODE'} title={getTranslation(locale, 'Mode')}>
                {getTranslation(locale, 'Mode')}
            </Option> : null}
        </Select>
    );
}
