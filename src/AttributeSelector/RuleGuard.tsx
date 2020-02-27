import * as React from 'react';
import {AttributeSelectorComponent} from './AttributeSelectorComponent';
import {IAttributeSelectorProps} from './index';
import {RuleBase} from '../models/Rules';
import './rule-guard.scss';
import classNames from 'classnames';
import {DropTargetMonitor, ConnectDropTarget, DropTarget, DropTargetConnector} from 'react-dnd';

export enum RuleGuardDirection {
    'UPPER' = 'UPPER',
    'LOWER' = 'LOWER',
    'FIRST_CHILD' = 'FIRST_CHILD',
}

export interface IRuleGuardProps extends IAttributeSelectorProps {
    ruleBase: RuleBase;
    direction: RuleGuardDirection;
    isHovered?: boolean;
    connectDropTarget?: ConnectDropTarget;
    dragSourceInfo?: any;
}

export class RuleGuardClass extends AttributeSelectorComponent<IRuleGuardProps> {
    public render() {
        let showCenterLine = this.props.isHovered;
        // 不显示自身的中央线
        if (showCenterLine) {
            const dragSource = this.props.dragSourceInfo;
            if (dragSource.type === 'RULE') {
                showCenterLine = dragSource.props.rule !== this.props.ruleBase;
            } else {
                showCenterLine = dragSource.props.ruleGroup !== this.props.ruleBase;
            }
        }

        const direction = this.props.direction;
        return this.props.connectDropTarget!(
            <div className={classNames('rule-guard', {
                'upper': direction === RuleGuardDirection.UPPER,
                'lower': direction === RuleGuardDirection.LOWER,
                'first-child': direction === RuleGuardDirection.FIRST_CHILD,
            })}>
                <div className={classNames('center-line', {visible: showCenterLine})}/>
            </div>,
        );
    }
}

const source = {
    canDrop() {
        return true;
    },
    drop(props: IRuleGuardProps, monitor: DropTargetMonitor, component: any) {
        return props;
    },
};

export const RuleGuard = DropTarget(['RULE_COMPONENT', 'RULE_COMPONENT_GROUP'], source, (connector: DropTargetConnector, monitor: DropTargetMonitor) => {
    return {
        connectDropTarget: connector.dropTarget(),
        isHovered: monitor.isOver(),
        dragSourceInfo: monitor.getItem(),
    };
})(RuleGuardClass);
