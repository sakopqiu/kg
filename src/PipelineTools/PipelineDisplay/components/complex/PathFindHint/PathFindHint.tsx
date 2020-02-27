import * as React from 'react';
import './index.scss';
import {complexInject} from '../../../DisplayCanvasUtils';
import {ComplexModeCanvasComponent} from '../ComplexModeCanvasComponent';
import {getTranslation} from '../../../../../utils';

@complexInject
export class PathFindHint extends ComplexModeCanvasComponent {
    public render() {
        const s = this.stateService.elementService;
        const {x, y} = s.blazerPosition;
        return (
            <div className='path-find-hint' style={{left: x + 5, top: y + 5}}>
                {getTranslation(this.locale, 'Click to choose two entities')}
            </div>
        );
    }
}
