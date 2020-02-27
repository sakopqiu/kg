import React, {useCallback, useState} from 'react';
import Row from 'antd/es/row';
import 'antd/es/row/style';
import Col from 'antd/es/col';
import 'antd/es/col/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import AttributeEditor from './AttributeEditor';
import {useSchemaHook} from '../params/useSchemaHook';
import {observer} from 'mobx-react-lite';
import './AddAttributeTool.scss';
import {AddAttributeToolProps, ElementType} from '../../../../interfaces';
import {CyEdgeData} from '../../../../model/CyEdge';
import {CyNodeData} from '../../../../model/CyNode';
import {PlusIcon} from '../../../../../../icons/PlusIcon';
import {debug, getTranslation} from '../../../../../../utils';
import {FieldConfig} from '../../../../model/FieldConfig';

function AddAttributeTool(props: AddAttributeToolProps) {
    const [newAttributeVisible, setNewAttributeVisible] = useState(false);
    const schema = useSchemaHook(props.elementData, props.mainStore);

    const onNewAttributePopClose = useCallback(() => {
        setNewAttributeVisible(false);
    }, []);

    const onCreateConfirm = useCallback(async (element: CyEdgeData | CyNodeData, elementType: ElementType, field: FieldConfig) => {
        if (props.fieldAdded) {
            await props.fieldAdded(element.id, elementType, field);
        }
        // create attribute will update schema...
        if (schema) {
            schema.fields.push({fieldName: field.fieldName, fieldType: field.fieldType, editable: true});
        }
        element.setValue(field.fieldName, field.fieldValue);
        debug(`Adding ${element.id}-${elementType}-${field.fieldName}:${field.fieldValue}`);
    }, [schema, props.fieldAdded]);

    return !props.readonly ?
        <Row className='add-attribute-row'>
            <Col span={24} style={{textAlign: 'right'}}>
                <Popover
                    overlayClassName='attribute-editor-popover'
                    content={
                        <AttributeEditor
                            element={props.elementData as (CyNodeData | CyEdgeData)}
                            elementType={props.elementType}
                            locale={props.locale}
                            onClose={onNewAttributePopClose}
                            onConfirm={onCreateConfirm}
                            clearFieldsOnConfirm
                        />}
                    visible={newAttributeVisible}
                    placement='bottomLeft'
                >
                    {/*<a onClick={this.onNewAttributeModalOpen} className='add-attribute'>*/}
                    {/*<PlusIcon style={{marginRight: 6}}/>{getTranslation(this.locale, 'Add Attribute')}*/}
                    {/*</a>*/}
                    <a className='add-attribute disabled'>
                        <PlusIcon style={{marginRight: 6}}/>{getTranslation(props.locale, 'Add Attribute')}
                    </a>
                </Popover>
            </Col>
        </Row> : null;
}

export default observer(AddAttributeTool);
