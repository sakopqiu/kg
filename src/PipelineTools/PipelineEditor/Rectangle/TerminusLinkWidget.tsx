import * as React from 'react';
import {TerminusLink} from '../../../models/LinkModel';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import {svgOutputX, svgOutputY} from '../EditCanvasUtils';
import Line from '../components/Line';
import {observer} from 'mobx-react-lite';

export interface TerminusLinkProps {
    link: TerminusLink;
    mainStore: EditModeCanvasStore;
}

function TerminusLinkWidgetFunc(props: TerminusLinkProps) {
    const link = props.link;
    const mainStore = props.mainStore;
    const {opWidth, opHeight} = mainStore.parent.canvasConfig.rectConfig!;
    const startX = svgOutputX(opWidth, link.output);
    const startY = svgOutputY(opHeight, link.output);

    const terminusPosition = mainStore.terminusPositionFor(link.input);
    if (!terminusPosition) {
        return null; // 界面还未完成加载的时候
    }

    return (
        <Line
            onMouseDown={(e) => {
                mainStore.clearAllSelections();
                if (e.button === 2) {
                    e.stopPropagation();
                    mainStore.setShowTerminusLinkContextMenu(true);
                    mainStore.setCurrentTerminusLink(link);
                    mainStore.setClickEventPosition({x: e.clientX, y: e.clientY});
                }
            }}
            type={2} x1={startX} y1={startY} x2={terminusPosition.x} y2={terminusPosition.y}/>
    );
}

export const TerminusLinkWidget = observer(TerminusLinkWidgetFunc);
