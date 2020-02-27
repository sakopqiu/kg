import * as React from 'react';
import './index.scss';
import {VertexDataJson} from '../../../../../../kg-interface';
import {vertexName} from '../../../../../../DisplayCanvasUtils';

export interface DiffEntityProps {
    entity: VertexDataJson;
    onClick: (ele: VertexDataJson) => void;
}

export class DiffEntity extends React.Component<DiffEntityProps> {
    public render() {
        const {entity} = this.props;
        const name = vertexName(entity);
        return (
            <div className='diff-entity' onClick={() => {
                this.props.onClick(entity);
            }}>
                <span>{name}</span>
                ({entity.label})
            </div>
        );
    }
}
