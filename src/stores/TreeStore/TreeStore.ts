import {observable, action, computed} from 'mobx';
import {ITreeFileBase} from './interface';
import {TreeFile, TreeFileBase, TreeFolder} from './TreeStoreModels';
import _every from 'lodash/every';
import _remove from 'lodash/remove';

const fakeRootKey = '$$fake_root';

export class TreeStore<TreeFileRawType = any, TreeFolderRawType = any> {
    // 左侧算子搜索栏或者全局搜索
    @observable public searchKey: string = '';
    // 如果是Tree和Menu，openKeys代表当前展开的路径的数组集合
    @observable public openKeys: string[] = [];
    // 有些组件区别selectedKeys和checkedKeys, 比如Tree
    @observable public selectedKeys: string[] = [];
    // 注意selectedKeys和checkedKeys实现的方法内部逻辑是完全一致的
    @observable public checkedKeys: string[] = [];

    protected fakeRoot = new TreeFolder<TreeFileRawType, TreeFolderRawType>({name: fakeRootKey, children: []}, null);

    constructor(initData?: ITreeFileBase[]) {
        if (initData) {
            this.fakeRoot.setChildren(initData);
        }
    }

    // 从api或者组件第一次加载获取，所以参数是接口
    @action
    initFrom(initData: ITreeFileBase[]) {
        this.fakeRoot.setChildren(initData);
    }

    @action
    batchRemove(files: TreeFileBase[]) {
        for (const file of files) {
            this.remove(file);
        }
    }

    @action
    remove(file: TreeFileBase) {
        if (file.parent) {
            _remove(file.parent.children, c => c === file);
        } else {
            throw new Error('Cannot remove root');
        }
    }

    @computed
    get isAllChecked() {
        if (this.visibleElementKeys.length === 0) {
            return false;
        }
        const checkedKeySet = new Set(this.checkedKeys);
        return _every(this.visibleElementKeys, (key) => checkedKeySet.has(key));
    }

    @computed
    get isAllSelected() {
        if (this.visibleElementKeys.length === 0) {
            return false;
        }
        const selectedKeysSet = new Set(this.selectedKeys);
        return _every(this.visibleElementKeys, (key) => selectedKeysSet.has(key));
    }

    private isFileEligible(file: TreeFileBase) {
        return file.searchTitleFunction(file, this.searchKey);
    }

    // 根据searchKey决定哪些元素是在当前searchKey下可见的
    // 比如说用户搜的是文件夹5，那么/a/b/文件夹5/c/d这条路径上的所有元素都可见
    @computed
    get visibleElements() {
        const map: Map<string, TreeFileBase> = new Map();
        for (const file of this.flattened) {
            if (this.isFileEligible(file)) {
                map.set(file.key, file);
            }
        }
        const resultMap: Map<string, TreeFileBase> = new Map();

        for (const value of map.values()) {
            let curr: any = value;
            // 找到路径上所有父元素，除了fake的根节点
            while (curr && curr.key !== fakeRootKey) {
                resultMap.set(curr.key, curr);
                curr = curr.parent;
            }
        }
        return new Set(resultMap.values());
    }

    // visibleElements衍生的便捷函数
    @computed
    get visibleElementKeys() {
        return Array.from(this.visibleElements).map(file => file.key);
    }

    @computed
    get visibleElementKeysSet() {
        return new Set(this.visibleElementKeys);
    }

    /**
     * 衍生自allElementKeys的便捷函数
     * @returns {Set}
     */
    @computed
    get allElementKeysSet() {
        return new Set(this.allElementKeys);
    }

    /**
     * 包含整棵树所有元素的key
     * @returns {any}
     */
    @computed
    get allElementKeys() {
        return Array.from(this.flattenedFiles).map(file => file.key);
    }

    /**
     * checkedKeys中可能包含不在当前searchKey范围内的，所以需要过滤一下
     */
    @computed
    get effectiveCheckedKeys() {
        const visibleElementKeys = this.visibleElementKeysSet;
        return this.checkedKeys.filter((key) => {
            const condition1 = visibleElementKeys.has(key);
            if (!condition1) {
                return false;
            } else {
                const file = this.getByKey(key)!;
                return !file.disabled;
            }
        });
    }

