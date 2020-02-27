import {supportedTypes} from '../../../utils';
import {DimensionInterface} from '../bi-interface';

export interface ColumnDefinition {
    name: string;
    type: supportedTypes;
    skipAnalysis?: boolean; // 如果是id的话就设置为true
}

export interface StatsAnalysisDataset {
    name: string;
    type: string;
    columnDefinitions: ColumnDefinition[];
    rows: Array<Array<string | number | boolean | null | undefined>>;
}

// 比BI控件里的DimensionInterface多一个originalType类型
export interface EDimensionInterface extends DimensionInterface {
    key: string;
    origType: supportedTypes;
    skipAnalysis: boolean;
}
