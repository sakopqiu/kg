import * as React from 'react';
import {CyEdgeData} from '../../../../model/CyEdge';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {capitalize} from '../../../../../../utils';

export interface EdgeTypeLinkProps {
    label: string;
    data?: CyEdgeData[];
    style?: React.CSSProperties;
    mainStore: DisplayModeCanvasStore;
}

export class EdgeTypeLink extends React.Component<EdgeTypeLinkProps> {
    public render() {
        const service = this.props.mainStore.canvasDrawService.selectionService;
        const label = this.props.label;
        return (
            <span className='tab-link' style={this.props.style}
                  onClick={() => {
                      if (this.props.data) {
                          const ids = this.props.data.map((d) => d.id);
                          service.selectElementsByIds(ids);
                      } else {
                          service.selectEdgesByLabel(label);
                      }
                  }}>
              {capitalize(label)}
                {this.props.data && <span style={{marginLeft: 5}}>({this.props.data.length})</span>}
            </span>
        );
    }
}
