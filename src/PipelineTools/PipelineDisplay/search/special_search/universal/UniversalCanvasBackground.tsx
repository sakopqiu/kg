import * as React from 'react';
import '../../canvas.scss';
import {SpecialBackground} from '../SpecialBackground';
import {universalInject} from '../../../DisplayCanvasUtils';
import {CytoMiniMap} from '../../../components/common/CytoMiniMap/index';
import {TargetedLoading} from '../../../../../components/TargetedLoading';
import {getTranslation} from '../../../../../utils';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';

@universalInject
export class UniversalCanvasBackground extends SpecialBackground {
    public render() {
        return (
            <div style={{height: 'calc(100% - 40px)'}}
                 className='canvas-background pipeline-background universal-canvas-background'>
                <div id='universal-cyto-container'>
                </div>
                {<CytoMiniMap locale={this.locale} currentActiveStore={this.mainStore}/>}
                <TargetedLoading
                    noBackground
                    message={getTranslation(this.locale, 'Layouting Canvas')}
                    loadingTarget={LoadingTargets.CANVAS_LAYOUT} store={this.mainStore}/>
            </div>
        );
    }

}
