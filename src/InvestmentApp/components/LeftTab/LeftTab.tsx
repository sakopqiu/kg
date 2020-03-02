import * as React from 'react';
import './index.scss';
import {NavLink} from 'react-router-dom';

export interface LeftTabProps {
    selectedKey: string;
    onKeySelected: () => any;
}

export function LeftTab(props: Partial<LeftTabProps>) {
    return (
        <ul className='app-left-tab'>
            <li>
                <NavLink to='/data-query' exact className='route-link' activeClassName='active-link'>
                    数据查询
                </NavLink>
            </li>
            <li>
                <NavLink to='/investment-combination' className='route-link' activeClassName='active-link'>
                    投资组合
                </NavLink>
            </li>
        </ul>
    );
}
