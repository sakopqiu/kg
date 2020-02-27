import * as React from 'react';
import {CyNodeData} from '../../../../model/CyNode';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {capitalize} from '../../../../../../utils';

export interface NodeTypeLinkProps {
    nodeTypeName: string;
    data?: CyNodeData[];
    style?: React.CSSProperties;
    mainStore: DisplayModeCanvasStore;
}

export class NodeTypeLink extends React.Component<NodeTypeLinkProps> {
    public render() {
        const s = this.props.mainStore;
        const service = s.canvasDrawService.selectionService;
        const nodeTypeName = this.props.nodeTypeName;
        return (
            <span className='tab-link' style={this.props.style}
                  onClick={() => {
                      if (this.props.data) {
                          const ids = this.props.data.map((d) => d.id);
                          service.selectElementsByIds(ids);
                      } else {
                          service.selectNodeType(nodeTypeName);
                      }
                  }}>
              {capitalize(nodeTypeName)}
                {this.props.data && <span style={{marginLeft: 5}}>({this.props.data.length})</span>}
            </span>
        );
    }
}
