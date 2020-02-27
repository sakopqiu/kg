import {drawWhat} from '../EditCanvasUtils';
import {DrawWhat, IEditModeContext} from '../interfaces';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import {CanvasComponent, ICanvasComponentProps} from '../../common/CanvasComponent';
import {EditModeCanvasTabStore} from '../stores/EditModeCanvasTabStore';
import {action} from 'mobx';
import {removeSelected} from '../cyto/cyto-utils';
import {identityFunc} from '../../../utils';

export interface IEditModeCanvasComponentProps extends ICanvasComponentProps {
    canvasConfig?: IEditModeContext;
}

export class EditModeCanvasComponent<T extends IEditModeCanvasComponentProps = IEditModeCanvasComponentProps, S = {},
    ST extends EditModeCanvasStore = EditModeCanvasStore> extends CanvasComponent<T, S, ST> {

    get canvasConfig(): IEditModeContext {
        return this.props.canvasConfig!;
    }

    get mainStore(): EditModeCanvasTabStore<ST> {
        return this.canvasConfig.mainStore as EditModeCanvasTabStore<ST>;
    }

    get currentActiveStore(): EditModeCanvasStore | null {
        return this.mainStore.currentActiveStore as (EditModeCanvasStore | null);
    }

    get drawType(): DrawWhat {
        return drawWhat(this.canvasConfig);
    }

    get drawCircle(): boolean {
        return this.drawType === DrawWhat.DRAW_CIRCLE;
    }

    get drawRect(): boolean {
        return this.drawType === DrawWhat.DRAW_RECT;
    }

    public throwShapeNotSupported() {
        return new Error(`shape ${this.drawType} is not supported`);
    }

    @action
    protected removeSelected = (e: any) => {
        removeSelected(this.mainStore);
    }

    get fieldAlias() {
        return this.canvasConfig.fieldAlias || identityFunc;
    }
}
