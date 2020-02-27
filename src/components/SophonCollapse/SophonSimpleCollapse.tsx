import * as React from 'react';
import {ArrowDownIcon} from '../../icons/ArrowDownIcon';
import './simple.scss';
import className from 'classnames';

export interface SophonSimpleCollapseProps {
    header: React.ReactNode;
    children: React.ReactNode;
    arrowPosition: 'left-tick' | 'right-tick';
}

export function SophonSimpleCollapse(props: SophonSimpleCollapseProps) {

    const [collapse, setCollapse] = React.useState(true);
    const tickClass = props.arrowPosition;
    const arrowTick = <ArrowDownIcon
        className={className(`sophon-simple-collapse-header-tick ${tickClass}`, {collapse})}
        onClick={() => {
            setCollapse(!collapse);
        }}/>;

    return (
        <div className='sophon-simple-collapse'>
            <div className='sophon-simple-collapse-header'>
                {tickClass === 'left-tick' && arrowTick}
                <div className='sophon-simple-collapse-header-content'>
                    {props.header}
                </div>
                {tickClass === 'right-tick' && arrowTick}
            </div>
            {!collapse &&
            <div className='sophon-simple-collapse-body'>
                {props.children}
            </div>
            }
        </div>
    );

}
