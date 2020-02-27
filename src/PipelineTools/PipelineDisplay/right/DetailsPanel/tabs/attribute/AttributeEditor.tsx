import React from 'react';
import {FormComponentProps} from 'antd/es/form';

import Form from 'antd/es/form';
import 'antd/es/form/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import InputNumber from 'antd/es/input-number';
import 'antd/es/input-number/style';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';

import './AttributeEditor.scss';
import {CyEdgeData} from '../../../../model/CyEdge';
import {CyNodeData} from '../../../../model/CyNode';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {FieldConfig} from '../../../../model/FieldConfig';
import {getTranslation, Locales, MAX_DESC_LENGTH} from '../../../../../../utils';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {LoadingTargets} from '../../../../../../stores/LoadableStoreImpl';
import {ElementType} from '../../../../interfaces';

export type AttributeEditorMode = 'edit' | 'new';

interface IAttributeEditorProps extends FormComponentProps {
    element: CyEdgeData | CyNodeData;
    elementType: ElementType;
    field?: FieldConfig;
    locale: Locales;
    onClose: () => void;
    onConfirm: (element: CyEdgeData | CyNodeData, elementType: ElementType, field: FieldConfig) => void;
    mode?: AttributeEditorMode; // default is new
    clearFieldsOnConfirm?: boolean; // whether reset the fields when
}

const numericType = new Set<string>(['smallint', 'bigint', 'int', 'float', 'double', 'tinyint', 'short']);
const availableTypes = ['smallint', 'bigint', 'int', 'float', 'double', 'string', 'date', 'timestamp', 'boolean', 'binary', 'tinyint'];

const FormItem = Form.Item;

class AttributeEditor extends ComplexModeCanvasComponent<IAttributeEditorProps & ComplexModeCanvasComponentProps> {

    public render() {
        const {getFieldDecorator} = this.props.form;
        // 不是数值型，默认都是string
        const isNumericType = this.props.field && numericType.has(this.props.field.fieldType);
        return (
            <div className='attribute-editor'>
                <div
                    className='editor-title'>{getTranslation(this.props.locale, this.props.field ? 'Edit Attribute' : 'Create Attribute')}</div>
                <FormItem colon={false} label={getTranslation(this.props.locale, 'Name')}>
                    {getFieldDecorator('fieldName', {
                        rules: [
                            {
                                required: true,
                                message: getTranslation(this.props.locale, 'Name is required'),
                            },
                        ],
                        initialValue: this.props.field ? this.props.field.fieldName : '',
                    })(<Input disabled={this.props.mode === 'edit'}
                              placeholder={getTranslation(this.props.locale, 'Input attribute name')}/>)}
                </FormItem>
                <FormItem colon={false} label={getTranslation(this.props.locale, 'Data Type')}>
                    {getFieldDecorator('fieldType', {
                        rules: [
                            {
                                required: true,
                                message: getTranslation(this.props.locale, 'Type is required'),
                            },
                        ],
                        initialValue: this.props.field ? this.props.field.fieldType : '',
                    })(
                        <Select style={{width: '100%'}} disabled={this.props.mode === 'edit'}
                                placeholder={getTranslation(this.props.locale, 'Select type')}>
                            {availableTypes.map((type) => (
                                <Select.Option value={type} key={type}>{type}</Select.Option>
                            ))}
                        </Select>,
                    )}
                </FormItem>
                <FormItem colon={false} label={getTranslation(this.props.locale, 'Value')}>
                    {isNumericType ?
                        getFieldDecorator('fieldValue', {
                            initialValue: this.props.field ? this.props.field.fieldValue : '',
                        })(
                            <InputNumber style={{width: '100%'}}
                                         placeholder={getTranslation(this.props.locale, 'Input attribute value')}/>,
                        ) :
                        getFieldDecorator('fieldValue', {
                            initialValue: this.props.field ? this.props.field.fieldValue : '',
                            rules: [{
                                max: MAX_DESC_LENGTH,
                                message: getTranslation(this.locale, 'The length cannot exceed {{maxLength}} characters', {maxLength: MAX_DESC_LENGTH}),
                            }],
                        })(
                            <Input placeholder={getTranslation(this.props.locale, 'Input attribute value')}/>,
                        )}
                </FormItem>
                <div className='attribute-editor-footer'>
                    <Button onClick={this.onClose}
                            className='cancel'>{getTranslation(this.props.locale, 'Cancel')}</Button>
                    <Button
                        type='primary'
                        className='confirm'
                        onClick={this.onOk}
                        loading={!!this.currentActiveStore && this.currentActiveStore.isLoading(LoadingTargets.BUTTON_OK)}
                    >{getTranslation(this.props.locale, 'Confirm')}</Button>
                </div>
            </div>
        );
    }

    private onOk = () => {
        this.props.form.validateFields(async (error, values) => {
            if (!error) {
                await this.onConfirm(values);
                this.props.onClose();
                if (this.props.clearFieldsOnConfirm) {
                    this.props.form.resetFields();
                }
            }
        });
    }

    private onClose = () => {
        this.props.onClose();
        this.props.form.resetFields();
    }

    private async onConfirm(values: any) {
        await this.props.onConfirm(this.props.element, this.props.elementType, {
            fieldName: values.fieldName,
            fieldType: values.fieldType,
            fieldValue: values.fieldValue,
        });
    }
}

export default complexInject(Form.create()(AttributeEditor));
