import * as React from 'react';
import {ISpecialDisplayModeContext} from '../../interfaces';
import {CanvasDrawService} from '../../service/CanvasDrawService';
import {CyState} from '../../model/CyState';

export interface ISpecialSearchDisplayModeCanvasComponentProps {
    canvasConfig?: ISpecialDisplayModeContext;
}

export class SpecialSearchDisplayModeCanvasComponent<T extends ISpecialSearchDisplayModeCanvasComponentProps = ISpecialSearchDisplayModeCanvasComponentProps, S= any> extends React.Component<T, S> {

    get canvasConfig(): ISpecialDisplayModeContext {
        return this.props.canvasConfig!;
    }

    get mainStore() {
        return this.canvasConfig.mainStore;
    }

    get locale() {
        return this.canvasConfig.locale;
    }

    get cy() {
        return this.service.cy;
    }

    get service(): CanvasDrawService {
        return this.mainStore!.canvasDrawService;
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

    get statusService() {
        return this.service.statusService;
    }

    get stateService() {
        return this.service.stateService;
    }

}
