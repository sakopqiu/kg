import * as React from 'react';
import '../../canvas.scss';
import {simpleInject} from '../../../DisplayCanvasUtils';
import {getTranslation} from '../../../../../utils';
import SimpleCanvasContextMenu from '../../../context_menu/SimpleCanvasContextMenu';
import {SearchModal} from '../../../components/common/SearchModal/index';
import {TargetedLoading} from '../../../../../components/TargetedLoading';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import {SpecialBackground} from '../SpecialBackground';
import {ContainerId} from '../../../interfaces';
import {CytoMiniMap} from '../../../components/common/CytoMiniMap/index';
import {FindPathResultModal} from '../../../components/common/FindPathResultModal/FindPathResultModal';

@simpleInject
export class SimpleCanvasBackground extends SpecialBackground {
    public render() {
        return (
            <div style={{height: 'calc(100% - 40px)'}}
                 className='canvas-background pipeline-background simple-canvas-background'>
                <div id={ContainerId.simple}>
                </div>
                <SimpleCanvasContextMenu mainStore={this.mainStore}/>

                {this.stateService.showSearchBox && <SearchModal locale={this.locale} currentActiveStore={this.mainStore} style={{top: 42, left: 10}}/>}
                {<CytoMiniMap locale={this.locale} currentActiveStore={this.mainStore}/>}
                {this.service.stateService.showFindPathResultModal &&
                <FindPathResultModal locale={this.locale} parentCyState={this.cyState}
                                     schema={this.mainStore.displayModePipelineSchema}
                />}

                <TargetedLoading
                    noBackground
                    message={getTranslation(this.locale, 'Layouting Canvas')}
                    loadingTarget={LoadingTargets.CANVAS_LAYOUT} store={this.mainStore}/>
                <TargetedLoading
                    message={getTranslation(this.locale, 'Adding Elements')}
                    loadingTarget={LoadingTargets.ADD_ELEMENTS} store={this.mainStore}/>
            </div>
        );
    }

}
