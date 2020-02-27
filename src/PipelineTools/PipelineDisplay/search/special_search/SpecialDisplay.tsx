import * as React from 'react';
import {NaiveColorManager} from '../../color/NaiveColorManager';
import {DisplayModePipelineModel} from '../../../../models/DisplayModePipelineModel';
import {ISpecialDisplayModeContext} from '../../interfaces';
import {CanvasDrawService} from '../../service/CanvasDrawService';
import {observable, runInAction} from 'mobx';

export abstract class SpecialDisplay<T extends ISpecialDisplayModeContext = ISpecialDisplayModeContext, S= any>
    extends React.Component<T, S> {
    abstract get pipelineId(): string;

    abstract get containerId(): string;

    @observable protected mounted = false;

    public constructor(props: T) {
        super(props);
    }

    get mainStore() {
        return this.props.mainStore;
    }

    get locale() {
        return this.props.locale;
    }

    get cyState() {
        return this.props.mainStore.canvasDrawService && this.props.mainStore.canvasDrawService.cyState;
    }

    public async componentWillMount() {
        const pipeline = new DisplayModePipelineModel(this.pipelineId, this.pipelineId);
        const canvasStore = this.props.mainStore;
        canvasStore.setDisplayModePipelineSchema(this.props.pipelineSchema);
        canvasStore.setDisplayPipeline(pipeline!);
        canvasStore.canvasDrawService = new CanvasDrawService(canvasStore, 'single', true, true,
            NaiveColorManager, '{}', {
                afterRendering: this.props.afterRendering,
            }, this.containerId);
        runInAction(() => {
            this.mounted = true;
        });
    }
}
