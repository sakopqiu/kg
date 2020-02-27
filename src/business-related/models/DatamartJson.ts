export interface DatamartEntity {
    categoryId: number;
    createdTime: any;
    creatorName: string;
    description: string;
    factDatasetId: string;
    factProjectId: string;
    id: 0;
    name: string;
    primaryKey: string;
}

export interface DatamartEntityTable {
    datasetId: string; // base中对应的数据集
    id: number;
    name: string;
    projectId: string;
}

export interface DatamartEntityDetails {
    entity: DatamartEntity;
    dataTables: DatamartEntityTable[]; // 所有构成这张实体的表
    factDataTable: DatamartEntityTable; // 事实表，即主表
}

interface EntityCommon {
    id: number;
    name: string;
    categoryId: number;
    description: string;
    creatorName: string;
    createdTime: number;
    lastUpdated: number;
}

// 实体指标
export interface EntityMetric extends EntityCommon {
    type: string;
}

// 实体标签
export interface EntityTag extends EntityCommon {

}

export interface EntityMetricsHierarchy {
    id: number;
    name: string;
    parentId: number;
    root: boolean;
    // 指标和标签的文件夹有点特别，要么全部都是文件夹，要么全部都是文件，所以下面的
    // subcategories和features必定不会同时非null
    subcategories: EntityMetricsHierarchy[] | null;
    features: EntityMetric[] | null;
}

export interface EntityTagsHierarchy {
    id: number;
    name: string;
    parentId: number;
    root: boolean;
    subcategories: EntityTagsHierarchy[] | null;
    features: EntityTag[] | null;
}
