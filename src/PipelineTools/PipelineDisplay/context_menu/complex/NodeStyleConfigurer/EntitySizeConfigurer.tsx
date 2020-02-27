import * as React from 'react';
import {getTranslation, Locales} from '../../../../../utils';
import './index.scss';
import Radio, {RadioChangeEvent} from 'antd/es/radio';
import 'antd/es/radio/style';
import {observer} from 'mobx-react';
import {NODE_LARGE_SIZE, NODE_MEDIUM_SIZE, NODE_NORMAL_SIZE} from '../../../../common/cytoscapeCommonStyle';

const RadioGroup = Radio.Group;

export interface EntitySizeConfigurerProps {
    locale: Locales;
    onChange: (event: RadioChangeEvent) => any;
    value: string | number;
    style?: React.CSSProperties;
}

@observer
export class EntitySizeConfigurer extends React.Component<EntitySizeConfigurerProps> {

    get locale() {
        return this.props.locale;
    }

    get sizeOptions(): Array<{ title: string, value: number }> {
        return [
            {
                title: getTranslation(this.locale, 'Normal'),
                value: NODE_NORMAL_SIZE,
            },
            {
                title: getTranslation(this.locale, 'L'),
                value: NODE_MEDIUM_SIZE,
            },
            {
                title: getTranslation(this.locale, 'XL'),
                value: NODE_LARGE_SIZE,
            },
        ];
    }

    public render() {
        return (
            <div className='configurer-area' style={this.props.style || {}}>
                <h4>
                    {getTranslation(this.locale, 'Entity Size')}
                </h4>
                <RadioGroup onChange={this.props.onChange} size='small' value={this.props.value}>
                    {this.sizeOptions.map((option) => (
                        <Radio value={option.value} key={option.value}>{option.title}</Radio>
                    ))}
                </RadioGroup>
            </div>
        );
    }
}
