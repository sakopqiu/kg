import React, {ChangeEvent, useCallback, useMemo, useState} from 'react';
import Tree, {TreeProps} from 'antd/es/tree';
import Search from 'antd/es/input/Search';
import 'antd/es/input/style';
import 'antd/es/tree/style';
import {TreeNodeNormal} from 'antd/es/tree/Tree';
import './index.scss';

export interface SearchTreeNodeNormal extends Pick<TreeNodeNormal, Exclude<keyof TreeNodeNormal, 'children'>> {
    // 该字段声明表示搜索的时候按照这个字段来search
    // 引入这个字段是因为 TreeNodeNormal title 可以是React.ReactNode 类型没办法search
    // 不给值， 默认 1） 如果 title是string类型 就是 title 2） 如果不是 就是key
    textToSearch?: string;
    children?: SearchTreeNodeNormal[];
}

// 使用该组件目前只支持传递treeData, 不支持children
interface ISophonSearchTreeProps extends
    Pick<TreeProps, Exclude<keyof TreeProps,
        'children' | 'onExpand' | 'expandedKeys' | 'treeData'>> {
    treeHeader?: React.ReactNode;
    searchPlaceholder?: string;
    treeData: SearchTreeNodeNormal[]; // 强制用props模式
}

interface TreeNodeIdentifier {
    key: string;
    title: string;
    parentKey?: string;
}

interface TreeNodeNormalWithParentKey extends SearchTreeNodeNormal {
    parentKey?: string;
}

function getPlainSearchText(node: SearchTreeNodeNormal) {
    if (!node.textToSearch) {
        if (typeof node.title === 'string') {
            return node.title;
        } else {
            return node.key;
        }
    } else {
        return node.textToSearch;
    }
}

function generateTreeDataKeys(data: SearchTreeNodeNormal[]): TreeNodeIdentifier[] {
    const result: TreeNodeIdentifier[] = [];
    let queue: TreeNodeNormalWithParentKey[] = [...data];
    while (!!queue.length) {
        const current = queue.shift()!;
        if (current.children && !!current.children.length) {
            queue = queue.concat(current!.children.map(c => ({...c, parentKey: current.key})));
        }
        result.push({key: current.key, title: getPlainSearchText(current), parentKey: current.parentKey});
    }
    return result;
}

// 使用该组件目前只支持传递treeData, 不支持children
export function SophonSearchTree(props: ISophonSearchTreeProps) {
    const {
        className,
        searchPlaceholder,
        treeHeader,
        treeData,
        defaultExpandedKeys,
        defaultExpandParent,
        autoExpandParent,
        ...rest
    } = props;
    const [innerExpandedKeys, setInnerExpandedKeys] = useState<string[]>(defaultExpandedKeys || []);
    const [innerAutoExpandParent, setInnerAutoExpandParent] = useState(defaultExpandParent);
    const nodeIdentifiers = useMemo(() => {
        return generateTreeDataKeys(treeData || []);
    }, [treeData]);
    const onExpand = useCallback((keys: string[]) => {
        setInnerExpandedKeys(keys);
        setInnerAutoExpandParent(false);
    }, []);
    function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        if (value) {
            const nextExpandedKeys = nodeIdentifiers.reduce((result: string[], identifier) => {
                if (identifier.parentKey && identifier.title.indexOf(value) > -1) {
                    result.push(identifier.parentKey);
                }
                return result;
            }, []);
            setInnerExpandedKeys(nextExpandedKeys);
            setInnerAutoExpandParent(true);
        } else {
            setInnerExpandedKeys([]);
            setInnerAutoExpandParent(false);
        }
    }
    return (
        <div className={'sophon-search-tree'}>
            <Search
                className={'search-input'}
                placeholder={searchPlaceholder}
                onChange={onSearchChange} />
            <div
                className={'tree-container'}
            >
                <div className={'tree-header'}>
                    {treeHeader}
                </div>
                <Tree
                    className={`search-tree-content ${className || ''}`}
                    treeData={treeData}
                    onExpand={onExpand}
                    expandedKeys={innerExpandedKeys}
                    autoExpandParent={!!autoExpandParent || innerAutoExpandParent}
                    {...rest}
                />
            </div>
        </div>
    );
}
