import React, {useCallback, useContext} from 'react';
import {FilterContext} from './FilterContext';
import './AttributeFilter.scss';
import {SophonSearch} from '../../../../../../components/SophonSearch';

export function AttributeFilter() {
    const [, setFilter] = useContext(FilterContext);
    const handleChange = useCallback((value: string) => {
        setFilter(value);
    }, []);
    return (
        <SophonSearch className='attribute-filter' onChange={handleChange} />
    );
}
