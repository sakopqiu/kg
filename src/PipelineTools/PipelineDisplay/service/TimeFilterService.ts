import {CommonService} from './CommonService';
import {genNumberArr, TimePrecision} from '../../../utils';
import {EChartType} from './CanvasDrawService';
import {observable, action, ObservableMap} from 'mobx';

export class TimeFilterService extends CommonService {

    @observable public showTimeFilter: boolean = false;
    // 时间属性使用哪种图展示
    @observable public echartType: EChartType = 'stack';
    // 时间属性过滤器的精度
    @observable public timePrecision: TimePrecision = 'days';
    // 时间属性过滤中是否隐藏时间之间的空白，比如07-20和08-01之间如果以天为单位会有10天的空隙，
    // 如果insertTimeGap为true，那么这中间10天也将被显示出来
    @observable public insertTimeGap: boolean = false;
    // 时间选择器选中的范围，key为series的name，value为该series中x轴被选中的start和end
    @observable public timeFilterRange: Map<string, number[]> = new Map<string, number[]>();

    // 用户如果选择或取消选择了某个序列，记录在这张map里，如果某个序列从未被用户操作过，那么不会出现在这个map里，但是他会一直保持显示
    public seriesSelectedMap: ObservableMap<string, boolean> = new ObservableMap<string, boolean>();

    @action
    public setTimePrecision(val: TimePrecision) {
        this.timePrecision = val;
    }

    @action
    public setEchartType(val: EChartType) {
        this.echartType = val;
    }

    @action
    public setInsertTimeGap(val: boolean) {
        this.insertTimeGap = val;
    }

    @action
    public setShowTimeFilter(val: boolean) {
        this.showTimeFilter = val;
        if (val) {
            this.setFullRange();
        } else {
            this.insertTimeGap = false;
        }
    }

    @action
    public setFilterRange(newRange: Map<string, number[]>) {
        this.timeFilterRange = newRange;
        this.cyState.noHistory = true;
        this.cyState.highlightTimerFilterEligibleElements = true;
    }

    @action
    public setFullRange() {
        const map = new Map<string, number[]>();
        for (const s of this.statsService.statsForTimeProperty.series) {
            map.set(s.seriesName, genNumberArr(s.data.length));
        }
        this.setFilterRange(map);
    }
}
