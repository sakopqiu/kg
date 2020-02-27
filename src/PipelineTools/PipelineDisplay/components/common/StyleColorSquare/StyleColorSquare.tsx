import * as React from 'react';
import './index.scss';
import classNames from 'classnames';

export interface StyleColorSquareProps {
    selected: boolean;
    color: string;
    onClick: (selected: boolean) => any;
}

export function StyleColorSquare(props: StyleColorSquareProps) {

    return (
        <div
            onClick={() => {
                props.onClick(props.selected);
            }}
            style={{backgroundColor: props.color}}
            className={classNames('style-color-square', {selected: props.selected})}/>
    );
}
