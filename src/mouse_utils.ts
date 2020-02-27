import * as React from 'react';

export function isLeftButton(e: MouseEvent | React.MouseEvent) {
    return e.button === 0;
}

export function isRightButton(e: MouseEvent | React.MouseEvent) {
    return e.button === 2;
}
