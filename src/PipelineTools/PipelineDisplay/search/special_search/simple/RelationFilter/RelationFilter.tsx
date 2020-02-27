import * as React from 'react';
import {getTranslation, IPoint, isTimeRelatedType, Locales} from '../../../../../../utils';
import {SophonSelect} from '../../../../../../components/SophonSelect/index';
import {
    AttributeConditionConstant,
    DisplayModePipelineSchema, FromToPair,
    SelectedTimeAttribute, SimpleTimeFormat,
    TimeFormat,
} from '../../../../interfaces';
import './index.scss';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import * as moment from 'moment';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import _some from 'lodash/some';
import {EdgeFilterConditions} from '../../../../model/CyState';
import {TimeRangeTable} from '../../../../../../components/TimeRangeTable/TimeRangeTable';
import {useOnChangeHandler} from '../../../../../../components/SophonHooks/hookUtils';
import {SophonMoreToolsHookWrapper} from '../../../../../../components/SophonMoreTools/SophonMoreToolsHook';
import _remove from 'lodash/remove';
import {replaceInArray} from '../../../../../../business-related/utils';
import classNames from 'classnames';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

export interface RelationFilterProps {
    locale: Locales;
    schema: DisplayModePipelineSchema;
    style?: React.CSSProperties;
    edgeFilterConditions: EdgeFilterConditions;
    onSelectedAttributesChanged: (attributes: EdgeFilterConditions) => void;
}

function formattedAttrType1(relationName: string, condition: string) {
    return `${relationName} - ${condition}`;
}

function optimizedTimeFormat(t: moment.Moment | null) {
    if (!t) {
        return '';
    }
    if (t.minute() === 0 && t.hour() === 0 && t.second() === 0) {
        return t.format(SimpleTimeFormat);
    }
    return t.format(TimeFormat);
}

function formattedAttrType2(relationName: string, from: moment.Moment | null, to: moment.Moment | null) {
    return `${relationName} - ${optimizedTimeFormat(from)} ~ ${optimizedTimeFormat(to)}`;
}

function completeAttributeDescription(locale: Locales, attr: SelectedTimeAttribute) {
    let descriptionText = attr.relation + ' - ';
    descriptionText += typeof attr.condition === 'string' ?
        formattedAttrType1(attr.attribute, getConditionTitleByValue(locale, attr.condition))
        : formattedAttrType2(attr.attribute, attr.condition.from, attr.condition.to);
    return descriptionText;
}

function getConditionTitleByValue(locale: Locales, value: AttributeConditionConstant) {
    switch (value) {
        case 'all':
            return getTranslation(locale, 'All');
        case '1w':
            return getTranslation(locale, 'Last 1 Week');
        case '1M':
            return getTranslation(locale, 'Last N Month', {count: 1});
        case '3M':
            return getTranslation(locale, 'Last N Month', {count: 3});
        case '6M':
            return getTranslation(locale, 'Last N Month', {count: 6});
        case '1y':
            return getTranslation(locale, 'Last 1 Year');
        default:
            throw new Error('Unknown condition');
    }
}

