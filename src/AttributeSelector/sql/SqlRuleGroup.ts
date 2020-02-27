import {SqlRuleJson, SqlRuleGroupJson, SqlRule} from './SqlRule';
import _findLast from 'lodash/findLast';
import _first from 'lodash/first';
import {computed, action} from 'mobx';
import {SqlRuleStore} from './SqlRuleStore';
import {AndOr, Rule, RuleBase, RuleGroup} from '../../models/Rules';
import {AttributeSelectorStore} from '../../stores/AttributeSelectorStore';

export class SqlRuleGroup extends RuleGroup {

    get store() {
        return this.mainStore as SqlRuleStore;
    }

    get ruleDef() {
        return this.store.ruleDefs.get(this.store.locale)!;
    }

    get childs() {
        return this.ruleChildren;
    }

    get relations() {
        return this.andOr;
    }

    public static fromJson(json: SqlRuleGroupJson, parent: SqlRuleGroup | null, store: AttributeSelectorStore) {
        const ret = new SqlRuleGroup(parent, store);
        ret.andOr = json.relations;
        ret.ruleChildren = json.childs.map(c => {
            if (c.types === 'single') {
                return SqlRule.fromJson(c as SqlRuleJson, ret);
            } else {
                return SqlRuleGroup.fromJson(c as SqlRuleGroupJson, ret, store);
            }
        });
        return ret;
    }

    public toJson(): SqlRuleGroupJson {
        let ruleChildren = this.ruleChildren.map((c: RuleBase) => c.toJson());
        ruleChildren = ruleChildren.filter((c: any) => {
            // sqlrule如果fields未填写完整，会返回null，
            if (!c) {
                return false;
            } else if (c.types === 'group') {
                // 过滤掉所有内容为空的group
                return c.childs.length > 0;
            }
            return true;
        });

        return {
            types: 'group',
            relations: this.relations,
            childs: ruleChildren,
        };
    }

    @computed
    get humanReadableString() {
        let result = '';
        if (!this.isRoot) {
            result += '(';
        }

        const logic = this.relations === AndOr.AND ? ' && ' : ' || ';

        const childrenResult = this.ruleChildren
            .map((r: SqlRule | SqlRuleGroup) => {
                return r.humanReadableString;
            })
            .filter((s: string) => s.length > 0);

        if (childrenResult.length === 0) {
            return '';
        } else {
            result += childrenResult.join(logic);
            if (!this.isRoot) {
                result += ')';
            }
        }
        return result;
    }

    // inherit from base class
    public copyPreviousRule(destination: SqlRule, source: SqlRule) {
        destination.value = '';

        if (source) {
            // target exists and copy
            destination.condition = source.condition;
            destination.attributeType = source.attributeType;
            destination.attribute = source.attribute;
            destination.attributeControl = source.attributeControl;
            destination.isFunction = source.isFunction;
        } else {
            // target doesn't exist and use default values
            destination.condition = 'equals';
            const defaultAttr = _first(this.store.attributeCandidates);
            destination.attribute = defaultAttr ? defaultAttr.attribute : '';
            destination.attributeControl = 'value';
            destination.attributeType = defaultAttr ? defaultAttr.attributeType : 'string';
        }
    }

    @action
    public addChild(c: SqlRule) {
        const copyPrevious = this.store.copyPrevious;
        if (copyPrevious && c instanceof SqlRule) {
            // currently only support sql previous copy
            const previousRule = _findLast(this.ruleChildren, (child) => child instanceof Rule);
            this.copyPreviousRule(c, previousRule as SqlRule);
        }
        this.ruleChildren.push(c);
    }
}
