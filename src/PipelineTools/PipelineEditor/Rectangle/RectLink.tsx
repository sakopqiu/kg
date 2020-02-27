import * as React from 'react';
import {editCanvasInject, svgInputY, svgOutputX, svgOutputY} from '../EditCanvasUtils';
import Line from '../components/Line';
import {PipelineLink} from '../../../models/LinkModel';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';

export interface IRectLinkProps extends IEditModeCanvasComponentProps {
    model: PipelineLink;
}

interface IRectLinkState {
    isOver: boolean;
}

@editCanvasInject
export class RectLink extends EditModeCanvasComponent<IRectLinkProps, IRectLinkState> {

    public render() {
        const link = this.props.model;
        const {opWidth, opHeight, cornerRadius} = this.canvasConfig.rectConfig!;
        const startX = svgOutputX(opWidth, link.output);
        const startY = svgOutputY(opHeight, link.output);

        const position = this.currentActiveStore!.inPortsPositions(link.input, opWidth, cornerRadius);
        const endX = link.input.x + position.get(link.id)!;
        const endY = svgInputY(link.input);

        return (
            <Line
                onMouseDown={(e) => {
                    const s = this.currentActiveStore!;
                    s.clearAllSelections();
                    if (e.button === 2) {
                        e.stopPropagation();
                        s.setShowLinkContextMenu(true);
                        s.setClickEventPosition({x: e.clientX, y: e.clientY});
                        s.setCurrentLink(this.props.model);
                    }
                }}
                error={link.checkFormFailed}
                type={2} x1={startX} y1={startY} x2={endX} y2={endY}/>
        );
    }
}
