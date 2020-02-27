import * as React from 'react';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {capitalize} from '../../../../../../utils';

export interface EdgeLinkProps extends ComplexModeCanvasComponentProps {
    edgeName: string;
}

@complexInject
export class EdgeLink extends ComplexModeCanvasComponent<EdgeLinkProps> {
    public render() {
        // if (!s) {
        //     return null;
        // }
        // const s = this.mainStore.currentActiveStore;
        // const service = s.canvasDrawService;
        const edgeName = this.props.edgeName;
        return (
            <span className='tab-link'
                  onClick={() => {
                      //   service.resetSelection();
                      // service.setCurrentEdgeType(service.edgeConfigs.get(edgeName)!);
                  }}
            >
                    {capitalize(edgeName)}
                </span>
        );
    }
}
