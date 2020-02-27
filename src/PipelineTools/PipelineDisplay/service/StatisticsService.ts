import {CanvasDrawService} from './CanvasDrawService';
import {CyNodeData} from '../model/CyNode';
import {DisplayModePipelineSchema, ElementType, FieldSchema} from '../interfaces';
import {CommunityService} from './CommunityService';
import {
    generateTimeGapBetween,
    getTranslation,
    isNumberType,
    isTimeRelatedType,
    normalComparator,
    try2ConvertToNumber,
} from '../../../utils';
import {BucketManager} from '../../../algorithms/bucket/BucketManager';
import {BucketInfo} from '../../../algorithms/bucket/BucketInfo';
import {CommonService} from './CommonService';
import {CyEdgeData} from '../model/CyEdge';
import {Series, TimePropertyCache, TimePropertyCacheItem} from '../model/TimePropertyCache';
import {computed} from 'mobx';

const MAXIMUM_BUCKET_COUNT = 10;

// 某一个域的统计信息
export class FieldStat {
    constructor(public fieldName: string, public fieldType: string) {
    }

    // 比如说这描述的是age属性，那么这个field记录每个age所对应的数目
    public fieldValueMap: Map<string, number> = new Map<string, number>();

    incr(value: any) {
        if (value) {
            value = value.toString();
        }
        let count = this.fieldValueMap.get(value) || 0;
        count++;
        this.fieldValueMap.set(value, count);
    }

    fieldInfo(bService: CommunityService) {
        const sortedKeys = Array.from(this.fieldValueMap.keys()).sort(normalComparator);
        const valueSet = new Set<any>(sortedKeys.map(ele => try2ConvertToNumber(ele)));
        const bucketCount = isNumberType(this.fieldType) ? 10 : Infinity;
        const bucketManager = new BucketManager();

        const bucketsInfo = bucketManager.generateBuckets(Array.from(valueSet), bucketCount, this.fieldType);
        for (const key of sortedKeys) {
            const bucket = bucketManager.getBucketForElement(try2ConvertToNumber(key))!;
            bucket.size += this.fieldValueMap.get(key)!;
        }
        // 如果出来的类型超过MAXIMUM_BUCKET_COUNT个，按降序排序，选出前MAXIMUM_BUCKET_COUNT个，
        // 剩余的归入到others
        if (bucketsInfo.length > MAXIMUM_BUCKET_COUNT) {
            bucketsInfo.sort((info: BucketInfo, info2: BucketInfo) => {
                if (info2.size > info.size) {
                    return 1;
                } else {
                    return -1;
                }
            });
            const ret = bucketsInfo.slice(0, MAXIMUM_BUCKET_COUNT);
            const othersString = getTranslation(bService.drawService.canvasStore.locale, 'Others');
            const restBucket = new BucketInfo(othersString, othersString, this.fieldType);
            bucketsInfo.slice(MAXIMUM_BUCKET_COUNT).forEach((info: BucketInfo) => {
                restBucket.size += info.size;
            });
            ret.push(restBucket);
            return ret;
        } else {
            return bucketsInfo;
        }
    }

}

export class StatisticsService extends CommonService {

    constructor(public drawService: CanvasDrawService) {
        super(drawService);
    }

    statsForField(nodesData: Array<CyNodeData | CyEdgeData>, fieldSchema: FieldSchema): FieldStat {
        const fieldName = fieldSchema.fieldName;
        const fieldStat = new FieldStat(fieldName, fieldSchema.fieldType);
        for (const data of nodesData) {
            let value = '';
            if (fieldName === 'id') {
                value = data.id;
            } else if (fieldName === 'name') {
                value = data.name;
            } else {
                value = data.getValue(fieldName);
            }
            fieldStat.incr(value);
        }
        return fieldStat;
    }

    /**
     * 获取schema中定义的所有与时间相关的边和节点
     * @returns {Map<string, TimePropertyCache>}
     */
    public get timeProperties(): TimePropertyCache {
        const cache = new TimePropertyCache();
        const schema: DisplayModePipelineSchema = this.drawService.canvasStore.displayModePipelineSchema;
        const nodeSchemas = schema.vertices;
        const edgeSchemas = schema.edges;

        for (const ns of nodeSchemas) {
            for (const f of ns.fields) {
                if (isTimeRelatedType(f.fieldType)) {
                    const tp = new TimePropertyCacheItem('vertex', ns.labelName, f.fieldName);
                    cache.addItem(tp.canonicalName, tp);
                }
            }
        }
        for (const es of edgeSchemas) {
            for (const f of es.fields) {
                if (isTimeRelatedType(f.fieldType)) {
                    const tp = new TimePropertyCacheItem('edge', es.labelName, f.fieldName);
                    cache.addItem(tp.canonicalName, tp);
                }
            }
        }
        return cache;
    }

    private updateCell(cache: TimePropertyCache,
                       data: CyNodeData | CyEdgeData, type: ElementType) {
        // 获取当前边或者节点的所有时间属性
        const timeProperties = data.timeProperties(cache, this.timeFilterService.timePrecision);
        for (const propertyCanonicalName of timeProperties.keys()) {
            const tp = cache.getItem(propertyCanonicalName)!;
            const time = timeProperties.get(propertyCanonicalName)!;
            // 为echarts的条状图每个series增加值
            tp.fill(time, data);
        }
    }

    // 为了echart画图填充信息
    @computed
    get statsForTimeProperty() {
        const cache: TimePropertyCache = this.timeProperties;
        const allNodes = this.cyState.cyNodes.filter(n => !n.isHidden());
        const allEdges = this.cyState.cyEdges.filter((e) => !e.simpleIsHidden());

        for (const node of allNodes) {
            this.updateCell(cache, node.data, 'vertex');
        }
        for (const edgeCommon of allEdges) {
            this.updateCell(cache, edgeCommon.data, 'edge');
        }

        return this.xAxisAndSeries(cache);
    }

    // 生成echarts所需要的x轴和series,
    // x轴是1月，2月，3月，
    // series是所有的properties，y轴显示每个series在1月，2月，3月的数值
    private xAxisAndSeries(cache: TimePropertyCache) {
        const allXValuesSet: Set<string> = new Set<string>();
        for (const tp of cache.items) {
            const keys = tp.timeValues;
            for (const k of keys) {
                allXValuesSet.add(k);
            }
        }
        const allXValues = Array.from(allXValuesSet);
        allXValues.sort();

        let finalXValues: string[];
        const precision = this.timeFilterService.timePrecision;

        if (this.timeFilterService.insertTimeGap && precision !== 'seconds'
            && precision !== 'minutes') {
            // 生成时间之间的缝隙，比如2018-03-01和2018-03-05之间的三天也被添加进来
            if (allXValues.length > 1) {
                finalXValues = [];
                for (let i = 0; i < allXValues.length - 1; i++) {
                    const curr = allXValues[i];
                    const next = allXValues[i + 1];
                    finalXValues = finalXValues.concat(generateTimeGapBetween(curr, next, precision, false));
                    if (i === allXValues.length - 2) {
                        finalXValues.push(next);
                    }
                }
            } else {
                finalXValues = allXValues;
            }
        } else {
            finalXValues = allXValues;
        }

        const allSeries: Series[] = [];
        for (const seriesName of cache.seriesNames) {
            const series = new Series(seriesName);
            for (const xValue of finalXValues) {
                const cacheItem = cache.getItem(seriesName)!;
                series.data.push(cacheItem.elementsForTime(xValue));
            }
            allSeries.push(series);

        }
        return {
            xAxis: finalXValues,
            series: allSeries,
            cache,
        };
    }

}
