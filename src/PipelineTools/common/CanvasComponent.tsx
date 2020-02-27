import * as React from 'react';
import {CanvasTabStore} from './CanvasTabStore';
import {CanvasStore} from './CanvasStore';
import {ICanvasContextCommon} from './interfaces';

export interface ICanvasComponentProps {
    canvasConfig?: ICanvasContextCommon;
    forwardedRef?: any;
}

// 带有tabs的复杂查询或者编辑的流程图的某个子组件的抽象
export abstract class CanvasComponent<T extends ICanvasComponentProps = ICanvasComponentProps, S = {},
    ST extends CanvasStore = CanvasStore> extends React.Component<T, S, ST> {

    abstract get mainStore(): CanvasTabStore<ST>;

    abstract get currentActiveStore(): CanvasStore | null;

    abstract get canvasConfig(): ICanvasContextCommon;

    get locale() {
        return this.canvasConfig.locale;
    }
}
