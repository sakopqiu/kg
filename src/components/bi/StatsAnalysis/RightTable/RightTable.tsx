import * as React from 'react';
import {
    getTranslation,
    isNumberType,
    Locales,
    try2ConvertToNumber,
} from '../../../../utils';
import {ComputedDataset, StatsAnalysisStore} from '../StatsAnalysisStore';
import Table from 'antd/es/table';
import 'antd/es/table/style';
import {observer} from 'mobx-react-lite';
import {Observer} from 'mobx-react';
import './index.scss';
import {EDimensionInterface} from '../StatsAnalysisInterface';
import {SophonEchart} from '../../SophonEchart/SophonEchart';
import {DimensionInterface} from '../../bi-interface';
import {DatasetAggregation} from '../../DatasetAggregation';
import {AggregateType, doStatsCalculation, fieldIndex, fieldType, StatsType} from '../../../../BiUtils';
import 'antd/es/select/style';
import {StatsTypeSelector} from '../../StatsTypeSelector/StatsTypeSelector';
import {runInAction} from 'mobx';
import EllipsisText from '../../../EllipsisText';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/brush';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/legendScroll';
import {StatsAnalysisContext} from '../interface';

export interface RightTableProps {
    locale: Locales;
    store: StatsAnalysisStore;
}

function nonEmptyStr(val: any) {
    if (val === 0 || val === false) {
        return '' + val;
    }

    if (!val) {
        const innerValue = val === '' ? '\'\'' : val === null ? 'null' : 'undefined';
        return `N/A(${innerValue})`;
    } else {
        return val;
    }
}

function betterName(val: any) {
    if (!val) {
        return nonEmptyStr(val);
    }
    if (typeof val !== 'string') {
        return val;
    }
    const equalsIndex = val.lastIndexOf('=');
    if (equalsIndex !== -1) {
        return val.substr(equalsIndex + 1);
    }
    return nonEmptyStr(val);
}

