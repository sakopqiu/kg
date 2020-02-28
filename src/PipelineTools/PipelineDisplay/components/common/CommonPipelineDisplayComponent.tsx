import {DisplayModeCanvasStore} from '../../stores/DisplayModeCanvasStore';
import {CanvasDrawService} from '../../service/CanvasDrawService';
import {CyState} from '../../model/CyState';
import {StatusService} from '../../service/StatusService';
import {TimeFilterService} from '../../service/TimeFilterService';
import {StateService} from '../../service/StateService';
import {AlgorithmService} from '../../service/AlgorithmService';
import {Locales} from '../../../../utils';
import * as React from 'react';

// 复杂或者特殊查询界面共有的组件
export interface CommonPipelineDisplayComponentProps {
    currentActiveStore: DisplayModeCanvasStore;
    locale: Locales;
}

export class CommonPipelineDisplayComponent<T extends CommonPipelineDisplayComponentProps = CommonPipelineDisplayComponentProps, S = {}>
    extends React.Component<T, S> {

    get currentActiveStore(): DisplayModeCanvasStore {
        return this.props.currentActiveStore;
    }

    get cy() {
        return this.service.cy;
    }

    get locale() {
        return this.props.locale;
    }

    get service(): CanvasDrawService {
        return this.currentActiveStore!.canvasDrawService;
    }

    get stateService(): StateService {
        return this.service.stateService;
    }

    get statService() {
        return this.service.statsService;
    }

    get algoService(): AlgorithmService {
        return this.service.algoService;
    }

    get miniMapService() {
        return this.service.miniMapService;
    }

    get timeFilterService(): TimeFilterService {
        return this.service.timeFilterService;
    }

    get statusService(): StatusService {
        return this.service.statusService;
    }

    get cyState(): CyState {
        return this.service!.cyState;
    }

    get helperService() {
        return this.service.helperService;
    }

    get selectionService() {
        return this.service.selectionService;
    }

    get visibilityService() {
        return this.service.visibilityService;
    }

}
