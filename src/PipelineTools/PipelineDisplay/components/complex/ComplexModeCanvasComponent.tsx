import {CanvasComponent, ICanvasComponentProps} from '../../../common/CanvasComponent';
import {DisplayModeCanvasTabStore} from '../../stores/DisplayModeCanvasTabStore';
import {DisplayModeCanvasStore} from '../../stores/DisplayModeCanvasStore';
import {CanvasDrawService} from '../../service/CanvasDrawService';
import {IDisplayModeContext} from '../../interfaces';
import {CyState} from '../../model/CyState';
import {StatusService} from '../../service/StatusService';
import {TimeFilterService} from '../../service/TimeFilterService';
import {StateService} from '../../service/StateService';
import {AlgorithmService} from '../../service/AlgorithmService';
import {ElementService} from '../../service/ElementService';
import {identityFunc} from '../../../../utils';

// 专属于复杂界面的组件的共同父类，复杂界面存在tab，所以mainStore对应tabStore，currentActiveStore对应当前选中store
export interface ComplexModeCanvasComponentProps extends ICanvasComponentProps {
    canvasConfig?: IDisplayModeContext;
}

export class ComplexModeCanvasComponent<T extends ComplexModeCanvasComponentProps = ComplexModeCanvasComponentProps, S = {},
    ST extends DisplayModeCanvasStore = DisplayModeCanvasStore> extends CanvasComponent<T, S, ST> {

    get canvasConfig(): IDisplayModeContext {
        return this.props.canvasConfig!;
    }

    get mainStore(): DisplayModeCanvasTabStore<ST> {
        return this.canvasConfig.mainStore as any;
    }

    get currentActiveStore(): DisplayModeCanvasStore | null {
        return this.mainStore.currentActiveStore as (DisplayModeCanvasStore | null);
    }

    get cy() {
        return this.service.cy;
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

    get elementService(): ElementService {
        return this.service.elementService;
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

    get fieldAlias() {
        return this.canvasConfig.fieldAlias || identityFunc;
    }
}
