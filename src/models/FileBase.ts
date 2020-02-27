import {observable, action} from 'mobx';
import {isRootPath, jsonIgnore, PATH_SEPERATOR} from '../utils';
import FsEntityJson from './FsEntity';

export interface SourceStateJson {
    ok: boolean;
    errorMsg: string;
}

@jsonIgnore('isNew')
export default class FileBase {
    @observable fileChildren: FileBase[] = [];
    @observable createTimestamp: number;
    @observable description: string = '--';
    @observable folder: boolean;
    @observable modifyTimestamp: number;
    @observable name: string;
    @observable path: string;
    @observable rootPath: string = '';
    @observable isNew: boolean;
    @observable status?: SourceStateJson;
    @observable thumbNail?: string;

    constructor(apiData: FsEntityJson) {
        this.name = apiData.name;
        this.path = apiData.path;
        this.createTimestamp = apiData.createTimestamp;
        this.description = apiData.description || '--';
        this.modifyTimestamp = apiData.modifyTimestamp;
        this.isNew = false;
        this.thumbNail = apiData.thumbNail;
    }

    @action
    setThumbnail(val: string) {
        this.thumbNail = val;
    }

    @action
    setStatus(s: SourceStateJson) {
        this.status = s;
    }

    @action
    setIsNew(isNew: boolean) {
        this.isNew = isNew;
    }

    // 大部分api返回的根目录是""，而特征返回的是/
    @action
    forceUpdateRootPath(rootPath: string) {
        this.rootPath = rootPath;
    }

    isFolder() {
        return this.folder;
    }

    get isRoot() {
        return isRootPath(this.path);
    }

    hasContents() {
        return this.isFolder() && this.fileChildren.length > 0;
    }

    parentPath() {
        if (isRootPath(this.path)) {
            return '';
        }
        const paths = this.path.split(PATH_SEPERATOR);
        let result = paths.slice(0, paths.length - 1).join(PATH_SEPERATOR);
        if (result === '') {
            result = this.rootPath;
        }
        return result;
    }

    @action
    setChildren(c: FileBase[]) {
        this.fileChildren = c;
    }

    @action
    setName(name: string) {
        this.name = name;
    }

    @action
    setPath(path: string) {
        this.path = path;
    }
}
