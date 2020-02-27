import React, {useCallback, useContext} from 'react';
import {SophonModal} from '../../../../../../components/SophonModal';
import {getTranslation} from '../../../../../../utils';
import {MapExplorerContext} from '../Context/MapExplorerContext';
import Form, {FormComponentProps} from 'antd/es/form';
import 'antd/es/form/style';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import {useLoadingEffect} from '../../../../../../components/SophonHooks/LoadingEffect';
import {observer} from 'mobx-react-lite';
import Leaflet from 'leaflet';
import './index.scss';

const FormItem = Form.Item;

export interface HeatMapData {
    lat: number;
    lng: number;
    v: number;
}

export interface HeatMapConfig {
    labelFieldMap: Map<string, string[]>; // key is label, values are field based on the label selection
    onConfirm: (label: string, field: string, bounds: Leaflet.LatLngBounds) => Promise<HeatMapData[]>;
}

interface IHeatMapSettingModalProps extends FormComponentProps {
    config: HeatMapConfig;
}

const HeatMapSettingModalFunc = observer((props: IHeatMapSettingModalProps) => {
    const {mapStore, locale} = useContext(MapExplorerContext);
    async function drawHeatMap(label: string, field: string) {
        const result = await props.config.onConfirm(label, field, mapStore.map.getBounds());
        mapStore.addHeatLayer(result);
        mapStore.setHeatSettingVisible(false);
    }
    const [onConfirmWrapper, onConfirmLoading] = useLoadingEffect(drawHeatMap);
    const {getFieldDecorator} = props.form;
    const onClose = useCallback(() => {
        mapStore.setHeatSettingVisible(false);
    }, [mapStore]);
    function onConfirm() {
        props.form.validateFields(async (error, values) => {
            if (!error) {
                await onConfirmWrapper(values.label, values.field);
            }
        });
    }

    function onLabelSelectChange(value: string) {
        mapStore.setHeaMapSelectedLabel(value);
        props.form.setFieldsValue({field: ''});
    }

    const availableFields = props.config.labelFieldMap.get(mapStore.heatMapSelectedLabel) || [];
    return (
        <SophonModal
            showState={mapStore.heatSettingVisible}
            shadowStyles={{position: 'absolute', justifyContent: 'flex-start', right: 'auto'}}
            className={'heat-map-setting'}
            locale={locale}
            title={getTranslation(locale, 'Heat Map Setting')}
            confirmOption={{
                onConfirm,
            }}
            cancelOption={{
                showCross: true,
                onCancel: onClose,
            }}
            loading={onConfirmLoading}
            width={400}
            buttonAlign='right'
        >
            <div>{getTranslation(locale, 'Configure heatmap based on entity field')}</div>
            <FormItem colon={false} label={getTranslation(locale, 'Entity Label')}>
                {getFieldDecorator('label', {
                    initialValue: mapStore.heatMapSelectedLabel,
                    rules: [
                        {required: true, message: getTranslation(locale, 'Entity label is required')},
                    ],
                })(
                    <Select onChange={onLabelSelectChange}>
                        {Array.from(props.config.labelFieldMap.keys()).map(l => (
                            <Select.Option key={l} value={l}>{l}</Select.Option>
                        ))}
                    </Select>,
                )}
            </FormItem>
            <FormItem colon={false} label={getTranslation(locale, 'Field-based')}>
                {getFieldDecorator('field', {
                    initialValue: mapStore.heatMapSelectedField,
                    rules: [
                        {required: true, message: getTranslation(locale, 'Field-based is required')},
                    ],
                })(
                    <Select onChange={mapStore.setHeatMapSelectedField}>
                        {availableFields.map(l => (
                            <Select.Option key={l} value={l}>{l}</Select.Option>
                        ))}
                    </Select>,
                )}
            </FormItem>
        </SophonModal>
    );
});

export const HeatMapSettingModal = Form.create<IHeatMapSettingModalProps>()(HeatMapSettingModalFunc);
