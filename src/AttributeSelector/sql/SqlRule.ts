import {action, computed, observable} from 'mobx';
import {SqlRuleStore} from './SqlRuleStore';
import {AndOr, Rule} from '../../models/Rules';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_TIMESTAMP_FORMAT,
    isNumberType,
    Locales,
    supportedTypes,
    try2ConvertToNumber,
} from '../../utils';
import _find from 'lodash/find';
import moment from 'moment';
import {SqlRuleGroup} from './SqlRuleGroup';
import uuidv1 from 'uuid/v1';

export interface SqlRuleJson {
    id: string;
    attribute: string;
    attributeType?: supportedTypes;
    condition: string;
    attributeControl: string;
    value: any;
    isFunction: boolean;
    types: string;
}

export interface SqlRuleGroupJson {
    childs: Array<SqlRuleJson | SqlRuleGroupJson>;
    relations: AndOr;
    types: string;
}

export function mockEmptyRuleJson() {
    return {
        id: '',
        attribute: '',
        condition: '',
        attributeControl: '',
        value: undefined,
        isFunction: false,
        types: 'single',
    } as SqlRuleJson;
}

export class SqlRule extends Rule {
    @observable public attribute: string;
    @observable public attributeType: supportedTypes;
    @observable public condition: string | undefined;
    @observable public attributeControl: string | undefined;
    @observable public value: any;
    @observable public isFunction: boolean = false;
    public timestampFormat: string = DEFAULT_TIMESTAMP_FORMAT;
    public dateFormat: string = DEFAULT_DATE_FORMAT;
    mainStore: SqlRuleStore;

    get store() {
        return this.mainStore;
    }

    get ruleDef() {
        return this.store.ruleDefs.get(this.store.locale)!;
    }

    public getControlDesc(control: string): string {
        for (const ct of this.ruleDef.controlTypes) {
            if (ct.name === control) {
                return ct.translation;
            }
        }
        throw new Error('Cannot find controlType description for ' + control);
    }

    public getConditionDesc(condition: string): string {
        for (const ct of this.ruleDef.conditionTypes) {
            if (ct.name === condition) {
                return ct.translation;
            }
        }
        throw new Error('Cannot find controlType description for ' + condition);
    }

    get displayValue() {
        if (this.attributeType === 'timestamp') {
            return moment(this.value, 'x').format(this.timestampFormat);
        }
        if (this.attributeType === 'date') {
            return moment(this.value, 'x').format(this.dateFormat);
        }
        return this.value;
    }

    @computed
    get needValue() {
        const condition = this.condition;
        return condition && condition !== 'not_null' && condition !== 'is_null';
    }

    // 只有当所有该填项都填写完整后，才是可以被过滤的条件
    @computed
    get isFilterable() {
        const attrName = this.attribute;
        const control = this.attributeControl;
        const condition = this.condition;
        const needValue = this.needValue;
        // 检查用户是否已经填写了所有的条件，如果缺少任意一个，检查都不通过
        let check: boolean = !!attrName && !!control && !!condition;
        // 如果需要用户填写值，检查他是否填写了
        if (needValue) {
            check = check && (!!this.value || this.value === false);
        }
        return check;
    }

    @computed
    get inferType(): supportedTypes {
        const controlType = _find(this.ruleDef.controlTypes, ct => ct.name === this.attributeControl);
        if (!controlType) {
            return 'string';
        } else {
            if (controlType.inferType === 'self') {
                return this.attributeType;
            } else {
                return controlType.inferType as supportedTypes;
            }
        }
    }

    @computed
    get humanReadableString(): string {
        let result = '';
        const locale = this.ruleDef.locale;
        const check = this.isFilterable;
        const attrName = this.attribute;
        const control = this.attributeControl;
        const condition = this.condition;
        const needValue = this.needValue;

        // 检查通过，开始构建语句
        if (check) {
            if (this.attributeControl !== 'value') {
                result = this.getControlDesc(control!) + `(${attrName})`;
            } else {
                result = attrName;
            }

            if (locale === Locales.zh) {
                result += this.getConditionDesc(condition!);
            } else if (locale === Locales.en) {
                result += ' ' + this.getConditionDesc(condition!) + ' ';
            } else {
                throw new Error('Implement translation for locale ' + locale);
            }
            if (needValue) {
                result += this.displayValue!;
            }
            return result;
        } else {
            return '';
        }
    }

    // 一旦类型变了，就需要重置
    @action
    reset(condition = '', attributeControl = '') {
        this.attributeControl = attributeControl;
        this.value = '';
        this.condition = condition;
        this.isFunction = false;
    }

    // 比起普通的reset，把第一个列也重置
    @action
    resetAll() {
        this.attribute = '';
        this.reset('equals', 'value');
    }

    @action
    setAttribute(val: string) {
        this.attribute = val;
    }

    @action
    setAttributeType(val: supportedTypes, condition?: string, attributeControl?: string) {
        if (this.attributeType !== val) {
            this.reset(condition, attributeControl);
        }
        this.attributeType = val;
    }

    @action
    setCondition(val: string) {
        this.condition = val;
    }

    @action
    setControl(val: string) {
        this.attributeControl = val;
        this.condition = undefined;
        this.value = '';
    }

    @action
    setValue(val: any) {
        this.value = val;
    }

    @action
    setIsFunction(val: boolean) {
        this.isFunction = val;
    }

    public static fromJson(json: SqlRuleJson, group: SqlRuleGroup) {
        const ret = new SqlRule(group);
        ret.id = json.id || uuidv1();
        ret.attribute = json.attribute;
        ret.condition = json.condition;
        ret.attributeControl = json.attributeControl;
        ret.attributeType = json.attributeType!;
        ret.value = json.value;
        ret.isFunction = json.isFunction;
        return ret;
    }

    public toJson(): SqlRuleJson | null {
        if (!this.isFilterable) {
            return null;
        }
        const isNumber = isNumberType(this.attributeType!);
        const value = isNumber ? try2ConvertToNumber(this.value) : this.value;
        return {
            types: 'single',
            id: this.id,
            attribute: this.attribute,
            condition: this.condition!,
            attributeControl: this.attributeControl!,
            attributeType: this.attributeType!,
            value,
            isFunction: this.isFunction,
        };
    }
}
