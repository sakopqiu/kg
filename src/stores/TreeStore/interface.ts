import {TreeFileBase} from './TreeStoreModels';

export interface ITreeFileBase {
    name: string;
    treeSearchTitleFunction?: TreeSearchTitleFunction; // searchTitle不提供的话，搜索时使用name
}

export type TreeSearchTitleFunction = (treeFileBase: TreeFileBase, searchKey: string) => boolean;

export interface ITreeFolder<TreeFolderRawType = any> extends ITreeFileBase {
    children: ITreeFileBase[];
    rawObject?: TreeFolderRawType;
    key?: string;   // 用户可以提供folder的key，也可以不提供吧
}

export interface ITreeFile<TreeFileRawType = any> extends ITreeFileBase {
    desc: string;
    key: string; // 可用作id
    attributes?: ITreeFileAttribute[]; // 新加入的attributes
    rawObject?: TreeFileRawType; // 也可以传入绑定在TreeFile上的原生数据方便调用方使用
}

export interface ITreeFileAttribute {
    name: string;
    type: string;
    disabled?: boolean;
}
