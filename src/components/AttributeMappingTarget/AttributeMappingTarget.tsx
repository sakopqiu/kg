import * as React from 'react';
import './index.scss';
import {getTranslation, Locales, nextEventLoop, supportedTypes} from '../../utils';
import classNames from 'classnames';
import {DropTargetMonitor, useDrop} from 'react-dnd';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import {CrossIcon} from '../../icons/CrossIcon';
import {AttributeMappingStore} from '../TypedAttributeMapping/AttributeMappingStore';
import {runInAction} from 'mobx';
import {observer} from 'mobx-react-lite';
import EllipsisText from '../EllipsisText';
import {useIsHovered} from '../SophonHooks/hookUtils';
import {Broom2Icon} from '../../icons/Broom2Icon';
import {IMappingTargetEntry} from '../TypedAttributeMapping/interface';

const tooltipPlacement = 'bottom';

export interface AttributeMappingTargetProps {
    title: React.ReactNode;
    locale: Locales;
    store: AttributeMappingStore;
    unmappedHint: string;
    style?: React.CSSProperties;
    extraBatchOption?: {
        text: string;
        onClick: () => any;
    }; // 除了批量清除映射，额外提供一个批量操作给外部，不提供多个是ui预留空间不足，暂时设置为1个
    renderTargetSlot?: (entry: IMappingTargetEntry) => React.ReactNode; // 用于渲染自定义插槽视图
}

function AttributeMappingTargetFunc(props: AttributeMappingTargetProps) {
    const store = props.store;
    const removeCustomEntry = React.useCallback((e: IMappingTargetEntry) => {
        store.remove(e);
    }, [store]);

    const clearAll = React.useCallback(() => {
        store.startFromBrandNewMappingsEntries();
    }, [store]);

    // 防止溢出
    const [entryLength, setEntryLength] = React.useState(250);
    const entryWrapperRef = React.useCallback((div: HTMLDivElement) => {
        if (div) {
            const bounding = div.getBoundingClientRect();
            setEntryLength(bounding.width); // 留两边10px padding
        }
    }, []);

    const addCustomEntry = React.useCallback(() => {
        store.addCustomEntry();
        newCustomEntryAdded.current = true;
    }, [store]);

    // 添加新的自定义entry时自动滚动到底部
    const mappingTargetRef = React.useRef<HTMLDivElement | null>(null);
    const newCustomEntryAdded = React.useRef(false);

    React.useLayoutEffect(() => {
        if (newCustomEntryAdded.current) {
            newCustomEntryAdded.current = false;
            if (mappingTargetRef.current) {
                mappingTargetRef.current.scrollTo(0, mappingTargetRef.current.scrollHeight || 0);
            }
        }
    });

    let extraBatchButton: React.ReactNode = null;
    if (props.extraBatchOption) {

        extraBatchButton = (
            <span onClick={props.extraBatchOption.onClick} className='attribute-mapping-target-title-button'>
                {props.extraBatchOption.text}
                    </span>);
    }

    return (
        <div className='attribute-mapping-target' style={props.style || {}} ref={mappingTargetRef}>
            <div className='attribute-mapping-target-title'>
                {props.title}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {extraBatchButton}
                    <span onClick={clearAll} style={{marginLeft: 8}} className='attribute-mapping-target-title-button'>
                        {getTranslation(props.locale, 'Clear All Mappings')}
                    </span>
                </div>
            </div>
            <div className='attribute-mapping-target-entries' ref={entryWrapperRef}>
                {store.targetEntryStates.map((e) => {
                    if (e.isCustom) {
                        return (
                            <CustomMappingTargetEntryComponent
                                store={props.store}
                                width={entryLength}
                                onRemove={() => {
                                    removeCustomEntry(e);
                                }}
                                key={e.name}
                                locale={props.locale}
                                entry={e} unmappedHint={props.unmappedHint}
                                renderTargetSlot={props.renderTargetSlot ? (entry) =>
                                    props.renderTargetSlot && props.renderTargetSlot(entry) : undefined}
                            />
                        );
                    } else {
                        return (
                            <MappingTargetEntryComponent
                                locale={props.locale}
                                width={entryLength}
                                entry={e} unmappedHint={props.unmappedHint}
                                key={e.name}
                                renderTargetSlot={props.renderTargetSlot ? (entry) =>
                                    props.renderTargetSlot && props.renderTargetSlot(entry) : undefined}
                            />
                        );
                    }
                })}
            </div>

            <div className='add-custom-attribute'>
                <span onClick={addCustomEntry}>{getTranslation(props.locale, 'Add Custom Attribute')}</span>
            </div>
        </div>
    );

}

