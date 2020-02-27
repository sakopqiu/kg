import {SophonMiniMap} from '../../../../../components/SophonMiniMap/index';
import React from 'react';
import {CYTO_MINIMAP_HEIGHT} from '../../../service/MiniMapService';
import {CYTO_MAX_ZOOM, CYTO_MIN_ZOOM} from '../../../../../utils';
import {TargetedLoading} from '../../../../../components/TargetedLoading';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import {observer} from 'mobx-react';
import {CommonPipelineDisplayComponent} from '../CommonPipelineDisplayComponent';

@observer
export class CytoMiniMap extends CommonPipelineDisplayComponent {
    get minZoom() {
        return this.miniMapService.canvasFitExpectedZoom() / CYTO_MAX_ZOOM;
    }

    get maxZoom() {
        return this.miniMapService.canvasFitExpectedZoom() / CYTO_MIN_ZOOM;
    }

    public render() {
        return (
            this.miniMapService.miniMapVisible ?
                <SophonMiniMap
                    miniMapClassName={'cyto-minimap'}
                    onChange={this.miniMapService.handleMiniMapChange}
                    miniMapHeight={CYTO_MINIMAP_HEIGHT}
                    miniMapWidth={this.miniMapService.miniMapWidth}
                    rectMeta={this.miniMapService.miniMapRectMeta}
                    minZoom={this.minZoom}
                    maxZoom={this.maxZoom}
                    onClose={this.handleClose}
                >
                    <TargetedLoading backgroundPosition='absolute' store={this.currentActiveStore}
                                     loadingTarget={LoadingTargets.LOADING_MINI_MAP}/>
                </SophonMiniMap> : null
        );
    }

    private handleClose = () => {
        this.miniMapService.setMiniMapVisible(false);
        this.miniMapService.dispose();
    }
}
