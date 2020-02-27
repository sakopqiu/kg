export interface JobStateJson {
    state: string;
    error: string;
    start: number;
    end: number;
}

export interface JobUpdateJson {
    path: string;
    id: string;
    pid: string;
    state: JobStateJson;
}
