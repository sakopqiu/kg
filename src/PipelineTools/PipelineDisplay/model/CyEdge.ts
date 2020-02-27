import {action, computed, observable} from 'mobx';
import {CyEdgeCommon, CyEdgeCommonData} from './CyEdgeCommonData';
import uuidv1 from 'uuid/v1';
import {TimePropertyCache, TimePropertyCacheItem} from './TimePropertyCache';
import {doIf, normalizeTimeString, parseMoment, TimePrecision} from '../../../utils';
import {CyElementData, CyType} from './CyElement';
import {CyState} from './CyState';
import {EDGE_NORMAL_WIDTH} from '../../common/cytoscapeCommonStyle';
import moment from 'moment';
import _every from 'lodash/every';
import {CyElementDefaultClass} from '../interfaces';
import {canApplyAnyStyleRule} from '../DisplayCanvasUtils';
import {EdgeStyleConfig} from './EdgeStyleConfig';

export function emi(src: string, target: string, name: string) {
    return `${src}-${target}-${name}`;
}

export class CyEdgeData extends CyEdgeCommonData {
    @observable public params: Map<string, any> = new Map<string, any>();

    // 测试时用的假id
    genTestId() {
        this.id = 'testEdge' + uuidv1();
    }

    get cyType() {
        return CyType.EDGE;
    }

    getValue(key: string) {
        return this.params.get(key);
    }

    @action
    setValue(key: string, value: any) {
        this.params.set(key, value);
    }

    @action
    removeKey(key: string) {
        this.params.delete(key);
    }

    get width() {
        return EDGE_NORMAL_WIDTH;
    }

    get newLineColor() {
        const edgeConfig = this.cyState!.canvasSetting.globalEdgeConfig;
        return doIf(() => {
            return canApplyAnyStyleRule(edgeConfig.edgeStyleConfigs, this);
        }, (styleRule: EdgeStyleConfig) => {
            return styleRule.colorConfig.color;
        }, () => {
            return edgeConfig.edgeColorConfig.color;
        })!;
    }

    get lineColorOpacity() {
        const edgeConfig = this.cyState!.canvasSetting.globalEdgeConfig;
        return doIf(() => {
            return canApplyAnyStyleRule(edgeConfig.edgeStyleConfigs, this);
        }, (styleRule: EdgeStyleConfig) => {
            return styleRule.colorConfig.opacity;
        }, () => {
            return edgeConfig.edgeColorConfig.opacity / 100;
        })!;
    }

    get displayLabel() {
        if (this.showLabel()) {
            if (this.weight > 1) {
                return `${this.name} ${this.weight}`;
            } else {
                return this.name;
            }
        } else {
            return '';
        }
    }

    @computed
    get isMerged() {
        return this.cyState!.mergedEmis.has(this.emi);
    }

    get emi() {
        return emi(this.source, this.target, this.name);
    }

    // 返回一条边的所有时间属性的值,key为该属性的canonical表达，value为他的值
    timeProperties(cache: TimePropertyCache, timePrecision: TimePrecision) {
        const result: Map<string, string> = new Map<string, string>();

        for (const field of this.params.keys()) {
            const canonicalRepresentation = TimePropertyCacheItem.canonicalRepresentation(
                'edge', this.name, field);
            if (cache.has(canonicalRepresentation)) {
                result.set(canonicalRepresentation, normalizeTimeString(this.params.get(field)!, timePrecision));
            }
        }
        return result;
    }

    static fromJSON(json: any, cyState: CyState, copyParams = true): CyEdgeData {
        const cyEdgeData = new CyEdgeData(cyState);
        cyEdgeData.target = json.target;
        cyEdgeData.source = json.source;
        cyEdgeData.name = json.name;
        cyEdgeData.weight = json.weight;
        cyEdgeData.edgeIndex = json.edgeIndex;
        cyEdgeData.id = json.id;
        if (copyParams) {
            CyElementData.copyParams(json.params, cyEdgeData);
        }
        return cyEdgeData;
    }
}

export class CyEdge extends CyEdgeCommon {
    public data: CyEdgeData = new CyEdgeData(this.cyState);
    static defaultClass = CyElementDefaultClass.NORMAL_EDGE;
    public isCloned: boolean = false;

    static fromJSON(json: any, cyState: CyState, copyParams = true): CyEdge {
        const edge = new CyEdge(cyState);
        edge.initClassSet(json.classSet);
        edge.selected = json.selected || false;
        edge.data = CyEdgeData.fromJSON(json.data, cyState, copyParams);
        return edge;
    }

    // 不需要copy params，因为param的显示都是从cyState拿，这样做能获取更好性能
    static clone(json: any, cyState: CyState): CyEdge {
        const clonedEdge = CyEdge.fromJSON(json, cyState, false);
        clonedEdge.isCloned = true;
        return clonedEdge;
    }

    public transparentize() {
        this.addClass('low-priority-edge');
    }

    getValue(key: string) {
        return this.data.getValue(key);
    }

    // 检查和当前这个类型的边有关系的所有条件
    @computed
    private get filterConditionsForMe() {
        return this.cyState!.edgeFilterConditions.timeAttributes.filter((attr) => attr.relation === this.data.name);
    }

    // 是否被过滤条件过滤掉了，目前用在简易分析界面中
    public matchFilterCondition() {
        // 全文没有设置过滤条件，那么所有边都显示
        if (!this.cyState!.isRelationFilterEnabled()) {
            return true;
        }
        // 优化: 如果设置了某些过滤条件，但是没有一条和"我"有关系，就不显示
        if (this.filterConditionsForMe.length === 0) {
            return false;
        }
        const now = moment();

        // 对当前这条边来说，只有所有条件都符合了，才显示
        return _every(this.filterConditionsForMe, (f) => {
            if (f.condition === 'all') {
                return true;
            }
            // 处理api返回的undefined
            const value = parseMoment(this.getValue(f.attribute));
            if (!value) {
                return false;
            }
            if (typeof f.condition === 'string') {
                // 过滤掉发生在将来的关系
                const isAfterNow = value.isAfter(now);
                switch (f.condition) {
                    case '1w':
                        return !isAfterNow && now.subtract(1, 'w') <= value;
                    case '1M':
                        return !isAfterNow && now.subtract(1, 'M') <= value;
                    case '3M':
                        return !isAfterNow && now.subtract(3, 'M') <= value;
                    case '6M':
                        return !isAfterNow && now.subtract(6, 'M') <= value;
                    case '1y':
                        return !isAfterNow && now.subtract(1, 'y') <= value;
                    default:
                        return false;
                }
            } else {
                let result = true;
                if (f.condition.from) {
                    const from = f.condition.from;
                    result = value >= from && result;
                }
                if (f.condition.to) {
                    const to = f.condition.to;
                    result = value <= to && result;
                }
                return result;
            }
        });
    }

    simpleIsHidden() {
        if (this.data.id === 'edgefind-path-temp') {
            return false;
        }
        return !this.cyState!.edgeConfigs.get(this.data.name)!.show || !this.matchFilterCondition();
    }

    isHidden() {
        if (this.data.id === 'edgefind-path-temp') {
            return false;
        }
        if (!this.cyState!.edgeConfigs.get(this.data.name)!.show) {
            return true;
        }
        if (!this.matchFilterCondition()) {
            return true;
        }

        const visibleNodesId = this.cyState!.drawService.dataDriverProcessor.allVisibleNormalNodeIds;
        if (!visibleNodesId.has(this.data.source)) {
            return true;
        } else if (!visibleNodesId.has(this.data.target)) {
            return true;
        }
        return false;
    }
}
