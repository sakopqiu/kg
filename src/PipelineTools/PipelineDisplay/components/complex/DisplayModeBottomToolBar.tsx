import * as React from 'react';
import {complexInject} from '../../DisplayCanvasUtils';
import {getTranslation, isDebugMode} from '../../../../utils';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import {DevButtons} from '../DevButtons';
import {LayoutConfig, LayoutConfigs} from '../../CanvasDrawUtils';
import {CanvasLayoutIcon} from '../../../../icons/CanvasLayoutIcon';
import {CanvasPageRankIcon} from '../../../../icons/CanvasPageRankIcon';
import {ScreenFitIcon} from '../../../../icons/ScreenFitIcon';
import {SummaryGridIcon} from '../../../../icons/SummaryGridIcon';
import {TimeFilterIcon} from '../../../../icons/TimeFilterIcon';
import '../../../common/common.scss';
import {ComplexModeCanvasComponent, ComplexModeCanvasComponentProps} from './ComplexModeCanvasComponent';

const Option = Select.Option;
@complexInject
export default class DisplayModeBottomToolBar extends ComplexModeCanvasComponent {
    constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
        this.restore = this.restore.bind(this);
        this.changeLayout = this.changeLayout.bind(this);
    }

    private changeLayout(layout: string) {
        // setTimeout的作用是把更换layout放置到下一个event loop，这样and的select才能先消失
        setTimeout(() => {
            if (this.currentActiveStore && this.currentActiveStore.cy) {
                this.stateService.elementService.changeLayout(layout as any);
            }
        });
    }

    private handleFit = () => {
        this.stateService.elementService.fitElements();
        this.stateService.closeAllContextMenu();
    }

    private handlePageRank = async () => {
        await this.service.algoService.rankNodes();
    }

    private handleMiniMapVisible = () => {
        const miniMapService = this.stateService.miniMapService;
        miniMapService.setMiniMapVisible(!miniMapService.miniMapVisible);
    }

    private restore() {
        const s = this.currentActiveStore;
        if (s && s.cy) {
            s.cy.reset();
        }
    }

    private toggleTimeFilter = () => {
        this.timeFilterService.setShowTimeFilter(!this.timeFilterService.showTimeFilter);
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        return (
            <div className='bottom-tool-bar'>
                <div className='bottom-tool-bar-left'>
                    {this.canvasConfig.statusArea && this.canvasConfig.statusArea(this.currentActiveStore)}
                </div>
                <div className='bottom-tool-bar-right'>
                    {
                        this.canvasConfig.devMode ? <DevButtons service={s.canvasDrawService}/> : null
                    }

                    <React.Fragment>
                        {this.canvasConfig.extraBottomTool}
                        {isDebugMode() &&
                        <div className='canvas-tool-items'>
                            <TimeFilterIcon className='canvas-tool-icons' onClick={this.toggleTimeFilter}/>
                            <label
                                className='canvas-tool-label'>{getTranslation(this.locale, 'Time Series')}</label>
                        </div>
                        }
                        <div className='canvas-tool-items'>
                            <CanvasLayoutIcon className='canvas-tool-icons'/>
                            {/*<label*/}
                            {/*className='canvas-tool-label'>{getTranslation(this.locale, "Layout")}</label>*/}
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
                        {
                            isDebugMode()
                            &&
                            <div className='canvas-tool-items'>
                                <CanvasPageRankIcon className='canvas-tool-icons' onClick={this.handlePageRank}/>
                                <label
                                    className='canvas-tool-label'>{getTranslation(this.locale, 'PageRank')}</label>
                            </div>
                        }
                        <div className='canvas-tool-items'>
                            <ScreenFitIcon className='canvas-tool-icons' onClick={this.handleFit}/>
                            <label className='canvas-tool-label'>{getTranslation(this.locale, 'Fit')}</label>
                        </div>

                        <div className='canvas-tool-items'>
                            <SummaryGridIcon className='canvas-tool-icons' onClick={this.handleMiniMapVisible}/>
                            <label className='canvas-tool-label'>{getTranslation(this.locale, 'Summary')}</label>
                        </div>
                    </React.Fragment>
                    <div style={{
                        width: 35,
                        userSelect: 'none',
                        textAlign: 'right',
                    }}
                         className='canvas-tool-label'
                    >{s.canvasRatioDisplay}%
                    </div>
                </div>
            </div>
        );
    }
}
