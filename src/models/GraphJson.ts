import {JobStateJson} from '../models/SocketEventData';

export interface IGraphAlgorithmQueryJson {
    algo: string;
    fieldName: string;
    params: { [index: string]: string };
}

export enum GraphJobState {
    SENT = 'SENT',
    RUNNING = 'RUNNING',
    QUEUED = 'QUEUED',
    STARTED = 'STARTED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
    SUCCEEDED = 'SUCCEEDED',
}

export interface IGraphJobState extends JobStateJson {
    state: GraphJobState;
}

export interface IGraphJobJson {
    algos: string[];
    branchId: string;
    id: string;
    state: IGraphJobState;
}

export interface IGraphRunAlgoQueryJson {
    branchId: string;
    algos: IGraphAlgorithmQueryJson[];
}

export interface IGraphPregelQueryJson {
    branchId: string;
    algorithm: string;
    params: Record<string, any>;
}
