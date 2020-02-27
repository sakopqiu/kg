export interface IPreviewCreateJson {
    stream_location: string;
}

export interface IPreviewJson {
    preview_id: string;
    preview_url: string;
    refresh?: boolean;
}

export interface IReplayCreateJson {
    heartbeat_enabled: boolean;
    record_id: string;
    replay_rate: number;
    seektime: number;
    status: number;
}

export interface IReplayJson {
    replay_id: string;
    replay_url: string;
    refresh?: boolean; // 内部用
}

export interface IModifyReplayRequestJson {
    replay_id: string;
    replay_rate?: number;
    seektime?: number;
    status?: number;
}

export interface IRecordSegmentJson {
    start_time: number;
    stop_time: number;
}

export interface IReplayPingJson {
    replay_id: string;
    timestamp: number;
}

export interface IPreviewPingJson {
    preview_id: string;
    timestamp: number;
}