interface MappingTargetEntryComponentProps {
    locale: Locales;
    entry: IMappingTargetEntry;
    unmappedHint: string;
    renderTargetSlot?: (entry: IMappingTargetEntry) => React.ReactNode; // 用于渲染自定义插槽视图
    width: number;
}

export interface DropResultType<ExtraInfo = any> {
    realType: string; // api会返回decimal(...)类型的
    type: supportedTypes | ''; // reactdnd要求所有的source产生的item必须带上type属性，这样才能和accept匹配上
    tableId: string; // 被映射上的tableId
    tableName: string; // 表名，辅助debug
    attrName: string; // 被映射上的表中的属性
    extraInfo?: ExtraInfo; // 存额外信息的
}

const textStyle: any = {textAlign: 'center'};
const headerTextStyle: any = {flex: 1};

function MappingTargetEntryComponentFunc(props: MappingTargetEntryComponentProps) {
    const entry = props.entry;

    const clearMe = React.useCallback(() => {
        runInAction(() => {
            entry.defaultTableAttr = '';
            entry.defaultTableId = '';
            entry.defaultTableName = '';
        });
    }, [entry]);

    const tableName = entry.defaultTableName;
    const unmapped = !entry.defaultTableId || !entry.defaultTableAttr;
    const dropConfig = React.useMemo(() => {
        return {
            accept: [props.entry.type, 'anyType'],
            drop: (item: DropResultType, monitor: DropTargetMonitor) => {
                if (item) {
                    runInAction(() => {
                        entry.defaultTableId = item.tableId;
                        entry.defaultTableAttr = item.attrName;
                        entry.defaultTableName = item.tableName;
                        entry.extraInfo = item.extraInfo;
                    });
                }
            },
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        };
    }, [entry]);
    const [{canDrop, isOver}, dropRef] = useDrop(dropConfig);
    const isActive = canDrop && isOver;
    const style: any = {};
    if (entry.specialColor) {
        style.color = entry.specialColor;
    }
    if (entry.specialBackgroundColor) {
        style.backgroundColor = entry.specialBackgroundColor;
    }

    const [isHovered, onMouseEnter, onMouseLeave] = useIsHovered([props]);

    const body = (
        <div className={classNames('mapping-target-entry', {canDrop, isActive})}
             onMouseEnter={onMouseEnter}
             onMouseLeave={onMouseLeave}
             ref={dropRef}>
            <div className='mapping-target-entry-header' style={style}>
                <EllipsisText text={entry.type ? `${entry.name} (${entry.type})` : entry.name}
                              style={headerTextStyle}
                              mode='dimension'
                              tooltipPlacement={tooltipPlacement}
                              length={props.width - 20}
                />
            </div>
            <div className={
                classNames('mapping-target-entry-body', {unmapped})}>
                {props.renderTargetSlot ? props.renderTargetSlot(entry) : (unmapped ?
                    <div>
                        {entry.specialIcon || null}
                        {props.unmappedHint}
                    </div>
                    : (
                        <>
                            {entry.specialIcon || null}
                            <EllipsisText style={textStyle} mode='dimension'
                                          tooltipPlacement={tooltipPlacement}
                                          text={`${tableName}:${entry.defaultTableAttr}`}
                                          length={props.width - 60}/>
                        </>

                    ))}
            </div>

            {isHovered &&
            <div className='target-entry-hover-wrapper'>
                <div className='clear-target-entry-icon'>
                    <Broom2Icon
                        hint={getTranslation(props.locale, 'Clear Mapping')} onClick={clearMe}/>
                </div>
            </div>
            }
        </div>
    );

    if (entry.desc) {
        return (
            <Tooltip title={entry.desc}>
                {body}
            </Tooltip>
        );
    }

    return body;
}

interface CustomMappingTargetEntryComponentProps extends MappingTargetEntryComponentProps {
    store: AttributeMappingStore;
    onRemove: () => any;
}

