import {ISimpleDisplayModeContext} from '../../../interfaces';
import {SpecialSearchDisplayModeCanvasComponent} from '../SpecialSearchDisplayModeCanvasComponent';

export interface ISimpleDisplayModeCanvasComponentProps {
    canvasConfig?: ISimpleDisplayModeContext;
}

export class SimpleDisplayModeCanvasComponent<T extends ISimpleDisplayModeCanvasComponentProps = ISimpleDisplayModeCanvasComponentProps, S= any>
    extends SpecialSearchDisplayModeCanvasComponent<T, S> {
    get canvasConfig(): ISimpleDisplayModeContext {
        return this.props.canvasConfig!;
    }
}
