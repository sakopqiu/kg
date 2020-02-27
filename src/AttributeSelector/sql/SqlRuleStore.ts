import {SqlRule} from './SqlRule';
import {RuleDef} from './RuleDef';
import {computed, observable, action} from 'mobx';
import {SqlRuleGroup} from './SqlRuleGroup';
import {AttributeSelectorStore} from '../../stores/AttributeSelectorStore';
import {Locales, supportedTypes} from '../../utils';

export interface SqlAttribute {
    attribute: string;
    attributeDisplayName?: string;
    attributeType: supportedTypes;
}

export class SqlRuleStore extends AttributeSelectorStore<SqlRule, SqlRuleGroup> {
    // 搜索实体/边的名字
    @observable searchString = '';
    @observable public attributeCandidates: SqlAttribute[] = [];
    @observable public ruleDefs: Map<Locales, RuleDef> = new Map<Locales, RuleDef>();

    /**
     *
     * @param {Locales} locale
     * @param {boolean} copyPrevious true will auto fill the new rule's attr and condition fields with the values of the previous rule's, if it's the first one in group, use the first value of attr and equal condition
     * @param {boolean} isSimple true will hide the control select field and field value is always 'value'
     */
    constructor(public locale: Locales, public copyPrevious: boolean, public isSimple: boolean) {
        super(SqlRule, SqlRuleGroup);
    }

    firstRule() {
        return this.rootRuleGroup.childs[0];
    }

    @action
    public setAttributeCandidates(val: SqlAttribute[]) {
        this.attributeCandidates = val;
    }

    @action
    public setRuleDefs(val: Map<Locales, RuleDef>) {
        this.ruleDefs = val;
    }

    @action
    public setSearchString(val: string) {
        this.searchString = val;
    }

    @computed
    get humanReadableString() {
        return this.rootRuleGroup.humanReadableString;
    }
}
