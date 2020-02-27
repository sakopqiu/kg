import React, {useContext} from 'react';
import AttributeRow from '../../../../right/DetailsPanel/tabs/attribute/AttributeRow';
import {
    getTranslation,
    Locales,
} from '../../../../../../utils';
import {MapExplorerContext} from '../Context/MapExplorerContext';
import './index.scss';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import _startsWith from 'lodash/startsWith';
import {innerFieldPrefix} from '../../../../kg-interface';
import {FieldConfig} from '../../../../model/FieldConfig';
import AttributePanel from '../../../../right/DetailsPanel/tabs/attribute/AttributePanel';

interface IDetailPanelProps {
    locale: Locales;
}

// TODO 轻量级详情，之后交互会扩充
// TODO 目前只支持一个节点
export function MapDetailPanel(props: IDetailPanelProps) {
    const {mapStore} = useContext(MapExplorerContext);
    const selectedElement = mapStore.selectedElements[0]!;
    return (
        <div className={'map-detail-view'}>
            <AttributeRow
                attrName={getTranslation(props.locale, 'Type')}
                attrValue={getTranslation(props.locale, 'Entities')}
            />
            <AttributeRow
                attrName={getTranslation(props.locale, 'Label')}
                attrValue={selectedElement.label}
            />
            <Divider />
            {
                Object.keys(selectedElement.params)
                    .filter((fieldName) => !_startsWith(fieldName, innerFieldPrefix))
                    .map((attr) => {
                        const param = selectedElement.params[attr];
                        return {
                            fieldName: attr,
                            fieldType: param.type,
                            fieldValue: param.value,
                        };
                    })
                    .map((fieldConfig: FieldConfig) => {
                        return (
                            <AttributePanel
                                className={'attribute-panel'}
                                key={fieldConfig.fieldName}
                                name={fieldConfig.fieldName}
                                value={fieldConfig.fieldValue}
                                type={fieldConfig.fieldType}
                            />);
                    })
            }
        </div>
    );
}
