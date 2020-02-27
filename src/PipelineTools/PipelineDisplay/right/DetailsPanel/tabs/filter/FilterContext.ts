import React, {Dispatch, SetStateAction} from 'react';

// @ts-ignore
export const FilterContext = React.createContext<[string, Dispatch<SetStateAction<string>>]>();

export function matchFilter(source: any, pattern: string) {
    return !pattern || source.toString().trim().toLowerCase().indexOf(pattern.trim().toLowerCase()) >= 0;
}
