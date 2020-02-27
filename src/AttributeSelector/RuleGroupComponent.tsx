import * as React from 'react';
import {AndOr, Rule, RuleGroup} from '../models/Rules';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import {getTranslation, Locales} from '../utils';
import {AttributeSelectorComponent} from './AttributeSelectorComponent';
import {observer} from 'mobx-react';
import classNames from 'classnames';
import './rule-group.scss';
import {DragAndDropIcon} from '../icons/DragAndDropIcon';
import {IAttributeSelectorProps} from './index';
import {RuleComponent, RuleComponentClass} from './RuleComponent';
import * as ReactDOM from 'react-dom';
import {computed} from 'mobx';
import {DeleteIcon} from '../icons/DeleteIcon';
import {RuleGuard, RuleGuardDirection} from './RuleGuard';
import {DragSourceConnector, DragSourceMonitor, DragSource} from 'react-dnd';
import {AttributeSelectorStore} from '../stores/AttributeSelectorStore';

export interface IRuleGroupComponentProps<T extends Rule = Rule, RT extends RuleGroup = RuleGroup> extends IAttributeSelectorProps {
    ruleGroup: RuleGroup;
    mainStore: AttributeSelectorStore<T, RT>;
    owner?: RuleGroupComponentClass;
}

const source = {
    beginDrag(props: IRuleGroupComponentProps) {
        return {
            props,
            type: 'RULE_GROUP',
        };
    },

    endDrag(props: IRuleGroupComponentProps, monitor: DragSourceMonitor) {
        const dropResult: any = monitor.getDropResult();
        if (dropResult && dropResult.ruleBase) {
            const direction = dropResult.direction;
            const sourceObj = props.ruleGroup;
            sourceObj.move(dropResult.ruleBase, direction);
        }
    },
};

export class RuleGroupComponentClass extends AttributeSelectorComponent<IRuleGroupComponentProps> {

    private andOrButtonRef: React.RefObject<AndOrButton> = React.createRef();
    private firstChildRef: React.RefObject<RuleComponentClass | RuleGroupComponentClass> = React.createRef();
    private lastChildRef: React.RefObject<RuleComponentClass | RuleGroupComponentClass> = React.createRef();
    private currentRef: HTMLDivElement;

    constructor(props: IRuleGroupComponentProps) {
        super(props);
        this.addGroup = this.addGroup.bind(this);
        this.addRule = this.addRule.bind(this);
        this.remove = this.remove.bind(this);
        this.setRef = this.setRef.bind(this);
    }

    get group() {
        return this.props.ruleGroup;
    }

    private setRef(ref: HTMLDivElement) {
        this.currentRef = ref;
    }

    private remove() {
        this.group.remove();
        if (this.props.callbacks && this.props.callbacks.onRuleGroupRemoved) {
            this.props.callbacks.onRuleGroupRemoved(this.group);
        }
    }

    private addGroup() {
        const newRuleGroup = new this.RuleGroupFunc(this.group, this.props.mainStore);
        this.group.addChild(newRuleGroup);
        if (this.props.callbacks && this.props.callbacks.onRuleGroupAdded) {
            this.props.callbacks.onRuleGroupAdded(newRuleGroup);
        }
    }

    private addRule() {
        const newRule = new this.RuleFunc(this.group, this.props.mainStore);
        this.group.addChild(newRule);
        if (this.props.callbacks && this.props.callbacks.onRuleAdded) {
            this.props.callbacks.onRuleAdded(newRule);
        }
    }

    @computed
    get childrenCount() {
        return this.group.ruleChildren.length;
    }

    get locale() {
        return this.props.locale;
    }

    private groupHeader() {
        const g = this.props.ruleGroup;
        return (
            <div className='rule-group-header'>
                <div className='left'>
                    {!g.isRoot ? this.props.connectDragSource!(
                        <span><DragAndDropIcon className='drag-handle'/></span>) : null}
                    {g.isEmpty ? (this.props.placeholder ? this.props.placeholder : getTranslation(this.locale, 'Add Rule Hint')) : ''}
                </div>
                <div className='right'>
                    <Button type={'primary'} onClick={this.addRule}><Icon type='plus'/> {getTranslation(this.locale, 'New Rule')}
                    </Button>
                    {
                        !this.props.hideAddGroupBtn && <Button type={'primary'} onClick={this.addGroup}><Icon type='plus'/> {getTranslation(this.locale, 'New Rule Group')}</Button>
                    }
                    {!g.isRoot ? <DeleteIcon onClick={this.remove} className='delete-icon'/> : null}
                </div>
            </div>
        );
    }

    private getEleOffset(ele: Element): number {
        const isGroup = ele.classList.contains('attribute-rule-group');
        if (isGroup) {
            return 25;
        } else {
            return 13;
        }
    }

    get RuleFunc() {
        return this.props.mainStore.RuleFunc;
    }

