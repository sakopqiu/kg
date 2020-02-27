// 将此处的数据集类型转换成echart所需要的类型
import {normalizeType, try2ConvertToNumber} from './utils';
import {DimensionType, SophonEchartDataset} from './components/bi/bi-interface';
import {jStat} from 'jStat';
import _compact from 'lodash/compact';
import _isArray from 'lodash/isArray';

// 将外部的类型转换成echart需要的类型
export function typeConversion(type: string): DimensionType {
    switch (type) {
        case 'tinyint':
        case 'smallint':
        case 'bigint':
        case 'int':
        case 'byte':
        case 'short':
            return 'int';
        case 'float':
        case 'double':
        case 'decimal':
            return 'float';
        case 'date':
        case 'timestamp':
            return 'time';
        case 'boolean':
        case 'string':
            return 'ordinal';
        default:
            // 将decimal(xx,xx)转换成decimal
            if (normalizeType(type) === 'decimal') {
                return 'float';
            }
            throw new Error('not supported type ' + type);
    }
}

export function fieldIndex(ds: SophonEchartDataset, fieldName: string) {
    return ds.dimensions.findIndex(d =>
        typeof d === 'string' ? d === fieldName : d.name === fieldName);
}

export function fieldType(ds: SophonEchartDataset, fieldName: string) {
    const dimension = ds.dimensions.find(d =>
        typeof d === 'string' ? d === fieldName : d.name === fieldName)!;
    return typeof dimension === 'string' ? 'ordinal' : dimension.type;
}

export type AggregateType = 'SUM' | 'MEAN' | 'MAX' | 'MIN' | 'STDEV' | 'MEDIAN' | 'QUARTILES'
    | '75' | 'QUANTILES' | 'MODE';

export type StatsType = 'COUNT' | AggregateType;

export function doStatsCalculation(data: number[], indicator: StatsType): string | number | undefined {
    // 后端数据可能存在 数据array里是 null或者undefined或者NaN
    let processedData = _compact(data);
    processedData = processedData.map(d => try2ConvertToNumber(d));
    processedData = processedData.filter(d => !isNaN(d));
    // 容错， 后端存在meta里数据却全部丢失的case
    // 这个时候就不显示
    if (!processedData.length) {
        return;
    }
    // http://jstat.github.io/vector.html
    let singleResult: number;
    switch (indicator) {
        case 'COUNT':
            singleResult = processedData.length;
            break;
        case 'MEAN':
            singleResult = jStat.mean(processedData);
            break;
        case 'SUM':
            singleResult = jStat.sum(processedData);
            break;
        case 'MAX':
            singleResult = jStat.max(processedData);
            break;
        case 'MIN':
            singleResult = jStat.min(processedData);
            break;
        case 'STDEV':
            singleResult = jStat.stdev(processedData);
            break;
        case 'MEDIAN':
            singleResult = jStat.median(processedData);
            break;
        case 'QUARTILES':
            singleResult = jStat.quartiles(processedData)[0];
            break;
        case '75':
            singleResult = jStat.quartiles(processedData)[2];
            break;
        case 'QUANTILES':
            const result = jStat.quantiles(processedData, [.25, .75]);
            singleResult = result[1] - result[0];
            break;
        case 'MODE':
            singleResult = jStat.mode(processedData);
            if (_isArray(singleResult)) {
                return singleResult.map((d: number) => d.toLocaleString('us')).join('; ');
            }
            break;
        default:
            throw new Error('Not supported indicator type ' + indicator);
    }
    // 精度3
    return Math.round(singleResult * 1000) / 1000;
}
