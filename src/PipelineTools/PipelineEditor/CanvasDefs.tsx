import * as React from 'react';
import {editCanvasInject} from './EditCanvasUtils';
import {EditModeCanvasComponent} from './components/EditModeCanvasComponent';

@editCanvasInject
export class CanvasDefs extends EditModeCanvasComponent {
    private circleDefs() {
        if (this.canvasConfig.circleConfig) {
            const radius = this.canvasConfig.circleConfig!.circleRadius;
            return [
                <marker
                    key='arrow-linked-for-circle'
                    id='arrow-linked-for-circle' markerWidth='9' markerHeight='9' refX={radius + 9} refY='4.5'
                    markerUnits='userSpaceOnUse'
                    orient='auto'>
                    <path d='m0,0 l0,9 L7.794,4.5 z'/>
                </marker>,
                <marker key='arrow-linked-thick-for-circle'
                        id='arrow-linked-thick-for-circle' markerWidth='10' markerHeight='12' refX={radius + 12}
                        refY='6'
                        markerUnits='userSpaceOnUse' orient='auto'>
                    <path d='m0,0 L0,12 L10,6 z'></path>
                </marker>,
            ];
        }
        return null;
    }

    public render() {
        // 还没连上时使用arrow，连上后使用arrow-linked
        return (
            <defs>
                <marker id='arrow' markerWidth='9' markerHeight='9' refX='2' refY='4.5'
                        orient='auto'>
                    <path d='m0,0 l0,9 L7.794,4.5 z'/>
                </marker>
                <marker id='arrow-linked' markerWidth='9' markerHeight='9' refX='9' refY='4.5'
                        markerUnits='userSpaceOnUse'
                        orient='auto'>
                    <path d='m0,0 l0,9 L7.794,4.5 z'/>
                </marker>
                <marker id='arrow-linked-thick' markerWidth='10' markerHeight='12' refX='12' refY='6'
                        markerUnits='userSpaceOnUse' orient='auto'>
                    <path d='m0,0 L0,12 L10,6 z'/>
                </marker>
                {this.circleDefs()}
                <filter id='hover-blue' height='130%' width='120%'>
                    <feDropShadow dx='0' dy='2' stdDeviation='4' floodColor='blue' floodOpacity='0.2'/>
                </filter>
                <filter id='hover-green' height='130%' width='120%'>
                    <feDropShadow dx='0' dy='2' stdDeviation='4' floodColor='green' floodOpacity='0.2'/>
                </filter>
            </defs>
        );
    }
}
