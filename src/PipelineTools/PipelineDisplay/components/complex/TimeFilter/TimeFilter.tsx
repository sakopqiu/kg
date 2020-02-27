import * as React from 'react';
import {complexInject} from '../../../DisplayCanvasUtils';
import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
// 引入提示框组件、标题组件、工具箱组件。
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/brush';
import 'echarts/lib/component/toolbox';
import {Series} from '../../../model/TimePropertyCache';
import './index.scss';
import classNames from 'classnames';
import _filter from 'lodash/filter';
import {EChartType} from '../../../service/CanvasDrawService';
import {StackChartIcon} from '../../../../../icons/StackChartIcon';
import {BarChartIcon} from '../../../../../icons/BarChartIcon';
import {LineChartIcon} from '../../../../../icons/LineChartIcon';
import EmptyPageImage from '../../../../../images/empty-page.png';
import DarkEmptyPageImage from '../../../../../images/darkTheme/empty-page.png';
import {debug, getTranslation, TimePrecision} from '../../../../../utils';
import Select from 'antd/es/select';
import 'antd/es/select/style';
import Checkbox from 'antd/es/checkbox';
import 'antd/es/checkbox/style';
import {CyElementData} from '../../../model/CyElement';
import {CyNodeData} from '../../../model/CyNode';
import {CyEdgeData} from '../../../model/CyEdge';
import _debounce from 'lodash/debounce';
import {runInAction} from 'mobx';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';
import {TimeSeriesConfig} from '../../../components/complex/TimeSeriesConfig/TimeSeriesConfig';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import {CloseIcon} from '../../../../../icons/CloseIcon';
import {globalStore} from '../../../../../business-related/stores/GlobalStore';
import {SophonTheme} from '../../../../../components/SophonThemeSelect/interface';

const Option = Select.Option;

const EchartColors: string[] = [
    '#FFC36F', '#2C89EC', '#1CDDDC', '#FF9F7F', '#BB9A81',
    '#8DC1A9', '#546570', '#C23431', '#E062AE',
];

const textStyle = {
    textStyle: {
        fontFamily: 'sophone-font, Microsoft YaHei, SimSun, arial',
        fontSize: 10,
        color: '#28374F',
    },
};

@complexInject
export class TimeFilter extends ComplexModeCanvasComponent {

    private xAxis: string[];
    private series: Series[];

    constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
    }

    get xAxisMin() {
        return this.xAxis[0] || undefined;
    }

    get xAxisMax() {
        return this.xAxis.length > 0 ? this.xAxis[this.xAxis.length - 1] : undefined;
    }

    public render() {
        const result = this.stateService.statsService.statsForTimeProperty;
        this.xAxis = result.xAxis;
        // 过滤掉所有时间上值都为0的属性
        this.series = _filter(result.series, (s: Series) => {
            return !s.isEmpty;
        });
        return (
            <div id='display-mode-time-filter-wrapper'>
                <TimeFilterEchart
                    key={'withEchart'} xAxis={this.xAxis}
                    series={this.series}/>
            </div>
        );
    }
}

interface TimeFilterEchartProps extends ComplexModeCanvasComponentProps {
    xAxis: string[];
    series: Series[];
}

@complexInject
class TimeFilterEchart extends ComplexModeCanvasComponent<TimeFilterEchartProps> {
    private echartInstance: echarts.ECharts | null;
    private store: DisplayModeCanvasStore;

    get xAxis() {
        return this.props.xAxis;
    }

    private getEChartTypeConfig() {
        const type = this.timeFilterService.echartType;
        if (type === 'bar') {
            return {
                type: 'bar',
            };
        } else if (type === 'stack') {
            return {
                type: 'bar',
                stack: 'stack1',
            };
        } else if (type === 'line') {
            return {
                type: 'line',
            };
        } else {
            throw new Error('Type not supported: ' + type);
        }
    }

