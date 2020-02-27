export const GLOBAL_PALETTE = [
    '#589FE7',
    '#F6D279',
    '#DF6B92',
    '#80CEAF',
    '#84c0f5',
    '#ffe9a6',
    '#eb96af',
    '#abdbc6',
    '#407dc2',
    '#cfaa5b',
    '#b84f75',
    '#60a88e',
];

export type DimensionType = 'ordinal' // 对于类目、文本这些 string 类型的数据，如果需要能在数轴上使用，须是 'ordinal' 类型
    | 'number' // 默认，表示普通数据。
    | 'time' // 表示时间数据。设置成 'time' 则能支持自动解析数据成时间戳
    | 'float' // 本质和number一致，但是会使用TypedArray实现存储空间优化
    | 'int'; // 本质和number一致，但是会使用TypedArray实现存储空间优化

export interface DimensionInterface {
    type: DimensionType;
    name: string;
}

export type DimensionName = string;
export type Dimension = DimensionInterface | DimensionName;

export type encodeType = string // "Population"
    | string[]; // ["Population", "Income"]

export type SophonEchartDatasetRow = Array<string | number | boolean | null | undefined>;

// 模拟一个数据集
// 如人
/*
 id name age
 0  a    20
 1  b    30
*/
export interface SophonEchartDataset {
    /*
        定义列名，列名有两种格式
        格式1， 直接为string，这种情况下type自动判定为ordinal
        格式2， {type: DimensionType, name: string}
        上面这个数据集，dimensions可以定义为
        dimensions: [
        {name:"id", type:"ordinal" //如果不定义为ordinal，则会被识别为number},
        "name",
        {name:"age",type:"int"},
        ]
     */
    name?: string;
    // 多行数据，每行数据的每列对应dimensions中的定义
    dimensions: Dimension[];
    // 每行代表一条记录，每个记录的每列数据和dimension中对应列一一对应
    // 必须保证记录的列长度和dimension的长度是一致的
    source: SophonEchartDatasetRow[];
}
