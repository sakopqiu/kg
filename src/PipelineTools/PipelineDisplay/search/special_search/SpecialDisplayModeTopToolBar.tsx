import * as React from 'react';
import {getTranslation, isDebugMode} from '../../../../utils';
import 'antd/es/select/style';
import Select from 'antd/es/select';
import {LayoutConfig, LayoutConfigs} from '../../CanvasDrawUtils';
import {CanvasLayoutIcon} from '../../../../icons/CanvasLayoutIcon';
import {ScreenFitIcon} from '../../../../icons/ScreenFitIcon';
import '../../../common/common.scss';

import {
    ISpecialSearchDisplayModeCanvasComponentProps,
    SpecialSearchDisplayModeCanvasComponent,
} from './SpecialSearchDisplayModeCanvasComponent';
import {DevButtons} from '../../components/DevButtons';
import {SummaryGridIcon} from '../../../../icons/SummaryGridIcon';

const Option = Select.Option;
export default class SpecialDisplayModeTopToolBar extends SpecialSearchDisplayModeCanvasComponent {
    constructor(props: ISpecialSearchDisplayModeCanvasComponentProps) {
        super(props);
        this.changeLayout = this.changeLayout.bind(this);
    }

    private changeLayout(layout: string) {
        // setTimeout的作用是把更换layout放置到下一个event loop，这样and的select才能先消失
        setTimeout(() => {
            if (this.mainStore.cy) {
                this.service.elementService.changeLayout(layout as any);
            }
        });
    }

    private handleFit = () => {
        try {
            this.service.elementService.fitElements();
        } finally {
            this.service.stateService.closeAllContextMenu();
        }
    }

    private handleMiniMapVisible = () => {
        const miniMapService = this.service.miniMapService;
        miniMapService.setMiniMapVisible(!miniMapService.miniMapVisible);
    }

    public render() {
        const s = this.mainStore;
        return (
            <div className='top-tool-bar'>
                <div className='top-tool-bar-left'>
                    {this.canvasConfig.statusArea && this.canvasConfig.statusArea(s)}
                </div>
                <div className='top-tool-bar-right'>
                    {
                        isDebugMode() ? <DevButtons service={s.canvasDrawService}/> : null
                    }
                    <div className='canvas-tool-items'>
                        <CanvasLayoutIcon className='canvas-tool-icons'/>
                        <Select className='layout-select' size={'small'}
                                value={getTranslation(this.locale, 'Layout')}
                                style={{width: 100, marginLeft: 0, marginRight: 10}}
                                onSelect={this.changeLayout}>
                            {LayoutConfigs.map((config: LayoutConfig) => {
                                return <Option key={config.value}
                                               title={config.name}
                                               value={config.value}>{config.name}</Option>;
                            })}
                        </Select>
                    </div>
                    <div className='canvas-tool-items'>
                        <ScreenFitIcon className='canvas-tool-icons' onClick={this.handleFit}/>
                        <label className='canvas-tool-label'>{getTranslation(this.locale, 'Fit')}</label>
                    </div>
                    <div className='canvas-tool-items'>
                        <SummaryGridIcon className='canvas-tool-icons' onClick={this.handleMiniMapVisible}/>
                        <label className='canvas-tool-label'>{getTranslation(this.locale, 'Summary')}</label>
                    </div>
                    <div style={{
                        width: 35,
                        userSelect: 'none',
                        textAlign: 'right',
                    }}
                         className='canvas-tool-label canvas-tool-items'
                    >{s.canvasRatioDisplay}%
                    </div>

                    {this.canvasConfig.topToolBarRightExtra &&
                    this.canvasConfig.topToolBarRightExtra.map(config => {
                        const IconClass = config.icon;
                        return (
                            <div className='canvas-tool-items' key={config.label}>
                                <IconClass className='canvas-tool-icons' onClick={config.onClick}/>
                                <label className='canvas-tool-label'>{config.label}</label>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
