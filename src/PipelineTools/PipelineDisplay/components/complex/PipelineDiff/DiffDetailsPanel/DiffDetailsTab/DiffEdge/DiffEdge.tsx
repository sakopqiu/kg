import * as React from 'react';
import './index.scss';
import _find from 'lodash/find';
import {EdgeDataJson, SimpleGraphDataJson} from '../../../../../../kg-interface';
import {vertexName} from '../../../../../../DisplayCanvasUtils';

export interface DiffEntityProps {
    edge: EdgeDataJson;
    allData: SimpleGraphDataJson;
    onClick: (ele: EdgeDataJson) => void;
}

export class DiffEdge extends React.Component<DiffEntityProps> {
    public render() {
        const {edge, allData} = this.props;
        const fromNode = _find(allData.vertices, (entity) => entity.id === edge.srcId)!;
        const toNode = _find(allData.vertices, (entity) => entity.id === edge.dstId)!;
        return (
            <div className='diff-edge' onClick={() => {
                this.props.onClick(edge);
            }}>
                <span>{vertexName(fromNode)}</span>
                <span>{'\u2192'}</span>
                <span>{vertexName(toNode)}</span>
            </div>
        );
    }
}
