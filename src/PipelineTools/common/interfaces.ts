import {EntityJson, Locales} from '../../utils';
import {CanvasStore} from './CanvasStore';

export interface ICanvasContextCommon {
    locale: Locales;
    statusArea?: (activeStore: CanvasStore | null) => React.ReactNode; // 左下角的状态栏，可以用户自定义
    extraBottomTool?: React.ReactNode;
    fieldAlias?: (str: string) => string;
}

export interface IParamsContainer {
    [key: string]: any;
}

export interface BlueprintFieldSchemaJson {
    fieldName: string;
    fieldNameInDF: string;
    fieldType?: string;
    isCustom: boolean;
    necessary: boolean; // 模板功能中如果为true，则用户必填
    metaData: Record<string, any> | null; // 这个field上是否有其他额外信息，通过key/value对的形式传入
}

export interface KeyedBlueprintFieldSchemaJson {
    [key: string]: BlueprintFieldSchemaJson;
}

export interface VertexMap {
    [key: string]: BlueprintVertexSchemaJson;
}

export interface EdgeMap {
    [key: string]: BlueprintEdgeSchemaJson;
}

export interface BlueprintEntrySchemaJson {
    id: string;
    label: string;
    indexedFields: KeyedBlueprintFieldSchemaJson;
    fields: KeyedBlueprintFieldSchemaJson;
    sourceId?: string; // 蓝图模板的返回值里可能没有sourceId
    fromTemplate?: boolean; // 某一个节点或者边是否是来自模板
    bpType?: BlueprintType;
    metaData: Record<string, any>; // 额外信息存储在这里
}

// api存的数据结构
export interface BlueprintVertexSchemaJson extends BlueprintEntrySchemaJson {
    idField: BlueprintFieldSchemaJson;
    nameField: BlueprintFieldSchemaJson;
    lngField?: BlueprintFieldSchemaJson;
    latField?: BlueprintFieldSchemaJson;
    enableLocation?: boolean;
    x: number;
    y: number;
    icon: string;
}

export interface BlueprintEdgeSchemaJson extends BlueprintEntrySchemaJson {
    srcVertexLabel: string;
    dstVertexLabel: string;
    srcIdField: BlueprintFieldSchemaJson;
    dstIdField: BlueprintFieldSchemaJson;
}

export interface BlueprintJson extends EntityJson {
    desc: string;
    vertexMap: VertexMap | null;
    edgeMap: EdgeMap | null;
    pid: string;
    pipelineUI: string;
    debug?: boolean;
    meta?: any;
    from: string | null;
    branches?: BlueprintBranchJson[];
    isTemplate: boolean; // 是否是蓝图模板
}

export enum BlueprintType {
    DATASET = 'dataset',
    DATAMART = 'datamart',
}

export enum AuthorizationCode {
    ReadAndWrite = 6,
}

export interface BlueprintBranchMember {
    user: string;
    authorityCode: AuthorizationCode;
}

export interface BlueprintBranchJson extends EntityJson {
    appliedAlgos: string[];
    blueprintId: string;
    bpSnapShot?: any;
    desc?: string;
    from?: any;
    meta?: BlueprintBranchMetaJson;
    owner: string;
    publish: boolean;
    url: string;
    members: BlueprintBranchMember[]; // post的时候是object，返回变成了array of object...
}

export interface BlueprintBranchMetaJson {
    graphName: string;
    vertexMetas: EleMetaJson;
    edgeMetas: EleMetaJson;
    allTags: string[];
    owner: string;
    approxVertexCount: number;
    approxEdgeCount: number;
}

export interface EleMetaJson {
    empty: boolean;
    traversableAgain: boolean;
}