export function RelationFilter(props: RelationFilterProps) {
    const locale = props.locale;
    const [relationType, setRelationType] = useOnChangeHandler('');
    const [timeAttribute, setTimeAttribute] = useOnChangeHandler('');
    // 自定义事件时，暂时记录当前的时间是对着哪个属性做的
    const [tempTimeAttribute, setTempTimeAttribute] = useOnChangeHandler('');
    const [showTimeRangeTable, setShowTimeRangeTable] = useOnChangeHandler(false);

    const [edgeFilterConditions, setEdgeFilterConditions] = React.useState(props.edgeFilterConditions);
    const updateEdgeFilterConditions = React.useCallback((newConditions) => {
        setEdgeFilterConditions(newConditions);
        props.onSelectedAttributesChanged(newConditions);
    }, []);

    // propsWillChange

    const edgeSchemas = props.schema.edges;

    // 如果一条边上没有任何时间属性，会被过滤
    const edgeSchemaOptions = React.useMemo(() => {
        return edgeSchemas
            .filter((es) => {
                return _some(es.fields, (f) => isTimeRelatedType(f.fieldType));
            })
            .map((es) => {
                return {
                    value: es.labelName,
                    title: es.labelName,
                };
            });
    }, [edgeSchemas]);

    const timeAttributeOptions = React.useMemo(() => {
        if (relationType === '') {
            return [];
        }
        const edgeSchema = edgeSchemas.find((s) => s.labelName === relationType)!;
        // 只选取时间属性，并且该属性还没有被选择过
        const timeAttributes = edgeSchema.fields.filter((f) =>
            isTimeRelatedType(f.fieldType));

        return timeAttributes.map((ta) => {
            return {
                value: ta.fieldName,
                title: ta.fieldName,
                render: () => {
                    return (
                        <SubMenu title={ta.fieldName} key={ta.fieldName}>
                            {timeRangeOptions}
                        </SubMenu>
                    );
                },
            };
        });
    }, [edgeSchemas, relationType, edgeFilterConditions.timeAttributes]);

    const timeRange = React.useMemo(() => {
        return [
            {
                title: getConditionTitleByValue(locale, 'all'),
                value: 'all',
            },
            {
                title: getConditionTitleByValue(locale, '1w'),
                value: '1w',
            },
            {
                title: getConditionTitleByValue(locale, '1M'),
                value: '1M',
            },
            {
                title: getConditionTitleByValue(locale, '3M'),
                value: '3M',
            },
            {
                title: getConditionTitleByValue(locale, '6M'),
                value: '6M',
            },
            {
                title: getConditionTitleByValue(locale, '1y'),
                value: '1y',
            },
            {
                title: getTranslation(locale, 'Customized Range'),
                value: 'customize',
            },
        ];
    }, [locale]);

    const timeRangeOptions = React.useMemo(() => {
        return timeRange.map((r) => {
            return (
                <MenuItem key={r.value} title={r.title}>
                    {r.title}
                </MenuItem>
            );
        });

    }, [timeRange]);

    const isFirstTime = React.useRef(true);
    React.useEffect(() => {
        if (isFirstTime.current) {
            isFirstTime.current = false;
            return;
        }
        setEdgeFilterConditions(props.edgeFilterConditions);
    }, [props.edgeFilterConditions.version]);

    // 对于同一个关系的同一个属性，如果条件是string类型的（如前一个月，前一年），只能存在一个，如果是手动输入的时间范围
    // 那么可以存在多个
    // const addOrReplaceItem = React.useCallback((newItem: SelectedTimeAttribute) => {
    //
    //     const filterFunc = (c: SelectedTimeAttribute) => c.relation === newItem.relation && c.attribute === newItem.attribute;
    //
    //     const result = new EdgeFilterConditions();
    //     result.version = edgeFilterConditions.version + 1;
    //
    //     const peers: SelectedTimeAttribute[] = edgeFilterConditions.timeAttributes.filter(filterFunc);
    //     // 如果新元素的条件是string类型的，那么不管老属性是什么都删除
    //     if (typeof newItem.condition === "string") {
    //         _remove(edgeFilterConditions.timeAttributes, filterFunc);
    //         // 追加新元素
    //         result.timeAttributes = [...edgeFilterConditions.timeAttributes, newItem];
    //     }
    //     // 如果同类数量大于1个，说明同类肯定都是手动输入时间的选项
    //     // 如果不存在同类，那么直接加入就好了
    //     else if (peers.length !== 1) {
    //         result.timeAttributes = [...edgeFilterConditions.timeAttributes, newItem];
    //     } else {//只存在一个的情况
    //         const onlyPeer = peers[0];
    //         // 对于string类型，直接进行替换
    //         if (typeof onlyPeer.condition === "string") {
    //             const peerIndex = edgeFilterConditions.timeAttributes.findIndex(filterFunc);
    //             result.timeAttributes = replaceInArray(edgeFilterConditions.timeAttributes, peerIndex, newItem, false);
    //         } else {
    //             //手动输入类型，直接加入
    //             result.timeAttributes = [...edgeFilterConditions.timeAttributes, newItem];
    //         }
    //     }
    //
    //     updateEdgeFilterConditions(result);
    // }, [edgeFilterConditions]);

    const addOrReplaceItem = React.useCallback((newItem: SelectedTimeAttribute) => {
        const filterFunc = (c: SelectedTimeAttribute) => c.relation === newItem.relation && c.attribute === newItem.attribute;
        const result = new EdgeFilterConditions();
        result.version = edgeFilterConditions.version + 1;

        const peerIndex = edgeFilterConditions.timeAttributes.findIndex(filterFunc);
        if (peerIndex === -1) {
            result.timeAttributes = [...edgeFilterConditions.timeAttributes, newItem];
        } else {
            result.timeAttributes = replaceInArray(edgeFilterConditions.timeAttributes, peerIndex, newItem, false);
        }
        updateEdgeFilterConditions(result);
    }, [edgeFilterConditions]);

    function setTimePair(from: moment.Moment | null, to: moment.Moment | null) {
        setTimeAttribute(formattedAttrType2(tempTimeAttribute, from, to));
        addOrReplaceItem({
            relation: relationType,
            attribute: tempTimeAttribute,
            condition: {
                from,
                to,
            },
        });
    }

    const [showTempTimeRangeTable, setShowTempTimeRangeTable] = React.useState(false);
    const [tempFromTo, setTempFromTo] = React.useState<FromToPair>({from: null, to: null});
    const [tempFromToPos, setTempFromToPos] = React.useState<IPoint>({x: 0, y: 0});

    return (
        <div className='relation-filter' style={props.style || {}}>
            <div className='left-part'>
                <span className='filter-title'>
                    {getTranslation(locale, 'Relation Filter')}
                </span>
                <SophonSelect
                    className='select-relation'
                    noMatchMsg={getTranslation(locale, 'Select Relation')}
                    value={relationType} options={edgeSchemaOptions}
                    onChange={(type) => {
                        setRelationType(type);
                        if (relationType !== type) {
                            setTimeAttribute('');
                        }
                    }}
                />
                <SophonSelect
                    className='select-attribute'
                    onChange={(value: string, rawData: any, keyPath: string[]) => {
                        const config = timeRange.find((config) => config.value === keyPath[0])!;
                        if (value !== 'customize') {
                            const title = config.title;
                            setTimeAttribute(formattedAttrType1(keyPath[1], title));
                            addOrReplaceItem({
                                relation: relationType,
                                attribute: keyPath[1],
                                condition: value as any,
                            });
                        } else {
                            setTempTimeAttribute(keyPath[1]);
                            setShowTimeRangeTable(true);
                        }
                    }}
                    noMatchMsg={getTranslation(locale, 'Select Time Attributes')}
                    value={timeAttribute}
                    forceValue={timeAttribute}
                    options={timeAttributeOptions}
                />
                {showTimeRangeTable && <TimeRangeTable
                    className='relation-time-range-table'
                    onClose={() => {
                        setShowTimeRangeTable(false);
                    }}
                    onConfirm={setTimePair}
                    locale={locale}/>}
            </div>

            {edgeFilterConditions.timeAttributes.length > 0 && <Divider type='vertical'/>}

            <div className='right-part'>
                {showTempTimeRangeTable && <TimeRangeTable
                    style={{position: 'fixed', left: tempFromToPos.x, top: tempFromToPos.y}}
                    defaultFrom={tempFromTo.from}
                    defaultTo={tempFromTo.to}
                    onClose={() => {
                        setShowTempTimeRangeTable(false);
                    }}
                    onConfirm={(from: moment.Moment | null, to: moment.Moment | null) => {
                        setTimePair(from, to);
                        setShowTempTimeRangeTable(false);
                    }}
                    locale={props.locale}/>}
                <SophonMoreToolsHookWrapper
                    awareWindowResize
                    moreBtnWidth={30}
                    moreBtntrigger={'click'}
                    moreBtnStyle={{
                        width: 30,
                        height: 30,
                        backgroundColor: '#E4EAF2',
                        color: '#BBC1CB',
                        justifyContent: 'center',
                        borderRadius: 2,
                    }}
                    moreBtnMenuClassName='current-selection-list-more-btn-menu'
                    className='current-selection-list'>
                    {edgeFilterConditions.timeAttributes.map((attr, index) => {
                        return <TimeAttribute
                            onDelete={() => {
                                const result = new EdgeFilterConditions();
                                result.version = edgeFilterConditions.version + 1;
                                result.timeAttributes = [...edgeFilterConditions.timeAttributes.slice(0, index),
                                    ...edgeFilterConditions.timeAttributes.slice(index + 1)];
                                updateEdgeFilterConditions(result);
                                setShowTempTimeRangeTable(false); // 万一在编辑时间时被删除
                            }}
                            onClick={(from: moment.Moment | null, to: moment.Moment, elePosition: IPoint) => {
                                setShowTempTimeRangeTable(true);
                                setTempFromTo({from, to});
                                setTempFromToPos({x: elePosition.x, y: elePosition.y + 30});
                            }}
                            locale={locale}
                            timeAttribute={attr}
                            key={index}/>;
                    })}
                </SophonMoreToolsHookWrapper>

                {
                    edgeFilterConditions.timeAttributes.length > 0 && <a onClick={() => {
                        const result = new EdgeFilterConditions();
                        result.version = edgeFilterConditions.version + 1;
                        result.timeAttributes = [];
                        updateEdgeFilterConditions(result);
                    }} className='clear-list'>{getTranslation(locale, 'Clear')}</a>
                }
            </div>
        </div>
    );
}

interface TimeAttributeProps {
    timeAttribute: SelectedTimeAttribute;
    locale: Locales;
    onDelete: () => void;
    onClick: (from: moment.Moment | null, to: moment.Moment | null, elePosition: IPoint) => void;
}

function TimeAttribute(props: TimeAttributeProps) {

    const spanRef = React.useRef<HTMLSpanElement | null>(null);

    // 为true时，是时间范围
    const onClick = typeof props.timeAttribute.condition !== 'string'
        ? (e: any) => {
            const refElementPosition = spanRef.current!.getBoundingClientRect();
            const pair = props.timeAttribute.condition as FromToPair;
            props.onClick(pair.from, pair.to, {x: refElementPosition.left, y: refElementPosition.top});
        } : null;

    const obj = onClick ? {onClick} : {};

    return (
        <span {...obj} ref={spanRef}
              className={classNames('current-selection-entry', {'sophon-interaction': !!onClick})}>
            {completeAttributeDescription(props.locale, props.timeAttribute)}
            <span className='delete-entry' onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                props.onDelete();
            }}>+</span>
        </span>
    );
}
