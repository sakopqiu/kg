import * as React from 'react';
import {observer} from 'mobx-react';
import {AttributeSelectorComponent} from './AttributeSelectorComponent';
import {IRuleComponentProps} from './index';
import './rule.scss';
import {DragAndDropIcon} from '../icons/DragAndDropIcon';
import classNames from 'classnames';
import {DeleteIcon} from '../icons/DeleteIcon';
import {DragSourceMonitor, DragSource, DragSourceConnector} from 'react-dnd';
import {RuleGuard, RuleGuardDirection} from './RuleGuard';

export class RuleComponentClass extends AttributeSelectorComponent<IRuleComponentProps> {

    constructor(props: IRuleComponentProps) {
        super(props);
        this.remove = this.remove.bind(this);
    }

    get rule() {
        return this.props.rule;
    }

    private remove() {
        this.rule.remove();
        if (this.props.callbacks && this.props.callbacks.onRuleRemoved) {
            this.props.callbacks.onRuleRemoved(this.rule);
        }
    }

    public render() {
        const RuleComponentBody = this.props.ruleComponentImpl;
        const rule = this.rule;
        return this.props.connectDragPreview!(
            <div className={classNames('rule-wrapper', this.props.className || '',
                {
                    'with-upward-outline': rule.hasUpwardOutline,
                    'with-downward-outline': rule.hasDownwardOutline,
                })}
            >
                {rule.isFirstChild ?
                    <RuleGuard  {...this.props} {...{direction: RuleGuardDirection.UPPER, ruleBase: rule}}/> : null
                }
                {
                    !this.props.hideDrag ? (
                        <div className='left'>
                            {this.props.connectDragSource!(<span><DragAndDropIcon className='drag-handle'/></span>)}
                        </div>
                    ) : null
                }
                <div className='right'>
                    <RuleComponentBody {...this.props}/>
                    <DeleteIcon onClick={this.remove} className='delete-icon'/>
                </div>
                <RuleGuard  {...this.props} {...{direction: RuleGuardDirection.LOWER, ruleBase: rule}}/>
            </div>,
        );
    }
}

const source = {
    beginDrag(props: IRuleComponentProps) {
        return {
            props,
            type: 'RULE',
        };
    },

    endDrag(props: IRuleComponentProps, monitor: DragSourceMonitor) {
        const dropResult: any = monitor.getDropResult();
        if (dropResult && dropResult.ruleBase) {
            const direction = dropResult.direction;
            const sourceObj = props.rule;
            sourceObj.move(dropResult.ruleBase, direction);
        }
    },
};

export const RuleComponent = DragSource('RULE_COMPONENT', source, (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
        connectDragPreview: connect.dragPreview(),
    };
})(observer(RuleComponentClass));
