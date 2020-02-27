import * as React from 'react';
import './index.scss';

export interface BranchBreadCrumbProps {
    onBackClicked: () => any;
    parent: string;
    name: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

export const BranchBreadCrumb = React.memo(function (props: BranchBreadCrumbProps) {
    return (
        <div className={`pipelinetool-display-breadcrumb ${props.className || ''}`} style={props.style || {}}>
                <span onClick={props.onBackClicked}
                      className='pipelinetool-display-breadcrumb-highlight'>{props.parent}</span>
            /
            {props.name}
            {props.children}
        </div>
    );
});
