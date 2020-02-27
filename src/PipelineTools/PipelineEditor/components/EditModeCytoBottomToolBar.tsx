import * as React from 'react';
import {editCanvasInject} from '../EditCanvasUtils';
import {RestoreIcon} from '../../../icons/RestoreIcon';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from './EditModeCanvasComponent';
import {UndoIcon} from '../../../icons/UndoIcon';
import {RedoIcon} from '../../../icons/RedoIcon';
import {getTranslation} from '../../../utils';

@editCanvasInject
export default class EditModeCytoBottomToolBar extends EditModeCanvasComponent {
    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.restore = this.restore.bind(this);
    }

    private restore() {
        if (this.currentActiveStore!.isPipelineReadOnly) {
            this.mainStore.cy.layout({name: 'breadthfirst'}).run();
        } else {
            this.mainStore.fit();
        }
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        return (
            <div className='bottom-tool-bar'>
                <div className='bottom-tool-bar-left'>
                    {this.canvasConfig.statusArea && this.canvasConfig.statusArea!(this.currentActiveStore)}
                </div>
                <div className='bottom-tool-bar-right'>
                    <React.Fragment>
                        {!s.isPipelineReadOnly
                        &&
                        <React.Fragment>
                            <UndoIcon
                                className='canvas-tool-icons cyto-tools'
                                title={getTranslation(this.locale, 'Undo')}
                                onClick={s.historyManager.back}
                                disabled={!s.historyManager.canBack}/>
                            <RedoIcon
                                className='canvas-tool-icons cyto-tools'
                                title={getTranslation(this.locale, 'Redo')}
                                onClick={s.historyManager.forward}
                                disabled={!s.historyManager.canForward}/>
                        </React.Fragment>
                        }
                        <RestoreIcon className='canvas-tool-icons cyto-tools' onClick={this.restore}/>
                        <div style={{
                            width: 35,
                            userSelect: 'none',
                            textAlign: 'center',
                        }}
                             className='canvas-tool-label'
                        >{s.svgRatioDisplay}%
                        </div>
                    </React.Fragment>
                </div>
            </div>
        );
    }
}
