import * as React from 'react';
import {debug, IPoint} from '../../../utils';
import {PureComponent} from 'react';

export interface ICanvasGridsProps {
    svgWidth: number;
    svgHeight: number;
    ratio: number;
    gridGap: number;
    panning: IPoint;
}

export default class CanvasGrids extends PureComponent<ICanvasGridsProps> {

    public render() {
        debug('rerendering grids');
        const results = [];
        const ratio = this.props.ratio;
        const width = this.props.svgWidth / ratio;
        const height = this.props.svgHeight / ratio;
        const gap = this.props.gridGap * ratio;
        for (let i = 0; i < width; i += gap) {
            results.push(<line key={'v' + i} className='grid-line' x1={i} y1={0} x2={i} y2={height}/>);
        }
        for (let i = 0; i < height; i += gap) {
            results.push(<line key={'h' + i} className='grid-line' x1={0} y1={i} x2={width} y2={i}/>);
        }
        return (
            <g transform={`translate(${this.props.panning.x},${this.props.panning.y})`}>
                {results}
            </g>
        );
    }
}
