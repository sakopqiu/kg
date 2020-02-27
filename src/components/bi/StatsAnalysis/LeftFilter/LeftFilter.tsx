import * as React from 'react';
import './index.scss';
import {ISophonTab, SophonTabs} from '../../../SophonTab';
import {StatsAnalysisStore} from '../StatsAnalysisStore';
import {StatsAnalysisDataset} from '../StatsAnalysisInterface';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import {observer} from 'mobx-react-lite';
import {getTranslation, Locales, sortArr} from '../../../../utils';
import {SophonSearch} from '../../../SophonSearch';
import Checkbox from 'antd/es/checkbox';
import 'antd/es/checkbox/style';
import Button from 'antd/es/button';
import Divider from 'antd/es/divider';
import 'antd/es/button';
import {WorkflowIcon} from '../../../../icons/WorkflowIcon';
import {StatsAnalysisContext} from '../interface';

const Option = Select.Option;

export interface LeftFilterProps {
    store: StatsAnalysisStore;
    locale: Locales;
}

function LeftFilterFunc(props: LeftFilterProps) {
    const store = props.store;
    const datasetMap = React.useMemo(() => {
        // key为type，value是属于该type的所有数据集
        const datasetMap: Map<string, StatsAnalysisDataset[]> = new Map<string, StatsAnalysisDataset[]>();
        const store = props.store;
        store.datasets.forEach(d => {
            const type = d.type;
            let arr = datasetMap.get(type);
            if (!arr) {
                arr = [];
                datasetMap.set(type, arr);
            }
            arr.push(d);
        });
        return datasetMap;
    }, [props.store.datasets]);

    // 默认分类排在第一个
    const sortedDatasetKeys = sortArr(Array.from(datasetMap.keys()), (key1: string) => {
        if (key1 === store.defaultDatasetType) {
            return -1;
        }
        return 1;
    });
    const tabs: ISophonTab[] = sortedDatasetKeys.map(type => {
        const datasets = datasetMap.get(type)!;
        return {
            key: type,
            label: type,
            content: (
                <>
                    <ChooseDataset store={store} datasets={datasets}/>
                    <Divider/>
                    <Classification store={store} locale={props.locale}/>
                    <Divider/>
                    <StatsFields store={store} locale={props.locale}/>
                    <Divider/>
                    <Buttons store={store} locale={props.locale}/>
                </>
            ),
        };
    });

    return (
        <div className='stats-analysis-left-filter'>
            <div className='type-selection'>
                <SophonTabs tabs={tabs} onTabClick={
                    (oldKey, newKey: string) => {
                        store.setDatasetType(newKey);
                    }
                } activeKey={store.datasetType}/>

            </div>
        </div>
    );
}

function ChooseDatasetFunc(props: { store: StatsAnalysisStore, datasets: StatsAnalysisDataset[] }) {
    const {store, datasets} = props;
    return (
        <div className='left-select-area'>
            <Select className='left-filter-select' value={store.currentDatasetName}
                    onChange={(val: string) => {
                        store.setDatasetName(val);
                    }}>
                {datasets.map(d => (
                    <Select.Option value={d.name} key={d.name}>
                        {d.name}
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
}

function ClassificationFunc(props: {
    store: StatsAnalysisStore,
    locale: Locales,
}) {
    const {store, locale} = props;
    const columns = store.currentDataset.columnDefinitions;

    const attributesForSelect1 = columns.filter(c => {
        if (c.skipAnalysis) {
            return false;
        }
        return c.name !== store.currentSecondaryField;
    });

    const attributesForSelect2 = columns.filter(c => {
        if (c.skipAnalysis) {
            return false;
        }
        return c.name !== store.currentPrimaryField;
    });

    const selectStyle = {width: '85%', marginBottom: 10};

    return (
        <div className='classification-wrapper'>
            <div className='caption-title'>
                Group By
            </div>

            <WorkflowIcon className='switch-group-by' onClick={() => {
                store.switchGroupByFields();
            }}/>

            <Select style={selectStyle} value={store.currentPrimaryField} showSearch
                    onChange={(val: string) => {
                        store.setPrimaryField(val);
                    }}
            >
                <Option key='none' value=''>{getTranslation(locale, 'None')}</Option>
                {attributesForSelect1.map(col => (
                    <Option key={col.name} value={col.name}>{col.name}</Option>
                ))}
            </Select>
            <Select style={selectStyle} value={store.currentSecondaryField} showSearch
                    onChange={(val: string) => {
                        store.setSecondaryField(val);
                    }}
            >
                <Option key='none' value=''>{getTranslation(locale, 'None')}</Option>
                {attributesForSelect2.map(col => (
                    <Option key={col.name} value={col.name}>{col.name}</Option>
                ))}
            </Select>
        </div>
    );
}

// 列出当前被选中的数据表的所有需要被统计的字段
function StatsFieldsFunc(props: {
    store: StatsAnalysisStore,
    locale: Locales,
}) {
    const {store, locale} = props;
    const currDataset = store.currentDataset;
    const columns = store.currentAvailableFields;
    const {fieldsAlias} = React.useContext(StatsAnalysisContext);

    return (
        <div className='stats-field-wrapper'>
            <div className='caption-title'>
                {getTranslation(locale, 'Stats Fields')}
            </div>
            <SophonSearch
                placeholder={getTranslation(locale, 'Search', {title: ''})}
                className='stats-fields-search' onChange={(val: string) => {
                store.setFieldSearchString(val);
            }}/>
            <div className='stats-field-checkboxes'>
                <Checkbox className='stats-field-all'
                          onChange={() => {
                              if (!store.isCheckboxAll) {
                                  store.checkAll();
                              } else {
                                  store.uncheckAll();
                              }
                          }}
                          checked={store.isCheckboxAll}
                          indeterminate={store.isCheckboxIndeterminate}>
                    <span className='stats-field-name'>{getTranslation(locale, 'All')}</span>
                </Checkbox>
                <div className='stats-field-group'>
                    {columns.map(c => (
                        <Checkbox style={{whiteSpace: 'nowrap'}} key={currDataset.name + ':' + c.name} value={c.name}
                                  onChange={(e) => {
                                      if (e.target.checked) {
                                          store.addSelectedAttribute(c.name);
                                      } else {
                                          store.deleteSelectedAttribute(c.name);
                                      }
                                  }} checked={store.currentSelectedDatasetAttributes.has(c.name)}>
                            <span className='stats-field-name'>{fieldsAlias(c.name)}</span>
                            <span className='stats-field-type'>{c.type}</span>
                        </Checkbox>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ButtonsFunc(props: { store: StatsAnalysisStore, locale: Locales }) {
    const {locale, store} = props;
    return (
        <div className='stats-analysis-left-filter-buttons'>
            <Button style={{marginRight: 10}} onClick={() => {
                store.resetStore();
            }}>
                {getTranslation(locale, 'Reset')}
            </Button>
            <Button
                loading={store.isBeingComputed}
                type='primary' disabled={store.effectiveSelectedAttributes.length === 0}
                onClick={() => {
                    store.analyze();
                }}
            >
                {getTranslation(locale, 'Go Analyzing')}
            </Button>
        </div>
    );
}

const ChooseDataset = observer(ChooseDatasetFunc);
const StatsFields = observer(StatsFieldsFunc);
const Classification = observer(ClassificationFunc);
const Buttons = observer(ButtonsFunc);
export const LeftFilter = observer(LeftFilterFunc);
