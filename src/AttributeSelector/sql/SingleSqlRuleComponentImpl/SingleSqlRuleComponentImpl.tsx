import * as React from 'react';
import {SqlRuleJson, SqlRule} from '../SqlRule';
import {SqlRuleComponentImpl} from '../SqlRuleComponentImpl';
import {Locales} from '../../../utils';
import {SqlAttribute, SqlRuleStore} from '../SqlRuleStore';
import {RuleDef} from '../RuleDef';

export interface SingleSqlRuleComponentImplProps {
    candidates: SqlAttribute[];
    mainStore: SqlRuleStore;
    defaultRuleJson: SqlRuleJson; // 初始化用,后续如果props.defaultRuleJson改变也不会造成其他影响
    locale: Locales;
}

export function SingleSqlRuleComponentImpl(props: SingleSqlRuleComponentImplProps) {
    const [ready, setReady] = React.useState(false);
    const sqlRuleStore = props.mainStore;
    const rule = sqlRuleStore.rootRuleGroup.childs[0] as SqlRule;

    React.useEffect(() => {
        const simpleRuleDefMap = new Map<Locales, RuleDef>();
        simpleRuleDefMap.set(Locales.en, RuleDef.engSimpleInstance);
        simpleRuleDefMap.set(Locales.zh, RuleDef.chineseSimpleInstance);

        sqlRuleStore.setRuleDefs(simpleRuleDefMap);

        const rootGroup = sqlRuleStore.rootRuleGroup;
        const newRule = SqlRule.fromJson(props.defaultRuleJson, rootGroup);
        rootGroup.addChild(newRule);
        setReady(true);
    }, []);

    React.useEffect(() => {
        sqlRuleStore.setAttributeCandidates(props.candidates);
        if (rule) {
            rule.resetAll();
        }
    }, [props.candidates]);

    if (!ready) {
        return null;
    }

    return <SqlRuleComponentImpl
        rule={rule}
        mainStore={sqlRuleStore}
        locale={props.locale}/>;

}
