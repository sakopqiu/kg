import * as React from 'react';
import './index.scss';
import {baseInjectHook, BaseInjectHookProps} from '../../../business-related/utils';
import {TransferRightTreeStore} from '../../../stores/TreeStore/TransferRightTreeStore';
import {SearchableTree} from '../SearchableTree/SearchableTree';
import {TreeFile} from 'stores/TreeStore/TreeStoreModels';

export interface TransferTargetProps extends BaseInjectHookProps {
    store: TransferRightTreeStore;
    rightPlaceholder?: string;
    rightTitle?: React.ReactNode;
    rightTitle2?: React.ReactNode; // 全选右侧的内容
    rightComponent?: (file: TreeFile) => React.ReactNode;
}

export const TransferTarget = baseInjectHook((props: TransferTargetProps) => {
    const treeStore = props.store;

    return (
        <div className='entity-transfer-target'>
            <SearchableTree
                className={treeStore.containsAnyFolder ? 'transfer-target-right-tree' : 'transfer-target-right-tree no-folder'}
                checkable={true}
                store={treeStore}
                placeholder={props.rightPlaceholder}
                title={props.rightTitle}
                title2={props.rightTitle2}
                fileRenderer={props.rightComponent}
                locale={props.locale!}
            />
        </div>
    );
});
