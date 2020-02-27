import ZoomOut from '../../../icons/ZoomOut';
import ZoomIn from '../../../icons/ZoomIn';
import * as React from 'react';
import {editCanvasInject} from '../EditCanvasUtils';
import {getTranslation} from '../../../utils';
import {RestoreIcon} from '../../../icons/RestoreIcon';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from './EditModeCanvasComponent';

@editCanvasInject
export default class EditModeBottomToolBar extends EditModeCanvasComponent {
    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.restore = this.restore.bind(this);
        this.snap = this.snap.bind(this);
    }

    private restore() {
        const s = this.currentActiveStore;
        if (s) {
            s.setRatio(1);
        }
    }

    private snap(e: any) {
        if (this.currentActiveStore) {
            this.currentActiveStore.setSnap(e.target.checked);
        }
    }

    private zoomOut() {
        if (this.currentActiveStore) {
            this.currentActiveStore.zoomOut();
        }
    }

    private zoomIn() {
        if (this.currentActiveStore) {
            this.currentActiveStore.zoomIn();
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

                    <div className='interaction'
                         style={{marginRight: 20, fontWeight: 'normal'}}>
                        <input
                            id='snap'
                            checked={s.isSnapped}
                            style={{marginRight: 8}}
                            onChange={this.snap}
                            type='checkbox'/>
                        <label htmlFor='snap'>{getTranslation(this.locale, 'Snap')}</label>
                    </div>

                    <React.Fragment>
                        <RestoreIcon className='canvas-tool-icons' onClick={this.restore} style={{marginRight: 20}}/>
                        <ZoomOut style={{marginRight: 5}} onClick={this.zoomOut}
                                 title={getTranslation(this.locale, 'Zoom out')}/>
                        <div style={{
                            width: 35,
                            userSelect: 'none',
                            textAlign: 'center',
                        }}
                             className='canvas-tool-label'
                        >{s.svgRatioDisplay}%
                        </div>
                        <ZoomIn style={{marginLeft: 5}} onClick={this.zoomIn}
                                title={getTranslation(this.locale, 'Zoom in')}/>
                    </React.Fragment>
                </div>
            </div>
        );
    }
}
