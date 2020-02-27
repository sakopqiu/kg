import * as React from 'react';
import './index.scss';
import {observer} from 'mobx-react-lite';
import {StatsAnalysisStore} from './StatsAnalysisStore';
import {LeftFilter} from './LeftFilter/LeftFilter';
import {identityFunc, Locales} from '../../../utils';
import {RightTable} from './RightTable/RightTable';
import {StatsAnalysisContext} from './interface';

export interface StatsAnalysisProps {
    store: StatsAnalysisStore;
    locale: Locales;
    fieldsAlias?: (val: string) => string;
}

function StatsAnalysisFunc(props: StatsAnalysisProps) {

    return (
        <div className='stats-analysis'>
            <StatsAnalysisContext.Provider value={{
                fieldsAlias: props.fieldsAlias || identityFunc,
            }}>
                <LeftFilter store={props.store} locale={props.locale}/>
                <RightTable store={props.store} locale={props.locale}/>
            </StatsAnalysisContext.Provider>
        </div>

    );

}

export const StatsAnalysis = observer(StatsAnalysisFunc);
