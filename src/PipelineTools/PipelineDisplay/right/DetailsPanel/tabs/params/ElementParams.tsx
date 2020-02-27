import React, {useCallback, useContext, useMemo, useState} from 'react';
import AttributePanel from '../attribute/AttributePanel';
import Dropdown from 'antd/es/dropdown';
import 'antd/es/dropdown/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import {AttributeMenu, AttributeOperations, IClickParam} from '../attribute/AttributeMenu';
import AttributeEditor from '../attribute/AttributeEditor';
import {observer} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import _remove from 'lodash/remove';
import {useSchemaHook} from './useSchemaHook';
import {FilterContext, matchFilter} from '../filter/FilterContext';
import {ElementParamsBaseProps, ElementType} from '../../../../interfaces';
import {CyNodeData} from '../../../../model/CyNode';
import {CyEdgeData} from '../../../../model/CyEdge';
import {SetupIcon} from '../../../../../../icons/SetupIcon';
import {FieldConfig} from '../../../../model/FieldConfig';
import {debug} from '../../../../../../utils';
import {getKgFields} from '../../../../CanvasDrawUtils';
import {complexCanvasConfig} from '../../../../DisplayCanvasUtils';

export interface ElementParamsProps extends ElementParamsBaseProps {
    elementData: CyEdgeData | CyNodeData;
    elementType: ElementType;
}

function ElementParams(props: ElementParamsProps) {
    const [filterString] = useContext(FilterContext);
    const [currentActiveField, setCurrentActiveField] = useState<string | null>(null);
    const schema = useMemo(() => {
        return useSchemaHook(props.elementData, props.mainStore);
    }, [props.elementData, props.mainStore]);
    const fieldAlias = React.useContext(complexCanvasConfig).fieldAlias!;

    const onOperationClick = useCallback(async (param: IClickParam) => {
        if (param.operation === AttributeOperations.EDIT) {
            setCurrentActiveField(param.element.id + param.field.fieldName);
        } else if (param.operation === AttributeOperations.DELETE) {
            if (props.fieldDeleted) {
                await props.fieldDeleted(param.element.id, param.elementType, param.field);
            }
            param.element.removeKey(param.field.fieldName);
            // delete attribute will update schema...
            if (schema) {
                runInAction(() => {
                    _remove(schema!.fields, (field) => field.fieldName === param.field.fieldName);
                });
            }
            debug(`Deleting ${param.element.id}-${param.elementType}-${param.field.fieldName}`);
        }
    }, [schema]);

    const onClose = useCallback(() => {
        setCurrentActiveField(null);
    }, []);

    const onEditConfirm = useCallback(async (element: CyNodeData | CyEdgeData, elementType: ElementType, field: FieldConfig) => {
        if (props.fieldChanged) {
            await props.fieldChanged(element.id, elementType, field);
        }
        element.setValue(field.fieldName, field.fieldValue);
        debug(`Editing ${element.id}-${elementType}-${field.fieldName}:${field.fieldValue}`);
    }, []);

    const renderFieldEditButton = useCallback((w: CyEdgeData | CyNodeData, elementType: ElementType, fieldConfig: FieldConfig) => {
        const editable = schema ? props.mainStore.isEditable(schema, fieldConfig.fieldName) : false;
        return (
            editable && !props.readonly &&
            <Dropdown
                overlay={
                    <AttributeMenu
                        element={w}
                        locale={props.locale}
                        elementType={elementType}
                        onClick={onOperationClick}
                        field={fieldConfig}
                    />
                }
                trigger={['click']}
            >
                <Popover
                    overlayClassName='attribute-editor-popover'
                    content={
                        <AttributeEditor
                            element={w}
                            elementType={elementType}
                            field={fieldConfig}
                            locale={props.locale}
                            onClose={onClose}
                            onConfirm={onEditConfirm}
                            mode='edit'
                        />}
                    visible={currentActiveField === (w.id + fieldConfig.fieldName)}
                    placement='topRight'
                >
                    <SetupIcon className='info-setting-icon' style={{fontSize: 13}}/>
                </Popover>
            </Dropdown>
        );
    }, [props.readonly, props.mainStore, props.locale, currentActiveField]);

    const enumerableKgKeys = getKgFields(Array.from(props.elementData.params.keys()), (key: string) => key);
    return (
        <>
            {
                enumerableKgKeys
                    .map((attr) => {
                        const type = schema ? props.mainStore.getFieldType(schema, attr) : '';
                        const value = props.elementData.getValue(attr);
                        return {
                            fieldName: attr,
                            fieldType: type,
                            fieldValue: value,
                        };
                    })
                    .filter((fieldConfig: FieldConfig) => matchFilter(fieldAlias(fieldConfig.fieldName), filterString) || matchFilter(fieldConfig.fieldValue, filterString))
                    .map((fieldConfig: FieldConfig) => {
                        return (
                            <AttributePanel
                                key={fieldConfig.fieldName}
                                name={fieldAlias(fieldConfig.fieldName)}
                                value={fieldConfig.fieldValue}
                                type={fieldConfig.fieldType}
                                topRightTool={renderFieldEditButton(props.elementData, props.elementType, fieldConfig)}
                                style={{backgroundColor: '#FFF'}}
                            />);
                    })
            }
        </>
    );
}

export default observer(ElementParams);
