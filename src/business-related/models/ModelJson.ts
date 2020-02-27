export enum ModelServiceCategory {
    NORMAL = 'normal',
    CV = 'cv',
    EXPERIMENT = 'experiment',
    USER_DEFINED = 'user_defined',
    NOTEBOOK = 'notebook',
}

export enum ModelServiceType {
    NORMAL = 'normal',
}

export enum ApiSocketDataState {
    DOING = 'doing',
    FAIL = 'fail',
    SUCCESS = 'success',
}

export interface ApiSocketData {
    state: ApiSocketDataState;
    information: {
        serviceId: string;
        versionType: string;
        errMessage?: string;
    };
}

export interface IModelServiceJson extends ModelServiceCreationInfo {
    id: string;
    createTime: string;
}

export interface ModelServiceJson {
    author: string;
    createTime: string;
    description: string;
    id: string;
    name: string;
    serviceCategory: string;
    serviceType: string;
}

export interface ModelServiceCreationInfo {
    author: string; // emmmm,,, 后端不应该传递author字段，已反馈
    description?: string;
    name: string;
    serviceCategory: ModelServiceCategory;
    serviceType: ModelServiceType;
}

export interface ModelVersionCreationInfo {
    name: string;
    json?: string;
    description?: string;
    serviceId: string;
    useGpu: boolean;
    envs?: string;
}

export interface ModelVersionInfo extends ModelServiceCreationInfo {
    id: string;
    bundleDir: string;
    command: string;
    createTime: number;
    endpoint: string;
    healthCheck: string;
    image: string;
    input: string;
    optionalEnvs: string;
    port: number;
    requiredEnvs: string;
}

export interface NotebookImageJson {
    createTimestamp: number;
    description: string;
    fullImageUrl: string;
    gpuSupport: boolean;
    id: string;
    imageName: string;
    modifyTimestamp: number;
    userName: string;
    canDelete: boolean;
    shareUser: string[];
    shareGroup: string[];
}
