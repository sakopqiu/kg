import * as React from 'react';
import {AppHeader} from './AppHeader/AppHeader';
import DataQuery from './DataQuery/DataQuery';
import {LeftTab} from './LeftTab/LeftTab';
import {Router, Route, Redirect, Switch} from 'react-router-dom';
import {InvestmentCombination} from './InvestmentCombination/InvestmentCombination';
import ReactDom from 'react-dom';
import {HISTORY} from '../../utils';

const style = {width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as any};

export function InvestmentApp() {

    return (
        <div style={style}>
            <Router history={HISTORY}>
                <AppHeader/>
                <div style={{display: 'flex', width: '100%', flex: 1}}>
                    <LeftTab/>
                    <div style={{flex: 1}}>
                        <Switch>
                            <Route path='/data-query' component={DataQuery}/>
                            <Route path='/investment-combination' component={InvestmentCombination}/>
                            <Redirect to='/data-query'/>
                        </Switch>
                    </div>
                </div>
            </Router>
        </div>
    );

}

ReactDom.render(<InvestmentApp/>, document.getElementById('root'));