function RightTableFunc(props: RightTableProps) {
    const {store, locale} = props;
    const dataset = store.computedDataset;

    /**
     * 对于计数类型，可以想象把一张正常的数据表转换成一张计数统计表
     * id name age
     * 1  gaga 31
     * 2  leah 30
     * 3  mike 30
     *
     * 被转换成
     *
     * 年龄 数量
     * 30  2
     * 31  1
     *
     * @type {any}
     */

    function getFieldDef(fieldName: string) {
        const colIndex = fieldIndex(dataset!, fieldName);
        return dataset!.dimensions[colIndex] as EDimensionInterface;
    }

    function datasetForField(field: string) {
        if (!dataset) {
            throw new Error('should not happen');
        }
        // 对每个值进行count统计
        const fieldDef = getFieldDef(field);
        const colName = fieldDef.name;
        if (!!dataset.primaryField && !dataset.secondaryField) {
            const targetFieldType = fieldType(dataset, colName);
            const statsType = dataset.fieldsToBeAnalyzedMap.get(colName)!;
            if (isNumberType(targetFieldType) && statsType !== 'COUNT') {
                return new DatasetAggregation(dataset).aggregate1(dataset.primaryField, colName, dataset.fieldsToBeAnalyzedMap.get(colName)!);
            } else {
                return new DatasetAggregation(dataset).aggregate11(dataset.primaryField, colName);
            }

        } else if (!!dataset.primaryField && !!dataset.secondaryField) {
            return new DatasetAggregation(dataset).aggregate2(dataset.primaryField, dataset.secondaryField, colName, dataset.fieldsToBeAnalyzedMap.get(colName)!);
        } else if (!dataset.primaryField && !dataset.secondaryField) {
            return new DatasetAggregation(dataset).count(colName);
        }
        throw new Error('should not happen');
    }

    const columns = [
        {
            title: getTranslation(locale, 'Fields & Indicators'),
            dataIndex: 'fieldName',
            key: '1',
            width: 165,
            render: (fieldName: string) => {
                return (
                    <Observer>
                        {() => {
                            const fieldDef = getFieldDef(fieldName);

                            const canChangeStatsType = (dataset!.primaryField || dataset!.secondaryField)
                                && isNumberType(fieldDef.origType);

                            return <FieldName colDef={getFieldDef(fieldName)}
                                              locale={locale}
                                              onChange={canChangeStatsType ?
                                                  (val: StatsType) => {
                                                      runInAction(() => {
                                                          dataset!.fieldsToBeAnalyzedMap.set(fieldName, val);
                                                      });
                                                  }
                                                  : undefined}
                                              indicator={dataset!.fieldsToBeAnalyzedMap.get(fieldName)!}
                            />;
                        }}
                    </Observer>
                );
            },
        },
        {
            title: getTranslation(locale, 'Data Distribution'),
            dataIndex: 'fieldName',
            key: '2',
            render: (fieldName: string) => {
                return <Observer>
                    {() => {
                        try {
                            const statsType = dataset!.fieldsToBeAnalyzedMap.get(fieldName)!;
                            const fieldDef = getFieldDef(fieldName);
                            const colName = fieldDef.name;
                            // 为每一个列的echart图标显示用的dataset
                            const ds = datasetForField(fieldName);
                            const series = ds.dimensions.slice(1).map((dim: DimensionInterface) => {
                                return {
                                    type: 'bar',
                                    name: dim.name, // hint中使用
                                    encode: {
                                        x: (ds.dimensions[0] as DimensionInterface).name, // x轴对应第一列
                                        y: dim.name,
                                        tooltip: [dim.name],
                                    },
                                };
                            });

                            // x轴的长度大于100后开始显示滚动条
                            const IdealXAxisCount = 100;
                            const xAxisElementCount = ds.source.length * series!.length;
                            const datazoomConfig = xAxisElementCount > IdealXAxisCount ? {
                                dataZoom: [
                                    {   // 这个dataZoom组件，默认控制x轴。
                                        type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                                        start: 0,      // 左边在 10% 的位置。
                                        end: IdealXAxisCount / xAxisElementCount * 100,
                                    },
                                ],
                            } : null;

                            const echartOptions = {
                                ...datazoomConfig,
                                tooltip: {
                                    trigger: 'item' as any,
                                },
                                legend: {
                                    top: 2,
                                    left: 120,
                                    right: 200,
                                    type: 'scroll',
                                    formatter: (name: string) => {
                                        return betterName(name);
                                    },
                                },
                                grid: {
                                    left: 35,
                                    top: 35,
                                    right: 35,
                                    bottom: !!datazoomConfig ? 40 : 10,
                                    containLabel: true,
                                },
                                dataset: ds,
                                toolbox: {
                                    show: true,
                                    right: 35,
                                    feature: {
                                        dataZoom: {
                                            yAxisIndex: 'none',
                                        },
                                        magicType: {type: ['line', 'bar']},
                                        restore: {},
                                        saveAsImage: {},
                                    },
                                },
                                xAxis: {
                                    type: 'category' as any,
                                    name: '', // 坐标轴的名字，为了节省空间，暂时不显示
                                    axisLabel: {
                                        // 有些列名为纯数字，但是echart遇到纯数字的列名会有奇怪的行为，所以有些列名采用了a=**的形式
                                        formatter: (val: string, index: number) => {
                                            return betterName(val);
                                        },
                                    },
                                },
                                yAxis: {
                                    name: `${statsType}(${colName})`,
                                },
                                series,

                            };

                            return <SophonEchart
                                echartOptions={echartOptions}
                                width='100%'
                                height={200}
                                id={`echart:${dataset!.name},${fieldDef.name}`}/>;
                        } finally {
                            store.completeCount++; // 无论渲染成功失败都要++
                            store.checkOrSetCompleted();
                        }
                    }}
                </Observer>;
            },
        },
        {
            title: getTranslation(locale, 'Stats Description'),
            dataIndex: 'fieldName',
            width: 180,
            key: '3',
            render: (fieldName: string) => {
                return (
                    <FieldStat locale={locale} dataset={dataset!}
                               fieldName={fieldName}/>
                );
            },
        },
    ];
    const dataSource = dataset ? Array.from(dataset.fieldsToBeAnalyzedMap.keys()).map(fieldName => ({
        fieldName,
    })) : [];

    return (
        <div id='right-table-div' style={{flex: 1, height: '100%', overflowY: 'auto'}}>
            <Table className='right-table' pagination={false} columns={columns} dataSource={dataSource}/>
        </div>
    );
}