    private echartOption() {
        const legendNames: object[] = [];
        const legendSelection: { [key: string]: boolean } = {};
        const echartType = this.getEChartTypeConfig();
        const tService = this.timeFilterService;

        const seriesData = this.props.series.map((s: Series, index: number) => {
            legendNames.push({
                name: s.seriesName,
                icon: 'bar',
            });
            if (tService.seriesSelectedMap.has(s.seriesName)) {
                legendSelection[s.seriesName] = tService.seriesSelectedMap.get(s.seriesName)!;
            } else {
                legendSelection[s.seriesName] = true;
            }

            return {
                ...echartType,
                name: s.seriesName,
                data: s.data.map((eles: CyElementData[]) => eles.length),
                color: EchartColors[index % EchartColors.length],
            };
        });

        const grid = {
            left: 22,
            right: 22,
            top: 58,
            height: 188,
            containLabel: true,
            ...textStyle,
        };

        // 非折线图显示框选区域
        const brush = this.timeFilterService.echartType === 'line' ? {} : {
            toolbox: {
                top: 10,
                left: 30,
                emphasis: {
                    iconStyle: {
                        borderColor: '#549be7',
                    },
                },
            },
            brush: {
                toolbox: ['lineX', 'keep', 'clear'],
                xAxisIndex: 0, // 很重要，不然brush绘制区间是整个chart
            },
        };

        const option = {
            tooltip: {
                trigger: 'axis' as any,
                padding: 10,
            },
            grid,
            legend: {
                top: 250,
                data: legendNames,
                ...textStyle,
                selected: legendSelection,
            },
            ...brush,
            xAxis: {
                boundaryGap: true, // type为category时，设置这个值为true使得第一个x值不和0重叠
                type: 'category' as any,
                data: this.xAxis,
                // splitLine: {show: true},
                show: true, // 需要显示x和y轴
                axisTick: {
                    alignWithLabel: true,
                },
            },
            yAxis: {
                boundaryGap: ['10%', '20%'],
                min: 0,
                splitLine: {
                    lineStyle: {
                        type: 'dashed' as any,
                    },
                },
                show: true,
                axisLine: {
                    show: false,
                },
            },
            series: seriesData,
        };
        debug(JSON.stringify(option, null, 2));
        return option;
    }

    private clickHandler = (param: any) => {
        const cache = this.stateService.statsService.statsForTimeProperty.cache;
        if (param.componentSubType === 'bar') {
            const time = param.name; // x轴的名字，即日期
            // 当前所选时间所对应的所有元素
            const elements: CyElementData[] = Array.from(cache.getItem(param.seriesName)!.elementsForTime(time));
            const elementIds: Set<string> = new Set<string>();
            elements.forEach((data) => {
                if (data instanceof CyNodeData) {
                    elementIds.add(data.id);
                } else if (data instanceof CyEdgeData) {
                    // TODO!!!
                    elementIds.add(data.id);
                }
            });
            this.selectionService.selectElementsByIds(Array.from(elementIds), true);
        }
    }

    private disposeOldInstance() {
        this.store.removeResizeListener(this.onResize);
        if (this.echartInstance && !this.echartInstance.isDisposed()) {
            this.echartInstance.dispose();
            this.echartInstance = null;
        }
    }

    private isRangeSelected = false;

    // brush时间相应的是真实的区间的变化，而renderBrushed在点击brush的按钮时也会触发，导致不必要的重绘
    private brush = () => {
        this.isRangeSelected = true;
    }

    private renderBrushed = (params: any) => {
        if (!this.isRangeSelected) {
            this.isRangeSelected = false;
            return;
        }
        this.isRangeSelected = false;
        const brushed = [];
        const brushComponent = params.batch[0];
        if (!brushComponent) {
            return;
        }

        const newFilterRange = new Map<string, number[]>();
        for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
            const seriesName = brushComponent.selected[sIdx].seriesName;
            const rawIndices = brushComponent.selected[sIdx].dataIndex;
            if (rawIndices.length > 0) {
                newFilterRange.set(seriesName, rawIndices);
            }
            brushed.push('[Series ' + sIdx + '] ' + rawIndices.join(', '));
        }
        runInAction(() => {
            if (newFilterRange.size > 0) {
                this.timeFilterService.setFilterRange(newFilterRange);
            } else {
                this.timeFilterService.setFullRange();
            }
        });

