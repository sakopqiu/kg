import * as React from 'react';
import {AttributeSelectorStore} from '../stores/AttributeSelectorStore';
import './index.scss';
import {RuleGroupComponent} from './RuleGroupComponent';
import {AttributeSelectorComponent} from './AttributeSelectorComponent';
import {observer} from 'mobx-react';
import {ConnectDragSource, DragSourceMonitor, ConnectDragPreview} from 'react-dnd';
import {Rule} from '../models/Rules';
import {Locales} from '../utils';
import {RuleGroup} from '../models/Rules';

export interface IAttributeSelectorProps<T extends Rule= Rule> {
    mainStore: AttributeSelectorStore<T>;
    locale: Locales;
    style?: React.CSSProperties;
    className?: string;
    // 规则组件是可插拔的
    ruleComponentImpl: React.ComponentClass<IRuleComponentImplProps>;
    connectDragSource?: ConnectDragSource;
    monitor?: DragSourceMonitor;
    connectDragPreview?: ConnectDragPreview;
    hideAddGroupBtn?: boolean;
    hideDrag?: boolean;
    placeholder?: React.ReactNode;
    callbacks?: {
        onRuleAdded?: (newRule: Rule) => void;
        onRuleGroupAdded?: (newRuleGroup: RuleGroup) => void;
        onRuleRemoved?: (victim: Rule) => void;
        onRuleGroupRemoved?: (victim: RuleGroup) => void;
    };
}

// 一个RuleComponent包括一个可以拖拽的handle，以及内部具体的组件，具体组件城作为RuleImpl，即规则的实现组件
export interface IRuleComponentProps extends IAttributeSelectorProps {
    rule: Rule;
}

export interface IRuleComponentImplProps<R extends Rule = Rule, RG extends RuleGroup = RuleGroup> {
    rule: Rule;
    timestampFormat?: string; // 当类型是timestamp时的format
    dateFormat?: string; // 当类型是date时的format
    mainStore: AttributeSelectorStore<R, RG>;
    locale: Locales;
}

@observer
export class AttributeSelector extends AttributeSelectorComponent<IAttributeSelectorProps> {

    get s() {
        return this.props.mainStore;
    }

    public render() {

        return (
            <div className={`attribute-selector ${this.props.className || ''}`} style={this.props.style}>
                <RuleGroupComponent ruleGroup={this.s.rootRuleGroup} {...this.props}/>
            </div>
        );
    }
}