function
FieldNameFunc(props: { colDef: EDimensionInterface, locale: Locales, indicator: StatsType, onChange?: (val: AggregateType) => any }) {
    const {fieldsAlias} = React.useContext(StatsAnalysisContext);
    return (
        <div className='field-name-area'>
            <div className='field-name'>
                {getTranslation(props.locale, 'Field')}:&nbsp;{fieldsAlias(props.colDef.name, props.locale)}
            </div>
            <div className='field-type'>
                {getTranslation(props.locale, 'Indicator')}:&nbsp;
                {props.onChange ?
                    <StatsTypeSelector
                        excludeMode
                        includeCount
                        className='right-table-stats-type-selector'
                        locale={props.locale}
                        value={props.indicator}
                        onChange={props.onChange}
                    />
                    : props.indicator
                }
            </div>
            <div className='field-type'>
                {props.colDef.origType}
            </div>
        </div>
    );
}

function FieldStatsFunc(props: { dataset: ComputedDataset, fieldName: string, locale: Locales }) {
    const {dataset, fieldName, locale} = props;
    const fType = fieldType(dataset, fieldName);
    const isNumber = isNumberType(fType);
    const fIndex = fieldIndex(dataset, fieldName);

    if (isNumber) {
        let invalidValueCount = 0;
        const arr: number[] = [];
        const rowCount = dataset.source.length;
        for (const row of dataset.source) {
            const v = try2ConvertToNumber(row[fIndex]);
            if (v !== 0 && (!v || isNaN(v))) {
                invalidValueCount++;
            } else {
                arr.push(v);
            }
        }

        return (
            <div className='right-table-field-stats'>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Valid Count')}</span>
                    <span>{rowCount - invalidValueCount}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Invalid Count')}</span>
                    <span>{invalidValueCount}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Sum')}</span>
                    <span>{doStatsCalculation(arr, 'SUM')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Mode')}</span>
                    <span><EllipsisText length={20} text={(doStatsCalculation(arr, 'MODE') || '').toString()}/></span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Mean')}</span>
                    <span>{doStatsCalculation(arr, 'MEAN')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Min')}</span>
                    <span>{doStatsCalculation(arr, 'MIN')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Max')}</span>
                    <span>{doStatsCalculation(arr, 'MAX')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Stdev')}</span>
                    <span>{doStatsCalculation(arr, 'STDEV')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Quartiles')}</span>
                    <span>{doStatsCalculation(arr, 'QUARTILES')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Quantiles')}</span>
                    <span>{doStatsCalculation(arr, 'QUANTILES')}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, '75 Percentiles')}</span>
                    <span>{doStatsCalculation(arr, '75')}</span>
                </div>
            </div>
        );
    } else {
        let invalidValueCount = 0;
        const s = new Set<any>();
        for (const row of dataset.source) {
            const v = row[fIndex];
            if (!v && v !== '') {
                invalidValueCount++;
            } else {
                s.add(v);
            }
        }
        return (
            <div className='right-table-field-stats'>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Valid Count')}</span>
                    <span>{s.size}</span>
                </div>
                <div className='field-stat-item'>
                    <span>{getTranslation(locale, 'Invalid Count')}</span>
                    <span>{invalidValueCount}</span>
                </div>
            </div>
        );
    }
}

const FieldName = observer(FieldNameFunc);
const FieldStat = observer(FieldStatsFunc);
export const RightTable = observer(RightTableFunc);
