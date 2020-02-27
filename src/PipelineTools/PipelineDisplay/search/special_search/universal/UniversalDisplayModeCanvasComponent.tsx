import {IUniversalDisplayModeContext} from '../../../interfaces';
import {SpecialSearchDisplayModeCanvasComponent} from '../SpecialSearchDisplayModeCanvasComponent';

export interface IUniversalDisplayModeCanvasComponentProps {
    canvasConfig?: IUniversalDisplayModeContext;
}

export class UniversalDisplayModeCanvasComponent<T extends IUniversalDisplayModeCanvasComponentProps = IUniversalDisplayModeCanvasComponentProps, S= any>
    extends SpecialSearchDisplayModeCanvasComponent<T, S> {

    get canvasConfig(): IUniversalDisplayModeContext {
        return this.props.canvasConfig!;
    }
}
