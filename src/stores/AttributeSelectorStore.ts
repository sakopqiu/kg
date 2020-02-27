import {LoadableStoreImpl} from './LoadableStoreImpl';
import {action, computed, observable} from 'mobx';
import {Rule, RuleGroup} from '../models/Rules';

export class AttributeSelectorStore<R extends Rule = Rule, RG extends RuleGroup = RuleGroup> extends LoadableStoreImpl {
    @observable rootRuleGroup: RG;

    constructor(public RuleFunc: new (parent: RuleGroup, mainStore: AttributeSelectorStore<R, RG>) => R = (Rule as any),
                public RuleGroupFunc: new (parent: RuleGroup | null, mainStore: AttributeSelectorStore<R, RG>) => RG = (RuleGroup as any),
    ) {
        super();
        this.rootRuleGroup = new RuleGroupFunc(null, this);
    }

    @computed
    get isEmpty() {
        return this.rootRuleGroup.isEmpty;
    }

    @action
    reset() {
        this.rootRuleGroup = new this.RuleGroupFunc(null, this);
    }

    @action
    setRootRuleGroup(ruleGroup: RG) {
        this.rootRuleGroup = ruleGroup;
    }

    get toJson() {
        return this.rootRuleGroup.toJson();
    }

    debug() {
        console.log(JSON.stringify(this.toJson, null, 2));
    }
}
