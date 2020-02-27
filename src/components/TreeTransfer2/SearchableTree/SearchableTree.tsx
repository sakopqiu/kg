import * as React from 'react';
import {getTranslation, Locales} from '../../../utils';
import './index.scss';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import Checkbox from 'antd/es/checkbox';
import 'antd/es/checkbox/style';
import Tree from 'antd/es/tree';
import 'antd/es/tree/style';
import {TreeStore} from '../../../stores/TreeStore/TreeStore';
import {ITreeFileBase} from '../../../stores/TreeStore/interface';
import {useLoadingEffect} from '../../SophonHooks/LoadingEffect';
import {CenteredSpin} from '../../CenteredSpin/CenteredSpin';
import {TreeFile, TreeFileBase, TreeFolder} from '../../../stores/TreeStore/TreeStoreModels';
import {baseInjectHook} from '../../../business-related/utils';

const defaultFolderIcon = <Icon type={'folder'}/>;
const defaultFileIcon = <Icon type={'file'}/>;
const Search = Input.Search;
const {TreeNode} = Tree;

export interface SearchableTreeProps {
    style?: React.CSSProperties;
    className?: string;
    title?: React.ReactNode;
    title2?: React.ReactNode; // 位于全选按钮右侧的内容
    placeholder?: string;
    store?: TreeStore; // 用户可以外部提供store
    rootFiles?: () => Promise<ITreeFileBase[]>; // 如果用户没有提供吧store，数据从rootFiles提供
    locale: Locales;
    onTreeLoaded?: (store: TreeStore) => any;
    folderIconRenderer?: (file: TreeFolder) => React.ReactNode;  // 参见antd Icon能使用的图标
    fileIconRenderer?: (file: TreeFile) => React.ReactNode;  // 参见antd Icon能使用的图标
    folderRenderer?: (file: TreeFolder) => React.ReactNode;
    fileRenderer?: (file: TreeFile) => React.ReactNode;
    checkable: boolean;
}

export const SearchableTree = baseInjectHook((props: SearchableTreeProps) => {
    const treeStoreRef = React.useRef(props.store || new TreeStore());
    const store = treeStoreRef.current;
    const setSearchKey = React.useCallback((e: any) => {
        store.setSearchKey(e.target.value);
    }, [props.rootFiles]);
    const toggleCheckAll = React.useCallback((e: any) => {
        e.target.checked ? store.checkAll() : store.uncheckAll();
    }, []);

    const onExpandKeys = React.useCallback((keys: string[]) => {
        store.setOpenKeys(keys);
    }, []);

    const onSelectedKeys = React.useCallback((keys: string[]) => {
        store.setSelectedKeys(keys);
    }, []);

    const onCheckKeys = React.useCallback((keys: string[]) => {
        store.setCheckedKeys(keys);
    }, []);

    const doLoadTree = React.useCallback(async () => {
        if (!props.store) {
            const initTreeDData = await props.rootFiles!();
            store.initFrom(initTreeDData);
        }
    }, []);
    const [loadTree, isTreeLoading] = useLoadingEffect(doLoadTree);
    const [treeLoaded, setTreeLoaded] = React.useState(false);

    const renderTreeNode = React.useCallback((file: TreeFileBase) => {
        // 不符合搜索条件的
        if (!store.isElementVisible(file)) {
            return null;
        }
        const folderIcon = props.folderIconRenderer ? props.folderIconRenderer(file as TreeFolder) : defaultFolderIcon;
        if (file instanceof TreeFolder) {
            const children = file.children.map(renderTreeNode).filter(c => !!c);
            const title = props.folderRenderer ? props.folderRenderer(file) : file.name;
            if (children.length === 0) {
                return <TreeNode icon={folderIcon} title={title} key={file.key} disabled={file.disabled}/>;
            }
            return (
                <TreeNode icon={folderIcon} title={file.name} key={file.key} disabled={file.disabled}>
                    {children}
                </TreeNode>
            );
        } else {
            const fileIcon = props.fileIconRenderer ? props.fileIconRenderer(file as TreeFile) : defaultFileIcon;
            const title = props.fileRenderer ? props.fileRenderer(file as TreeFile) : file.name;
            return <TreeNode title={title} icon={fileIcon} key={file.key} disabled={file.disabled}/>;
        }
    }, [props.rootFiles]);

    React.useEffect(() => {
        (async () => {
            // 先加载左侧的树
            await loadTree();
            setTreeLoaded(true);
            if (props.onTreeLoaded) {
                props.onTreeLoaded(store);
            }
        })();
    }, []);

    return (
        <div className={`searchable-tree ${props.className || ''}`} style={props.style || {}}>
            {props.title || null}
            <Search placeholder={props.placeholder}
                    value={store.searchKey} onChange={setSearchKey}/>
            {props.checkable && <div className='select-all-checkbox'>
                <Checkbox checked={store.isAllChecked} onChange={toggleCheckAll}>
                    {getTranslation(props.locale, 'Select All')}
                </Checkbox>
                {props.title2}
            </div>}
            {isTreeLoading && <CenteredSpin locale={props.locale!} size={'default'} style={{zIndex: 1}}/>}
            {treeLoaded &&
            <Tree checkable={props.checkable}
                  showIcon
                  className={store.containsAnyFolder ? '' : 'no-folder'}
                  expandedKeys={store.openKeys}
                  selectedKeys={store.selectedKeys}
                  checkedKeys={store.checkedKeys}
                  onCheck={onCheckKeys}
                  onSelect={onSelectedKeys}
                  onExpand={onExpandKeys}>
                {store.rootChildren.map(renderTreeNode).filter(n => !!n)}
            </Tree>
            }
        </div>
    );
});
