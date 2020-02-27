import React, {useMemo} from 'react';
import './EdgesGroupByModal.scss';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import 'antd/es/row/style';
import 'antd/es/col/style';
import Table from 'antd/es/table';
import 'antd/es/table/style';
import _toPair from 'lodash/toPairs';
import {toJS} from 'mobx';
import {CyEdge} from '../../../../../model/CyEdge';
import {
    formatNumber,
    getTranslation,
    Locales,
    SophonDefaultSorter,
    try2ConvertToNumber,
} from '../../../../../../../utils';
import {useOnChangeHandler} from '../../../../../../../components/SophonHooks/hookUtils';
import {groupBy, GroupPair} from '../../../../../../../Collection/GroupBy';
import {SophonModal} from '../../../../../../../components/SophonModal';
import {doStatsCalculation, AggregateType} from '../../../../../../../BiUtils';
import {StatsTypeSelector} from '../../../../../../../components/bi/StatsTypeSelector/StatsTypeSelector';

interface IEdgesGroupByModalProps {
    numericFields: string[];
    stringFields: string[];
    edges: CyEdge[];
    show: boolean;
    locale: Locales;
    onClose: () => void;
}

const Option = Select.Option;

export function EdgesGroupByModal(props: IEdgesGroupByModalProps) {
    const [indicator, setIndicator] = useOnChangeHandler<AggregateType>('SUM');
    const [field, setField] = useOnChangeHandler<string>('');
    const [groupField1, setGroupField1] = useOnChangeHandler<string>('');
    const [groupField2, setGroupField2] = useOnChangeHandler<string>('');

    // 左侧按名字排序
    // const [keyOrder, setKeyOrder] = React.useState<SortOrder>(SortOrder.ascend);
    // 右侧按值排序
    // const [valueOrder, setValueOrder] = React.useState<SortOrder>(SortOrder.ascend);

    const columns = useMemo(() => {
        return [{
            title: getTranslation(props.locale, 'Group By'),
            key: 'groupBy',
            dataIndex: 'groupBy',
            width: '50%',
            sortDirections: ['descend', 'ascend'] as any,
            sorter: (ele1: { key: string }, ele2: { key: string }) => {
                return SophonDefaultSorter(ele1.key, ele2.key);
            },
            render: (value: string) => {
                return <span title={value}>{value}</span>;
            },
        },
            {
                title: `${field} (${getTranslation(props.locale, StatsTypeTranslation(props.locale)[indicator])})`,
                key: 'fieldIndicator',
                dataIndex: 'fieldIndicator',
                width: '50%',
                sorter: (ele1: any, ele2: any) => {
                    return SophonDefaultSorter(ele1.fieldIndicator, ele2.fieldIndicator);
                },
                sortDirections: ['descend', 'ascend'],
                render: (value: string) => {
                    return <span title={value}>{formatNumber(value)}</span>;
                },
            },
        ];
    }, [field, indicator]);

    const rawData = useMemo(() => {
        return field ? props.edges.map((e) => toJS(e.data.params)) : [];
    }, [field, props.edges]);

    const groupData = useMemo(() => {
        return groupBy(rawData, [groupField1, groupField2]);
    }, [rawData, groupField1, groupField2]);

    const data = useMemo(() => {
        return _toPair(groupData)
            .filter((pair: GroupPair) => !!pair[1].length && pair[0].indexOf('undefined') === -1 && pair[0]).map((pair: GroupPair) => ({
                key: pair[0],
                groupBy: pair[0],
                fieldIndicator: doStatsCalculation(pair[1].map((d) => try2ConvertToNumber(d[field])), indicator),
            })).filter(val => !!val.fieldIndicator);
    }, [groupData, indicator]);

    return (
        <SophonModal
            className='advanced-statistics-modal'
            topPadding={127}
            bottomPadding={127}
            width={640}
            height={500}
            locale={props.locale}
            title={getTranslation(props.locale, 'Advanced Statistics')}
            showState={props.show}
            cancelOption={{
                onCancel: props.onClose,
                showCross: true,
            }}
            hitShadowClose
            footer={null}
        >
            <Row className={'label-header'}>
                <Col span={6}>{getTranslation(props.locale, 'Statistical Field')}:</Col>
                <Col span={6}>{getTranslation(props.locale, 'Statistical Indicator')}:</Col>
                <Col span={12}>{getTranslation(props.locale, 'Group By')}:</Col>
            </Row>
            <Row>
                <Col span={6}>
                    <Select value={field} onChange={setField} size={'small'}>
                        {props.numericFields.map((f) => (
                            <Option value={f} key={f} title={f}>{f}</Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <StatsTypeSelector className={'advanced-type-select'} locale={props.locale} value={indicator}
                                       onChange={setIndicator}/>
                </Col>
                <Col span={12} className={'group-by-area'}>
                    <Select value={groupField1} onChange={setGroupField1} size={'small'} allowClear
                            showSearch
                    >
                        {props.stringFields.filter(f => f !== groupField2).map((f) => (
                            <Option value={f} key={f} title={f}>{f}</Option>
                        ))}
                    </Select>
                    <span>{getTranslation(props.locale, 'And')}</span>
                    <Select value={groupField2} onChange={setGroupField2} size={'small'} allowClear showSearch>
                        {props.stringFields.filter(f => f !== groupField1).map((f) => (
                            <Option value={f} key={f} title={f}>{f}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>
            <Table className={'group-by-table'} columns={columns} dataSource={data} pagination={false} bordered/>
        </SophonModal>
    );
}

export const StatsTypeTranslation = (locale: Locales) => {
    return {
        SUM: getTranslation(locale, 'Sum'),
        MEAN: getTranslation(locale, 'Mean'),
        MAX: getTranslation(locale, 'Max'),
        MIN: getTranslation(locale, 'Min'),
        STDEV: getTranslation(locale, 'Stdev'),
        MEDIAN: getTranslation(locale, 'Median'),
        QUARTILES: getTranslation(locale, 'Quartiles'),
        QUANTILES: getTranslation(locale, 'Quantiles'),
        75: getTranslation(locale, '75 Percentiles'),
        MODE: getTranslation(locale, 'Mode'),
    };
};