    /**
     * selectedKeys中可能包含不在当前searchKey范围内的，所以需要过滤一下
     */
    @computed
    get effectiveSelectedKeys() {
        const visibleElementKeys = this.visibleElementKeysSet;
        return this.selectedKeys.filter((key) => {
            const condition1 = visibleElementKeys.has(key);
            if (!condition1) {
                return false;
            } else {
                const file = this.getByKey(key)!;
                return !file.disabled;
            }
        });
    }

    // 区别于visibleElements
    // 比如说用户搜的是文件夹5，那么/a/b/文件夹5/c/d这条路径上只展开/a,/a/b,/a/b/文件5三个文件夹
    @computed
    get eligibleOpenKeys() {
        const map: Map<string, TreeFileBase> = new Map();
        for (const file of this.flattened) {
            if (this.isFileEligible(file)) {
                map.set(file.key, file);
            }
        }
        const resultMap: Map<string, TreeFileBase> = new Map();

        for (const value of map.values()) {
            let curr: any = value;
            while (curr) {
                resultMap.set(curr.key, curr);
                curr = curr.parent;
            }
        }
        return Array.from(resultMap.keys());
    }

    // 工具函数：将树状结构扁平化, 方便for循环处理
    @computed
    get flattened() {
        const result: Array<TreeFileBase<TreeFileRawType, TreeFolderRawType>> = [];
        this.traverse(file => {
            result.push(file);
        });
        return result;
    }

    /**
     * 扁平化处理并且只包含文件（不包含文件夹）
     */
    @computed
    get flattenedFiles(): Array<TreeFile<TreeFileRawType>> {
        return this.flattened.filter(f => f instanceof TreeFile) as TreeFile[];
    }

    @computed
    get rootChildren() {
        return this.fakeRoot.children;
    }

    @computed
    get containsAnyFolder() {
        return this.rootChildren.find(c => c instanceof TreeFolder);
    }

    traverse(func: (current: TreeFileBase) => any) {
        const candidates = [...this.rootChildren];
        const result: Array<TreeFileBase<TreeFileRawType, TreeFolderRawType>> = [];
        while (candidates.length > 0) {
            const c = candidates.pop()!;
            if (c instanceof TreeFolder) {
                func(c);
                for (const child of c.children) {
                    candidates.push(child);
                }
            } else {
                func(c);
            }
        }
        return result;
    }

    isElementVisible(element: TreeFileBase) {
        if (this.searchKey === '') {
            return true;
        }
        return this.visibleElements.has(element);
    }

    @action
    public setSearchKey(val: string) {
        this.searchKey = val;
        // this.setCheckedKeys([]);
        // this.setSelectedKeys([]);
        this.setOpenKeys(this.eligibleOpenKeys);
    }

    @action
    public setSelectedKeys(val: string[]) {
        this.selectedKeys = val;
    }

    @action
    public setCheckedKeys(val: string[]) {
        this.checkedKeys = val;
    }

    @action
    public setOpenKeys(val: string[]) {
        this.openKeys = val;
    }

    @action
    selectAll() {
        this.setSelectedKeys(Array.from(this.visibleElementKeysSet));
    }

    @action
    unselectAll() {
        this.setSelectedKeys([]);
    }

    @action
    checkAll() {
        this.setCheckedKeys(Array.from(this.visibleElementKeysSet));
    }

    @action
    uncheckAll() {
        this.setCheckedKeys([]);
    }

    getByKey(key: string): TreeFileBase | undefined {
        return this.flattened.find(file => file.key === key);
    }

    /**
     * 对给定的keys数组，找出所有的TreeBase对象
     * @param {Set<string>} keys
     */
    getAllTreeFileBasesOfKeys(keys: Set<string>) {
        const result: TreeFileBase[] = [];
        this.traverse((file) => {
            if (keys.has(file.key)) {
                result.push(file);
            }
        });
        return result;
    }
}
