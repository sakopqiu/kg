import * as React from 'react';
import './index.scss';
import AddAction from '../../../../../../images/diff/addAction.jpg';
import EditAction from '../../../../../../images/diff/editAction.jpg';
import DeleteAction from '../../../../../../images/diff/deleteAction.jpg';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../../ComplexModeCanvasComponent';
import {getTranslation} from '../../../../../../utils';

@complexInject
export class DiffLegend extends ComplexModeCanvasComponent {
    public render() {
        return (
            <div className='diff-legend'>
                            <span className='diff-legend-item'>
                                <img className='legend-icon added' src={AddAction}/>
                                {getTranslation(this.locale, 'Added')}
                            </span>
                <span className='diff-legend-item'>
                                <img className='legend-icon edited' src={EditAction}/>
                    {getTranslation(this.locale, 'Edited')}
                            </span>
                <span className='diff-legend-item'>
                                <img className='legend-icon deleted' src={DeleteAction}/>
                    {getTranslation(this.locale, 'Deleted')}
                            </span>
            </div>
        );
    }
}
