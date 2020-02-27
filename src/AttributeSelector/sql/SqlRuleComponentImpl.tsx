import * as React from 'react';
import Select, {SelectValue} from 'antd/es/select';
import 'antd/es/select/style';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import DatePicker from 'antd/es/date-picker';
import 'antd/es/date-picker/style';

import {SqlAttribute, SqlRuleStore} from './SqlRuleStore';
import {SqlRule} from './SqlRule';
import {ConditionType, ControlType} from './RuleDef';
import {observer} from 'mobx-react';
import './index.scss';
import {computed} from 'mobx';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_TIMESTAMP_FORMAT,
    getTranslation,
    inferTypes,
    supportedTypes,
} from '../../utils';
import moment, {Moment} from 'moment';
import {IRuleComponentImplProps} from '../index';

// (window as any).moment = moment;
const Option = Select.Option;

export interface ISqlRuleImplProps extends IRuleComponentImplProps<SqlRule> {

}

@observer
export class SqlRuleComponentImpl extends React.Component<ISqlRuleImplProps> {
    constructor(props: ISqlRuleImplProps) {
        super(props);
        this.onAttributeChange = this.onAttributeChange.bind(this);
        this.filterOption = this.filterOption.bind(this);
        this.onControlTypeChange = this.onControlTypeChange.bind(this);
        this.onConditionTypeChange = this.onConditionTypeChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onSelectValueChange = this.onSelectValueChange.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
    }

    private onControlTypeChange(val: string) {
        this.rule.setControl(val);
    }

    private onValueChange(e: React.ChangeEvent<any>) {
        this.rule.setValue(e.target.value);
    }

    private onSelectValueChange(str: SelectValue) {
        this.rule.setValue(str === 'true');
    }

    private onTimeChange(m: Moment) {
        this.rule.setValue(m ? m.valueOf() : null);
    }

    private onConditionTypeChange(val: string) {
        this.rule.setCondition(val);
    }

    private onAttributeChange(val: string) {
        const attributeAndType = val.split(':');
        this.rule.setAttribute(attributeAndType[0]);
        this.rule.setAttributeType(
            attributeAndType[1] as supportedTypes,
            'equals',
            'value',
        );
    }

    private filterOption(input: string, option: any) {
        const optionValue = option.props.value;
        const attributeName = optionValue.split(':')[0];
        return attributeName.toLowerCase().includes(input.toLowerCase());
    }

    get rule(): SqlRule {
        return this.props.rule as SqlRule;
    }

    get ruleDef() {
        return this.mainStore.ruleDefs.get(this.locale)!;
    }

    get mainStore(): SqlRuleStore {
        return this.props.mainStore as SqlRuleStore;
    }

    get locale() {
        return this.props.locale;
    }

    @computed
    get attributeCandidates() {
        return this.mainStore.attributeCandidates;
    }

    @computed
    get controlTypeCandidates() {
        const attrType = this.rule.attributeType;
        if (!attrType) {
            return [];
        } else {
            return this.ruleDef.getAvailableControlTypes(attrType);
        }
    }

    @computed
    get conditionTypeCandidates() {
        const attrType = this.rule.attributeType;
        const control = this.rule.attributeControl;
        if (!attrType || !control) {
            return [];
        } else {
            const inferredType: inferTypes = this.ruleDef.getControlInferredType(control);
            const realType: supportedTypes = inferredType === 'self' ? attrType : inferredType;
            return this.ruleDef.getAvailableConditionTypes(realType);
        }
    }

    // 如果是inferType是时间，显示时间控件，是boolean，显示select
    @computed
    get showValueInput() {
        return this.rule.needValue;
    }

    @computed
    get attributeTypeCompound() {
        if (this.rule.attribute) {
            return this.rule.attribute + ':' + this.rule.attributeType;
        } else {
            return undefined;
        }
    }

    private getValueInput() {
        const inferType = this.rule.inferType;
        this.rule.timestampFormat = this.props.timestampFormat || DEFAULT_TIMESTAMP_FORMAT;
        this.rule.dateFormat = this.props.dateFormat || DEFAULT_DATE_FORMAT;
        if (inferType === 'boolean') {
            return (
                <Select
                    className='sql-rule-select value'
                    onChange={this.onSelectValueChange}
                    placeholder={getTranslation(this.locale, 'T/F')}
                    value={this.rule.value === '' ? undefined : this.rule.value + ''}>
                    <Option value='true'>True</Option>
                    <Option value='false'>False</Option>
                </Select>
            );
        } else if (inferType === 'date') {
            return (
                <DatePicker
                    className='sql-rule-select date'
                    value={this.rule.value ? moment(this.rule.value, 'x') : undefined}
                    onChange={this.onTimeChange} format={this.rule.dateFormat}/>
            );
        } else if (inferType === 'timestamp') {
            return (
                <DatePicker
                    className='sql-rule-select timestamp'
                    value={this.rule.value ? moment(this.rule.value, 'x') : undefined}
                    onChange={this.onTimeChange}
                    showTime
                    format={this.rule.timestampFormat}/>
            );
        } else {
            return (
                <Input className='sql-rule-select value' value={this.rule.value} onChange={this.onValueChange}/>
            );
        }
    }

    public render() {
        return (
            <React.Fragment>
                <Select
                    placeholder={getTranslation(this.locale, 'Select Attr')}
                    value={this.attributeTypeCompound}
                    showSearch
                    filterOption={this.filterOption}
                    className='sql-rule-select attribute'
                    onChange={this.onAttributeChange}
                >
                    {this.attributeCandidates.map((attr: SqlAttribute) => {
                        const displayName = attr.attributeDisplayName || attr.attribute;
                        return (
                            <Option
                                key={attr.attribute}
                                title={displayName + '(' + attr.attributeType + ')'}
                                value={attr.attribute + ':' + attr.attributeType}
                            >
                                {displayName} ({attr.attributeType})
                            </Option>
                        );
                    })}
                </Select>
                {!this.mainStore.isSimple && <Select
                    placeholder={getTranslation(this.locale, 'Select Ctrl')}
                    value={this.rule.attributeControl || undefined}
                    className='sql-rule-select control'
                    onChange={this.onControlTypeChange}
                >
                    {this.controlTypeCandidates.map((ct: ControlType) => {
                        return (
                            <Option key={ct.name} value={ct.name} title={ct.translation}>
                                {ct.translation}
                            </Option>
                        );
                    })}
                </Select>}
                <Select
                    placeholder={getTranslation(this.locale, 'Select Condition')}
                    value={this.rule.condition || undefined}
                    className='sql-rule-select condition'
                    onChange={this.onConditionTypeChange}
                >
                    {this.conditionTypeCandidates.map((ct: ConditionType) => {
                        return (
                            <Option key={ct.name} value={ct.name} title={ct.translation}>
                                {ct.translation}
                            </Option>
                        );
                    })}
                </Select>

                {this.showValueInput ? (
                    this.getValueInput()
                ) : null}
            </React.Fragment>
        );
    }
}
