import * as React from 'react';
import {observer} from 'mobx-react';
import {ContainerId, IUniversalDisplayModeContext} from '../../../interfaces';
import {UniversalDisplayModeCanvasConfigProvider} from '../../../DisplayCanvasUtils';
import '../../../../common/common.scss';
import '../../canvas.scss';
import {SpecialDisplay} from '../SpecialDisplay';
import {UniversalCanvasBackground} from './UniversalCanvasBackground';
import UniversalDisplayModeTopToolBar from './UniversalDisplayModeTopToolBar';

export const UNIVERSAL_PIPELINE_ID = 'UNIVERSAL_PIPELINE_ID';

@observer
export class UniversalPipelineDisplay extends SpecialDisplay<IUniversalDisplayModeContext> {

    get pipelineId() {
        return UNIVERSAL_PIPELINE_ID;
    }

    get containerId() {
        return ContainerId.universal;
    }

    public render() {
        return (
            <UniversalDisplayModeCanvasConfigProvider value={this.props}>
                <div className={`pipelinetool-display-wrapper ${this.props.className || ''}`}
                     style={{...(this.props.style || {}), flexDirection: 'row'}}>
                    <div className='pipelinetool-canvas'
                         style={{width: this.mainStore.canvasWidth}}
                    >
                        <div className='drawing-context-wrapper' style={{width: '100%'}}>
                            {this.props.extraLoading || ''}
                            {this.mounted && <UniversalDisplayModeTopToolBar/>}
                            {this.mounted && <UniversalCanvasBackground/>}
                        </div>
                    </div>
                    {this.props.extraContent || null}
                </div>
            </UniversalDisplayModeCanvasConfigProvider>
        );
    }
}
