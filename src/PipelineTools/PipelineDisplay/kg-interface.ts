import {supportedTypes} from '../../utils';
import {Moment} from 'moment';
import {CyNode} from './model/CyNode';
import {CyEdge} from './model/CyEdge';
import {CascaderOptionType} from 'antd/es/cascader';

export interface FieldDataJson {
    fieldName: string;
    fieldValue: string;
    fieldType: string;
}

export type MutationNameType = null | 'null'
    | 'DeleteVertex' | 'AddVertex' | 'DeleteEdge' | 'AddEdge' | 'Edit' | 'MergeNodes';

export interface CommonElementData {
    id: string;
    label: string;
    fieldsMap: { [name: string]: FieldDataJson };
    mutationName?: MutationNameType;
}

export interface VertexDataJson extends CommonElementData {
}

export interface EdgeDataJson extends CommonElementData {
    srcId: string;
    dstId: string;
    color?: string; // 前端需要加上的，和后端返回结果无关
}

// kg返回的一条路径，kg项目会使用
export interface KgPath {
    vertices: VertexDataJson[];
    edges: EdgeDataJson[];
}

export interface GraphDataJson {
    vertices: VertexDataJson[];
    edges: EdgeDataJson[];
    paths: KgPath[];
    meta: GraphMetaJson;
    vertexNumber: number;
    edgeNumber: number;
    resultDataType: 0 | 1; // 0 means showing normal data, 1 means showing content from api response data instead
    content?: string[];
    queryTime?: number;
}

export interface SimpleGraphDataJson {
    vertices: VertexDataJson[];
    edges: EdgeDataJson[];
}

export type Period = 'years' | 'months' | 'weeks';

export interface ITimeDiffConfig {
    onTimelineClicked: (dateTime: Moment) => void;
    earliestDateTime?: Moment;
    defaultPeriod?: Period;
    initialCurrentDateTime?: Moment;
}

export interface GraphFieldMeta {
    fieldName: string;
    fieldType: supportedTypes;
}

export interface GraphElementFields {
    [key: string]: GraphFieldMeta;
}

export interface GraphElementMeta {
    label: string;
    fields: GraphElementFields;
    indexedFields?: string[];
}

export interface GraphVertexMeta extends GraphElementMeta {
    icon?: string;
    latField?: {
        fieldName: string;
        fieldType: supportedTypes;
    };
    lngField?: {
        fieldName: string;
        fieldType: supportedTypes;
    };
    enableLocation?: boolean;
}

export interface GraphEdgeMeta extends GraphElementMeta {
    srcLabel: string;
    dstLabel: string;
}

export interface GraphMetaJson {
    graphName: string;
    vertexMetas: { [index: string]: GraphVertexMeta };
    edgeMetas: { [index: string]: GraphEdgeMeta };
    allTags: string[];
    owner: string;
    approxVertexCount: number;
    approxEdgeCount: number;
}

// 图数据库上内部属性统一规则是前缀有 __
export const innerFieldPrefix: string = '__';
export const arangodbFieldPrefix: string = '__';

// TODO 暂时不管单源最短路径
export enum ArangodbAlgorithmKeyFields {
    __algo_pr = '__algo_pr',
    __algo_wcc = '__algo_wcc',
    __algo_scc = '__algo_scc',
    __algo_hits = '__algo_hits',
    __algo_ec = '__algo_ec',
    __algo_lr = '__algo_lr',
    __algo_lpa = '__algo_lpa',
    __algo_slpa = '__algo_slpa',
}

export enum SparkAlgorithmKeyFields {
    __spark_scc = '__spark_scc',
    __spark_sn = '__spark_sn',
    __spark_pr = '__spark_pr',
    __spark_lpa = '__spark_lpa',
    __spark_kcore = '__spark_kcore',
    __spark_he = '__spark_he',
    __sophon_fr = '__sophon_fr',
    __spark_cc = '__spark_cc',
    __spark_ic = '__spark_ic',
    __spark_odc = '__spark_odc',
    __spark_dc = '__spark_dc',
    __spark_bowtie_in_degrees = '__spark_bowtie_in_degrees',
    __spark_bowtie_out_degrees = '__spark_bowtie_out_degrees',
}

// findPath会返回src和target间多条路径，这个对象代表其中一条
export interface FindPathInnerPath {
    vertices: CyNode[];
    edges: CyEdge[];
}

// TODO, 为了节省时间没有做i18n
const KG_INDUSTRY_TERMS = {
    公司: ['公司名称', '工商注册号', '法人', '注册资本', '注册地址'],
    工商: ['组织机构代码', '营业期限', '登记机关', '经营范围'],
    企业: ['董事长', '董秘', '公司电话', '公司传真', '办公地址', '公司简介', '公司网址', '邮编', '公司邮箱', '主承销商', '发行价格', '上市日期', '股票代码', '板块', '简称'],
    行业门类名称: ['行业名称代码', '国民经济行业代码', '企业性质', '成立日期', '曾用名', '英文名称', '核准日期'],
    人: ['年龄', '性别', '学历', '简介'],
};

// TODO, 为了节省时间没有做i18n
const KG_UNITS = {
    长度: ['千米', '米', '分米', '厘米', '毫米'],
    面积: ['平方千米', '平方米', '平方分米', '平方厘米', '公顷'],
    体积: ['立方米', '升', '毫升'],
    重量: ['顿', '千克', '克', '毫克'],
    时间: ['秒', '分', '时', '天'],
    金额: ['亿', '万元', '元', '角', '分'],
};

let _industryCache: CascaderOptionType[] | null = null;
let _unitCache: CascaderOptionType[] | null = null;

const mapToCascaderOption = (key: string, childs?: string[]): CascaderOptionType => {
    if (!childs) {
        return {label: key, value: key};
    } else {
        return {label: key, value: key, children: childs.map(c => mapToCascaderOption(c))};

    }
};

export function getKgIndustryTermCascaderOptions() {
    if (!_industryCache) {
        _industryCache = Object.keys(KG_INDUSTRY_TERMS).map(key => {
            return mapToCascaderOption(key, KG_INDUSTRY_TERMS[key]);
        });
    }
    return _industryCache!;
}

export function getKgUnitCascaderOptions() {
    if (!_unitCache) {
        _unitCache = Object.keys(KG_UNITS).map(key => {
            return mapToCascaderOption(key, KG_UNITS[key]);
        });
    }
    return _unitCache!;
}
