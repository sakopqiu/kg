import * as React from 'react';
import classNames from 'classnames';
import {getTranslation} from '../../../../../../utils';
import '../../../../../common/common.scss';
import './index.scss';
import {
    ISimpleDisplayModeCanvasComponentProps,
    SimpleDisplayModeCanvasComponent,
} from '../SimpleDisplayModeCanvasComponent';
import {simpleInject} from '../../../../DisplayCanvasUtils';
import ElementAttributeViewer from '../../../../right/DetailsPanel/tabs/ElementAttributeViewer';

@simpleInject
export default class SimpleDisplayModeDetailsPanel extends SimpleDisplayModeCanvasComponent {

    constructor(props: ISimpleDisplayModeCanvasComponentProps) {
        super(props);
    }

    public render() {
        let currentSelection = null;
        const currentNodesData = this.helperService.selectedCyNodesData;
        const currentEdgesData = this.helperService.selectedCyEdgesCommonData;

        const viewerProps = {
            readonly: true,
            locale: this.locale,
            mainStore: this.canvasConfig.mainStore,
        };

        if (currentNodesData.length === 1 && currentEdgesData.length === 0) {
            currentSelection = <ElementAttributeViewer {...viewerProps} w={currentNodesData[0]}/>;
        } else if (currentEdgesData.length === 1 && currentNodesData.length === 0) {
            currentSelection = <ElementAttributeViewer {...viewerProps} w={currentEdgesData[0]}/>;
        }

        return (
            <div className={classNames('simple-canvas-details-panel canvas-details-panel',
                {show: !!currentSelection})}>
                <React.Fragment>
                    <div className='details-title'>
                        <div>
                            {getTranslation(this.locale, 'Graph Results')}
                        </div>
                    </div>
                    <div style={{
                        padding: '20px 15px',
                    }}>
                        {currentSelection}
                    </div>
                </React.Fragment>
            </div>
        );
    }
}
