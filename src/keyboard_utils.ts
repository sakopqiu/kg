import _every from 'lodash/every';
import * as React from 'react';

export type MyKeyboardEvent = KeyboardEvent | React.KeyboardEvent;

export function controlPressed(e: MyKeyboardEvent) {
    return e.getModifierState('Control') || e.metaKey;
}

export function shiftPressed(e: MyKeyboardEvent) {
    return e.getModifierState('Shift') || e.shiftKey;
}

export function keyPressed(e: MyKeyboardEvent, key: string, caseSensitive?: boolean) {
    return (caseSensitive ? e.key : e.key.toLowerCase()) === key;
}

export function deletePressed(e: MyKeyboardEvent) {
    return e.key === 'Backspace' || e.key === 'Delete';
}

export function enterPressed(e: MyKeyboardEvent) {
    return e.key === 'Enter';
}

export function escapePressed(e: MyKeyboardEvent) {
    return e.key === 'Esc' || e.key === 'Escape';
}

export function altPressed(e: MyKeyboardEvent) {
    return e.key === 'Alt';
}

export function shortcut(e: MyKeyboardEvent, command: string, preventDefault: boolean = true, caseSensitive?: boolean) {
    const parts: string[] = command.split('+');
    const result = _every(parts, (part) => {
        part = caseSensitive ? part.trim() : part.toLowerCase().trim();
        if (part === 'ctrl') {
            return controlPressed(e);
        } else if (part === 'shift') {
            return shiftPressed(e);
        } else if ((part === 'delete' || part === 'backspace')) {
            return deletePressed(e);
        } else if (part === 'esc') {
            return escapePressed(e);
        } else if (part === 'alt') {
            return altPressed(e);
        } else if (part === 'enter') {
            return enterPressed(e);
        } else if (part.length === 1) {// match single character
            return keyPressed(e, part, caseSensitive);
        } else {
            return false;
        }
    });
    if (result) {
        if (preventDefault && e.preventDefault) {
            e.preventDefault();
        }
    }
    return result;
}