    get RuleGroupFunc() {
        return this.props.mainStore.RuleGroupFunc;
    }

    private resetAndOrPosition() {
        if (!this.currentRef) {
            return;
        }
        const firstChild = ReactDOM.findDOMNode(this.firstChildRef.current!) as Element;
        const lastChild = ReactDOM.findDOMNode(this.lastChildRef.current!) as Element;
        const currentDiv = ReactDOM.findDOMNode(this.currentRef!) as Element;
        if (firstChild && lastChild) {
            const bounding1 = firstChild.getBoundingClientRect();
            const bounding2 = lastChild.getBoundingClientRect();
            const currentDivBounding = currentDiv.getBoundingClientRect();

            // 下方的-10都是减去andOrButton的半径
            const x = bounding1.left - currentDivBounding.left - 21 - 10;
            const y = ((bounding1.top - currentDivBounding.top + this.getEleOffset(firstChild))
                + (bounding2.top - currentDivBounding.top + this.getEleOffset(lastChild))) / 2 - 10;

            const andOrButton = ReactDOM.findDOMNode(this.andOrButtonRef.current!) as HTMLDivElement;
            andOrButton.style.left = x + 'px';
            andOrButton.style.top = y + 'px';
        }
        if (this.props.owner) {
            this.props.owner.resetAndOrPosition();
        }
    }

    componentDidUpdate() {
        setTimeout(() => {
            this.resetAndOrPosition();
        });
    }

    componentDidMount() {
        setTimeout(() => {
            this.resetAndOrPosition();
        });
    }

    private renderChildren() {
        const result: React.ReactNode[] = [];
        let i = 0;
        const totalChildrenCount = this.childrenCount;
        for (const c of this.group.ruleChildren) {
            const className = '';

            let firstChildRefAttr = {};
            let lastChildRefAttr = {};
            if (totalChildrenCount > 1 && i === 0) {
                firstChildRefAttr = {
                    ref: this.firstChildRef,
                };
            }
            if (totalChildrenCount > 1 && i === totalChildrenCount - 1) {
                lastChildRefAttr = {
                    ref: this.lastChildRef,
                };
            }
            i++;

            if (c instanceof RuleGroup) {
                result.push(<RuleGroupComponent
                    key={c.id}
                    {...this.props} ruleGroup={c} className={className}
                    {...firstChildRefAttr} {...lastChildRefAttr} owner={this}/>);
            } else if (c instanceof Rule) {
                result.push(<RuleComponent
                    key={c.id}
                    {...this.props} rule={c} className={className}
                    {...firstChildRefAttr} {...lastChildRefAttr}/>);
            }
        }
        if (totalChildrenCount === 0) {
            result.push(<RuleGuard key={'first-child-rule-guard'}  {...this.props} {...{
                direction: RuleGuardDirection.FIRST_CHILD,
                ruleBase: this.group,
            }}/>);
        }
        return result;
    }

    public render() {
        const group = this.props.ruleGroup;
        // with-outline只有在非根组节点时才显示外层的线
        return this.props.connectDragPreview!(<div
            ref={this.setRef as any}
            className={classNames('attribute-rule-group', this.props.className || '',
                {
                    'not-root': !group.isRoot,
                    'with-upward-outline': group.hasUpwardOutline,
                    'with-downward-outline': group.hasDownwardOutline,
                })}
            style={{backgroundColor: group.backgroundColor}}
        >
            {!group.isRoot && group.isFirstChild ?
                <RuleGuard  {...this.props} {...{direction: RuleGuardDirection.UPPER, ruleBase: group}}/> : null
            }
            {this.groupHeader()}
            {this.renderChildren()}
            {this.childrenCount > 1
                ? <AndOrButton locale={this.props.locale} ref={this.andOrButtonRef} ruleGroup={this.group}/>
                : null}
            {!group.isRoot ?
                <RuleGuard {...this.props} {...{direction: RuleGuardDirection.LOWER, ruleBase: group}}/> : null
            }
        </div>);
    }
}

export const RuleGroupComponent = DragSource('RULE_COMPONENT_GROUP', source, (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
        connectDragPreview: connect.dragPreview(),
    };
})(observer(RuleGroupComponentClass));

interface IAndOrButtonProps {
    ruleGroup: RuleGroup;
    locale: Locales;
}

@observer
class AndOrButton extends AttributeSelectorComponent<IAndOrButtonProps> {

    constructor(props: IAndOrButtonProps) {
        super(props);
        this.flip = this.flip.bind(this);
    }

    private flip() {
        this.props.ruleGroup.flip();
    }

    public render() {
        const isAnd = this.props.ruleGroup.andOr === AndOr.AND;
        return (
            <div className='and-or' onClick={this.flip}>
                {
                    isAnd ? getTranslation(this.props.locale, 'And') :
                    getTranslation(this.props.locale, 'Or')}
            </div>
        );
    }
}
