import {baseInjectHook, BaseInjectHookProps} from '../../../../../business-related/utils';
import {CyState} from '../../../model/CyState';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import {CanvasDrawService} from '../../../service/CanvasDrawService';
import {DisplayModePipelineModel} from '../../../../../models/DisplayModePipelineModel';
import {NaiveColorManager} from '../../../color/NaiveColorManager';
import * as React from 'react';
import {DisplayModePipelineSchema} from '../../../interfaces';

export interface SuperSimpleDisplayCanvasProps extends BaseInjectHookProps {
    useCaseName: string; // 什么情况下使用只用作标记，任意传值即可
    className?: string;
    style?: React.CSSProperties;
    afterRendering: (mainStore: DisplayModeCanvasStore, isFirstTime: boolean) => any;
    schema: DisplayModePipelineSchema;
}

function SuperSimpleDisplayCanvasFunc(props: SuperSimpleDisplayCanvasProps) {
    const cyStateRef = React.useRef<CyState>();
    const mainStoreRef = React.useRef<DisplayModeCanvasStore>();
    const useCaseName = props.useCaseName;
    const containerId = useCaseName;

    // init method
    React.useEffect(() => {
        mainStoreRef.current = new DisplayModeCanvasStore();
        const mainStore = mainStoreRef.current;
        const pipeline = new DisplayModePipelineModel(useCaseName, useCaseName);
        mainStore.setDisplayModePipelineSchema(props.schema);
        mainStore.setDisplayPipeline(pipeline!);
        mainStore.canvasDrawService = new CanvasDrawService(mainStore, 'single', true, true,
            NaiveColorManager, '{}', {
                afterRendering: (store: DisplayModeCanvasStore, isFirstTime: boolean) => {
                    props.afterRendering(mainStore, isFirstTime);
                },
            }, containerId);
        cyStateRef.current = mainStore.canvasDrawService.cyState;

        return () => {
            if (mainStoreRef.current) {
                const autorunDisposer = mainStoreRef.current.canvasDrawService.autorunDisposer;
                if (autorunDisposer) {
                    autorunDisposer();
                }
            }
        };
    }, []);

    return (
        <div id={containerId} style={props.style || {}} className={props.className || ''}>
        </div>
    );

}

export const SuperSimpleDisplayCanvas = baseInjectHook(SuperSimpleDisplayCanvasFunc);