function CustomMappingTargetEntryComponentFunc(props: CustomMappingTargetEntryComponentProps) {
    const entry = props.entry;
    const [tempName, setTempName] = React.useState<string>('');
    // 因为要做重名检测，需要判断新的名字不和当前的所有名字冲突
    const [tempNameBeforeEditing, setTempNameBeforeEditing] = React.useState<string>('');
    const [isRepetition, setIsRepetition] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [isHovered, onMouseEnter, onMouseLeave] = useIsHovered([props]);

    const tableName = entry.defaultTableName;

    const unmapped = !entry.defaultTableId || !entry.defaultTableAttr;
    const dropConfig = React.useMemo(() => {
        return {
            accept: ['', 'smallint', 'bigint', 'int',
                'float', 'double', 'string', 'date', 'decimal',
                'short', 'byte',
                'timestamp', 'boolean', 'binary', 'tinyint', 'decimal', 'anyType'],
            drop: (item: DropResultType, monitor: DropTargetMonitor) => {
                if (item) {
                    runInAction(() => {
                        entry.defaultTableId = item.tableId;
                        entry.defaultTableAttr = item.attrName;
                        entry.defaultTableName = item.tableName;
                        entry.type = item.realType;
                        entry.extraInfo = item.extraInfo;
                    });
                }
            },
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        };
    }, [entry]);
    const [{canDrop, isOver}, dropRef] = useDrop(dropConfig);
    const isActive = canDrop && isOver;

    const removeMe = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        props.onRemove();
    }, []);

    const clearMe = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        runInAction(() => {
            entry.defaultTableAttr = '';
            entry.defaultTableId = '';
            entry.type = '';
        });
    }, [entry]);

    const enterEditMode = React.useCallback(() => {
        if (editMode) {
            return;
        }
        setEditMode(true);
        setTempName(entry.name);
        setTempNameBeforeEditing(entry.name);
        setIsRepetition(false);
        nextEventLoop(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        });
    }, [entry]);

    const try2ChangeName = function () {
        const finalName = inputRef.current!.value.trim();
        // 如果发生了变化，并且不为空，允许修改
        if (finalName !== tempNameBeforeEditing && finalName !== '') {
            // 检查是否和当前已经存在的属性同名
            if (props.store.allExistingNames.has(finalName)) {
                setIsRepetition(true);
                // 不让离开
                inputRef.current!.focus();
                return;
            } else {
                runInAction(() => {
                    entry.name = finalName;
                });
            }
        }
        setIsRepetition(false);
        setEditMode(false);
    };

    const body = (
        <div className={classNames('mapping-target-entry', {canDrop, isActive})}
             onMouseEnter={onMouseEnter}
             onMouseLeave={onMouseLeave}
             ref={dropRef}>
            <div onClick={enterEditMode} className='mapping-target-entry-header with-input'>
                {editMode ?
                    <input value={tempName}
                           ref={inputRef}
                           onChange={(e: any) => {
                               setTempName(e.target.value);
                               setIsRepetition(false);
                           }}
                           onBlur={try2ChangeName}
                    />
                    :
                    <EllipsisText text={entry.type ? `${entry.name} (${entry.type})` : entry.name}
                                  mode='dimension'
                                  length={props.width - 20}
                                  tooltipPlacement={tooltipPlacement}
                                  style={headerTextStyle}
                                  onClick={enterEditMode}
                    />
                }
            </div>
            <div className={
                classNames('mapping-target-entry-body', {unmapped})}>
                {props.renderTargetSlot ?
                    props.renderTargetSlot(entry) : (unmapped ? props.unmappedHint : (
                        <EllipsisText style={textStyle} mode='dimension'
                                      text={`${tableName}:${entry.defaultTableAttr}`}
                                      tooltipPlacement={tooltipPlacement}
                                      length={props.width - 60}/>))}
            </div>
            {isHovered &&
            <div className='target-entry-hover-wrapper'>
                <div className='remove-target-entry-icon'>
                    <CrossIcon onClick={removeMe} hint={getTranslation(props.locale, 'Remove')}/>
                </div>
                <div className='clear-target-entry-icon'>
                    <Broom2Icon
                        hint={getTranslation(props.locale, 'Clear Mapping')} onClick={clearMe}/>
                </div>
            </div>
            }
            {isRepetition && (
                <div className='target-name-exists-warning'>
                    {getTranslation(props.locale, 'Name exists', {name: tempName})}
                </div>
            )}
        </div>
    );

    if (entry.desc) {
        return (
            <Tooltip title={entry.desc}>
                {body}
            </Tooltip>
        );
    }

    return body;
}

const MappingTargetEntryComponent = observer(MappingTargetEntryComponentFunc);
const CustomMappingTargetEntryComponent = observer(CustomMappingTargetEntryComponentFunc);
export const AttributeMappingTarget = observer(AttributeMappingTargetFunc);
