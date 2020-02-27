import React from 'react';
import 'antd/es/modal/style';
import Form from 'antd/es/form';
import 'antd/es/form/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import 'antd/es/button/style';
import {FormComponentProps} from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import {getTranslation, Locales, validateCharLen, validateName} from '../../../utils';
import {useLoadingEffect} from '../../../components/SophonHooks/LoadingEffect';
import {SophonModal} from '../../../components/SophonModal';

interface NameAndDescriptionModalProps extends FormComponentProps {
    itemName: string;
    locale: Locales;
    nameInitialValue: string;
    descInitialValue: string;
    updateId?: string;
    cancelText?: string;
    onCancel: () => void;
    onConfirm: (name: string, desc: string, id?: string) => Promise<any>;
    confirmText?: string;
}

function NameAndDescriptionModalFunc(props: NameAndDescriptionModalProps) {
    const {itemName, locale} = props;
    const getFieldDecorator = props.form.getFieldDecorator;
    const formItemLayout = {
        labelCol: {span: 5},
        wrapperCol: {span: 19},
    };
    const [doConfirm, confirmLoading] = useLoadingEffect(props.onConfirm);

    return (
        <SophonModal
            locale={locale}
            topPadding={90}
            hitShadowClose
            width={700}
            height={460}
            title={`${itemName}`}
            loading={confirmLoading}
            buttonAlign={'right'}
            cancelOption={{
                showCross: true,
                onCancel: props.onCancel,
                text: props.cancelText || getTranslation(locale, 'Cancel'),
            }}
            confirmOption={{
                onConfirm: () => {
                    props.form.validateFields(async (error, values) => {
                        if (!error) {
                            await doConfirm(values.name, values.desc, values.id);
                            props.onCancel();
                        }
                    });
                },
                text: props.confirmText || getTranslation(locale, 'Confirm'),
            }}
            showState={true}
        >
            <Form style={{height: '100%'}}>
                  {getFieldDecorator('id', {
                    initialValue: props.updateId,
                  })(<Input type='hidden'/>)}
                <Form.Item {...formItemLayout} label={getTranslation(locale, 'Name')}>
                    {getFieldDecorator('name', {
                        initialValue: props.nameInitialValue,
                        rules: [
                            {transform: value => (!value ? '' : value.toString().trim())},
                            {validator: (rule: any, value: any, callback: any) => callback(validateName(value, locale))},
                        ],
                    })(<Input/>)}
                </Form.Item>
                <Form.Item {...formItemLayout} label={getTranslation(locale, 'Description')}>
                    {getFieldDecorator('desc', {
                        initialValue: props.descInitialValue,
                        rules: [
                            {transform: value => (!value ? '' : value.toString().trim())},
                            {validator: (rule: any, value: any, callback: any) => callback(validateCharLen(value, locale))},
                        ],
                    })(<TextArea style={{height: 200}}/>)}
                </Form.Item>
            </Form>
        </SophonModal>
    );
}

export const NameAndDescriptionModal = Form.create<NameAndDescriptionModalProps>()(NameAndDescriptionModalFunc);
