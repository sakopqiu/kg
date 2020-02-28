import React from 'react';
import Checkbox from 'antd/es/checkbox';
import 'antd/es/checkbox/style';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';

import {RadioChangeEvent} from 'antd/es/radio';
import {complexInject} from '../../../DisplayCanvasUtils';
import {CheckboxChangeEvent} from 'antd/es/checkbox/Checkbox';
import {getTranslation} from '../../../../../utils';
import {ComplexModeCanvasComponent, ComplexModeCanvasComponentProps} from '../ComplexModeCanvasComponent';

const RadioGroup = Radio.Group;

// fully controlled component
interface IWeightConfigProps extends ComplexModeCanvasComponentProps {
    onChange: (values: Map<string, string | null>) => void; // key is the relationship name and value is the selected field
    values: Map<string, string | null>;
}

@complexInject
export class WeightConfig extends ComplexModeCanvasComponent<IWeightConfigProps> {

    public render() {
        const edgeSchemas = this.service.canvasStore.displayModePipelineSchema.edges;
        return (
            <div className='weight-config-wrapper'>
                <div className='weight-config-header'><span>{getTranslation(this.locale, 'Configure Weight')}</span>
                </div>
                {edgeSchemas.map((edge) => (
                    <div className='weight-config-wrapper' key={edge.type}>
                        <Checkbox
                            checked={this.props.values.has(edge.type)}
                            onChange={(event: RadioChangeEvent) => this.onCheckboxChange(event, edge.type)}>{edge.type}
                        </Checkbox>
                        {this.props.values.has(edge.type) &&
                        <RadioGroup onChange={(event: RadioChangeEvent) => this.onChange(event, edge.type)}
                                    value={this.props.values.get(edge.type)}>
                            {edge.fields.map((field) => (
                                <Radio className='field-option' value={field.fieldName}
                                       key={field.fieldName}>{field.fieldName}</Radio>
                            ))}
                        </RadioGroup>}
                    </div>
                ))}
            </div>
        );
    }

    private onCheckboxChange = (event: CheckboxChangeEvent, relationship: string) => {
        const newValue = new Map<string, string | null>(this.props.values);
        if (event.target.checked) {
            newValue.set(relationship, null);
        } else {
            newValue.delete(relationship);
        }
        this.props.onChange(newValue);
    }

    private onChange = (event: RadioChangeEvent, relationship: string) => {
        const newValue = new Map<string, string | null>(this.props.values);
        newValue.set(relationship, event.target.value);
        this.props.onChange(newValue);
    }
}