        //
        // if (isDebugMode()) {
        //     this.echartInstance!.setOption({
        //         title: {
        //             backgroundColor: '#333',
        //             text: 'SELECTED DATA INDICES: \n' + brushed.join('\n'),
        //             bottom: 0,
        //             right: 0,
        //             width: 100,
        //             textStyle: {
        //                 fontSize: 12,
        //                 color: '#fff'
        //             }
        //         }
        //     } as any);
        // }
    }

    private legendSelectChanged = (event: any) => {
        runInAction(() => {
            for (const key in event.selected) {
                this.timeFilterService.seriesSelectedMap.set(key, event.selected[key]);
            }
        });
    }

    private initEchartInstance = () => {
        this.disposeOldInstance();

        if (this.props.xAxis.length === 0) {
            return;
        }
        this.echartInstance = echarts.init(document.getElementById('display-mode-time-filter')! as any);
        this.echartInstance.setOption(this.echartOption());
        this.echartInstance.on('click', this.clickHandler);
        this.echartInstance.on('legendselectchanged', this.legendSelectChanged);
        this.echartInstance.on('brushSelected', _debounce(this.renderBrushed, 101));
        this.echartInstance.on('brush', _debounce(this.brush, 100));
        this.store.addResizeListener(this.onResize);
    }

    private onResize = () => {
        if (this.echartInstance) {
            this.echartInstance.resize();
        }
    }

    componentWillUnmount() {
        if (this.store) {
            this.disposeOldInstance();
        }
    }

    componentWillMount() {
        this.store = this.currentActiveStore!;
    }

    componentDidMount() {
        this.initEchartInstance();
    }

    componentDidUpdate() {
        this.initEchartInstance();
    }

    private resetChartType(type: EChartType) {
        if (this.timeFilterService.echartType !== type) {
            this.timeFilterService.setEchartType(type);
            this.initEchartInstance();
            this.timeFilterService.setFullRange();
        }
    }

    private changeTimePrecision = (value: string) => {
        runInAction(() => {
            this.timeFilterService.setTimePrecision(value as TimePrecision);
            this.timeFilterService.setFullRange();
        });
    }

    private onInsertTimeGapChanged = (e: any) => {
        runInAction(() => {
            this.timeFilterService.setInsertTimeGap(e.target.checked);
            this.timeFilterService.setFullRange();
        });
    }

    public render() {
        // 当前图中无时间属性节点
        const closeIcon = (
            <CloseIcon style={{fontSize: 12, marginLeft: 40}}
                           hint={getTranslation(this.locale, 'Close')}
                           onClick={() => {
                               this.timeFilterService.setShowTimeFilter(false);
                           }}/>
        );
        if (this.props.xAxis.length === 0) {
            return <div className='no-time-attributes'>
                <div className='notime-attr-closeicon'>
                    {closeIcon}
                </div>
                <img src={globalStore.theme === SophonTheme.DARK ? DarkEmptyPageImage : EmptyPageImage}/>
                <p>
                    {getTranslation(this.locale, 'No time properties hint')}
                </p>
            </div>;
        }

        const echartType = this.timeFilterService.echartType;
        const precision = this.timeFilterService.timePrecision;
        return <React.Fragment>
            <div
                id='display-mode-time-filter'
                className='display-mode-time-filter'/>
            <div className='time-filter-buttons'>
                <TimeSeriesConfig service={this.service} locale={this.locale}/>
                <div style={{marginRight: 10}}>
                    <Checkbox
                        disabled={precision === 'seconds' || precision === 'minutes'}
                        checked={this.timeFilterService.insertTimeGap} onChange={this.onInsertTimeGapChanged}/>
                    <span>{getTranslation(this.locale, 'Show All')}</span>
                </div>
                <Select
                    style={{width: 120}}
                    size={'small'}
                    value={this.timeFilterService.timePrecision} onChange={this.changeTimePrecision}>
                    <Option value={'years'}>{getTranslation(this.locale, 'Year')}</Option>
                    <Option value={'months'}>{getTranslation(this.locale, 'Month')}</Option>
                    <Option value={'days'}>{getTranslation(this.locale, 'Day')}</Option>
                    <Option value={'hours'}>{getTranslation(this.locale, 'Hour')}</Option>
                    <Option value={'minutes'}>{getTranslation(this.locale, 'Minute')}</Option>
                    <Option value={'seconds'}>{getTranslation(this.locale, 'Second')}</Option>
                </Select>
                <StackChartIcon
                    className={classNames({active: echartType === 'stack'})}
                    onClick={() => {
                        this.resetChartType('stack');
                    }}
                />
                <BarChartIcon className={classNames({active: echartType === 'bar'})}
                              onClick={() => {
                                  this.resetChartType('bar');
                              }}
                />
                <LineChartIcon className={classNames({active: echartType === 'line'})}
                               onClick={() => {
                                   this.resetChartType('line');
                               }}
                />
                {closeIcon}
            </div>
        </React.Fragment>;
    }
}
