import * as React from 'react';
import {fineTunePopupPosition} from '../CanvasDrawUtils';
import {CanvasDrawService} from '../service/CanvasDrawService';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../components/complex/ComplexModeCanvasComponent';

export class PositionHandler<T extends ComplexModeCanvasComponentProps = ComplexModeCanvasComponentProps, S= any> extends ComplexModeCanvasComponent<T, S> {
    ref = React.createRef<HTMLDivElement>();

    public componentDidUpdate() {
        if (this.ref.current) {
            fineTunePopupPosition(this.service, this.ref);
        }
    }

    public componentDidMount() {
        if (this.ref.current) {
            fineTunePopupPosition(this.service, this.ref);
        }
    }
}

export function usePositionHandlerHook(drawService: CanvasDrawService) {
    const ref = React.useRef<any>();
    React.useEffect(() => {
        fineTunePopupPosition(drawService, ref);
    }, []);
    return ref;
}
