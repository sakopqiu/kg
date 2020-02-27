import {action} from 'mobx';
import {TreeFile, TreeFileBase} from './TreeStoreModels';
import {TreeStore} from './TreeStore';

export class TransferRightTreeStore<TreeFileRawType = any, TreeFolderRawType = any> extends TreeStore<TreeFileRawType, TreeFolderRawType> {

    // 用于右侧反显,目前右侧只支持文件类型
    @action
    initFromStore(refStore: TreeStore, keys: string[]) {
        const elements: TreeFile[] = keys.map(key => {
            const nodeInRefStore = refStore.getByKey(key);
            if (nodeInRefStore) {
                return nodeInRefStore as TreeFile;
            } else {
                console.warn(key + '无法找到,可能已被删除');
                return null;
            }
        }).filter(r => !!r) as TreeFile[];
        this.addToRoot(elements);
    }

    // transfer框从左传送到右，所以已经是反序列化后的TreeFileBase对象了
    @action
    addToRoot(files: TreeFileBase[], clone = true) {
        files = files.map(f => {
            if (!clone) {
                return f;
            } else {
                const newFile = TreeFileBase.clone(f, this.fakeRoot);
                newFile.disabled = false;
                return newFile;
            }
        });
        this.fakeRoot.children.push(...files);
    }
}
