import SophonFile from './SophonFile';
import {ObservableMap, observable, action} from 'mobx';

export interface IPipelineParent {
    id?: string;
    name?: string;
}

export abstract class SimplePipelineModel extends SophonFile {
    public pipelineName: string;
    public pipelineId: string;
    public parents?: IPipelineParent[]; // [{id: grandParent, name: grandParent}, {id: parent, name: parent}] etc...
    firstTimeRender: boolean = true;

    // 用于辅助开发的临时状态map，不会被序列化
    @observable tempMap: ObservableMap<any, any> = new ObservableMap<any, any>();
    // 用于辅助开发的临时状态map，不会被序列化,也不响应mobx
    easyTempMap: ObservableMap<any, any> = new ObservableMap<any, any>();

    constructor(path: string, name: string) {
        super({name, path} as any);
        this.pipelineName = name;
        this.pipelineId = path;
    }

    get canonicalName() {
        return (this.parents || [])
            .filter((parent) => parent.name)
            .map((parent) => parent.name)
            .concat([this.pipelineName]).join('/');
    }

    @action
    setTempConfig(key: any, value: any) {
        this.tempMap.set(key, value);
    }

    getTempConfig(key: any) {
        return this.tempMap.get(key);
    }

    @action
    deleteTempConfig(key: any) {
        return this.tempMap.delete(key);
    }

    setEasyTempConfig(key: any, value: any) {
        this.easyTempMap.set(key, value);
    }

    getEasyTempConfig(key: any) {
        return this.easyTempMap.get(key);
    }

    deleteEasyTempConfig(key: any) {
        return this.easyTempMap.delete(key);
    }

}
