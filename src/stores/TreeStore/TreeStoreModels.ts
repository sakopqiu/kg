import {action, observable} from 'mobx';
import {getHierarchyFromString, PATH_SEPARATOR2} from '../../utils';
import {ITreeFile, ITreeFileBase, ITreeFolder, TreeSearchTitleFunction} from './interface';

export function defaultSearchTitleImpl(treeFileBase: TreeFileBase, searchKey: string) {
    return treeFileBase.name.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1;
}

export abstract class TreeFileBase<TreeFileRawType = any, TreeFolderRawType = any> {
    @observable disabled = false;
    name: string = '';

    // 用于筛选时比较的title，默认和name一致
    searchTitleFunction: TreeSearchTitleFunction = defaultSearchTitleImpl;

    constructor(json: ITreeFileBase, public parent: TreeFolder<TreeFileRawType, TreeFolderRawType> | null) {
        this.name = json.name;
        // 默认情况下searchTitle和name相同，用户也可以通过传递最后一个searchTitle参数来改变这个行为
        if (json.treeSearchTitleFunction) {
            this.searchTitleFunction = json.treeSearchTitleFunction;
        }
    }

    static clone(src: TreeFileBase, newParent: TreeFolder | null) {
        if (src instanceof TreeFile) {
            return TreeFile.clone(src, newParent);
        } else if (src instanceof TreeFolder) {
            return TreeFolder.clone(src, newParent);
        }
        throw new Error('Not possible');
    }

    @action
    setDisabled(val: boolean) {
        this.disabled = val;
    }

    // 用于Tree中的key属性
    abstract get key(): string;

    // 如果组名是A/B/C,那么返回A/B/C/,A/B, A
    get groupHierarchy() {
        return getHierarchyFromString(this.key, PATH_SEPARATOR2);
    }

    abstract toJson(): any;
}

export class TreeFolder<TreeFileRawType = any, TreeFolderRawType = any> extends TreeFileBase {

    @observable children: Array<TreeFileBase<TreeFileRawType, TreeFolderRawType>> = [];
    @observable loading = false;
    json: ITreeFolder<TreeFolderRawType>;
    rawObject: TreeFolderRawType;

    private _cachedKey = '';

    get key() {
        if (this._cachedKey) {
            return this._cachedKey;
        }
        let result = this.name;
        let parent = this.parent;
        while (parent) {
            result = parent.name + PATH_SEPARATOR2 + result;
            parent = parent.parent;
        }
        this._cachedKey = result;
        return result;
    }

    @action
    setLoading(val: boolean) {
        this.loading = val;
    }

    static clone(src: TreeFolder, newParent: TreeFolder | null): TreeFolder {
        throw new Error('not implemented');
    }

    constructor(json: ITreeFolder, parent: TreeFolder | null) {
        super(json, parent);
        this.setChildren(json.children);
        this.json = json;
        this.rawObject = json.rawObject;
        if (json.key) {
            this._cachedKey = json.key;
        }
    }

    setChildren(children: ITreeFileBase[]) {
        for (const c of children) {
            // if child is another folder
            if ((c as ITreeFolder).children) {
                const folder = c as ITreeFolder<TreeFolderRawType>;
                this.children.push(new TreeFolder(folder,
                    this));
            } else {
                const child = c as ITreeFile<TreeFileRawType>;
                this.children.push(new TreeFile(child, this));
            }
        }
    }

    toJson(): any {
        return {
            disabled: this.disabled,
            name: this.name,
            key: this.key,
            children: this.children.map(c => c.toJson()),
            rawObject: this.rawObject,
        };
    }
}

export class TreeFileAttribute {
    public constructor(public name: string, public type: string, public disabled: boolean) {
    }
}

export class TreeFile<TreeFileRawType = any> extends TreeFileBase {
    attributes: TreeFileAttribute[] = [];
    rawObject: TreeFileRawType;
    json: ITreeFile<TreeFileRawType>;
    desc: string = '';
    private _key: string = '';

    constructor(json: ITreeFile, parent: TreeFolder<TreeFileRawType> | null) {
        super(json, parent);
        this._key = json.key;
        this.desc = json.desc;
        this.attributes = [];
        this.json = json;
        this.rawObject = json.rawObject;
        for (const attr of (json.attributes || [])) {
            this.attributes.push(new TreeFileAttribute(attr.name, attr.type, !!attr.disabled));
        }
    }

    get key() {
        return this._key;
    }

    static clone(src: TreeFile, newParent: TreeFolder | null) {
        const newTreeFile = new TreeFile(src, src.parent);
        newTreeFile.disabled = src.disabled;
        newTreeFile.parent = newParent;
        return newTreeFile;
    }

    toJson() {
        return {
            disabled: this.disabled,
            name: this.name,
            key: this.key,
            desc: this.desc,
            rawObject: this.rawObject,
        };
    }
}
