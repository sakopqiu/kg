import * as React from 'react';
import {ITreeFileBase} from '../../stores/TreeStore/interface';
import 'antd/es/tree/style';
import {TreeStore} from '../../stores/TreeStore/TreeStore';
import {TreeFile, TreeFileBase, TreeFolder} from '../../stores/TreeStore/TreeStoreModels';
import {baseInjectHook, BaseInjectHookProps} from '../../business-related/utils';
import {SophonModal} from '../SophonModal';
import './index.scss';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import 'antd/es/checkbox/style';
import {nextEventLoop} from '../../utils';
import {runInAction} from 'mobx';
import {TransferTarget} from './TransferTarget/TransferTarget';
import {TransferRightTreeStore} from '../../stores/TreeStore/TransferRightTreeStore';
import {useLoadingEffect} from '../SophonHooks/LoadingEffect';
import _get from 'lodash/get';
import {SearchableTree} from './SearchableTree/SearchableTree';
export interface TreeTransfer2Props extends BaseInjectHookProps {
    rootFiles: () => Promise<ITreeFileBase[]>;
    rightSideKeys: string[]; // 右侧已经被选中的节点,用于初始化
    rightComponent?: (file: TreeFile) => React.ReactNode;
    modalTitle: string;
    leftPlaceholder?: string;
    leftTitle?: React.ReactNode;
    rightPlaceholder?: string;
    rightTitle?: React.ReactNode;
    rightTitle2?: React.ReactNode;
    height: number;
    onConfirm: (selectedItems: ITreeFileBase[]) => Promise<any>;
    onClose: () => any;
    folderIconRenderer?: (file: TreeFolder) => React.ReactNode;
    fileIconRenderer?: (file: TreeFile) => React.ReactNode;
    callbacks?: {
        // 选中左侧部分keys，并且点击向右时,参数是被选中的对象，返回值是会被移动到右侧的对象（也就是说可以阻止一些对象被移动到右侧）
        // 除此之外，左侧对象的rawObject可能为空，通过这个回调函数初始化也是一个不错的方案
        beforeMovingToRight?: (selectedFileBases: TreeFileBase[]) => TreeFileBase[];
        // 选中右侧部分keys，并且点击向左时,参数是被选中的对象，返回值是会被移动到左侧的对象（也就是说可以阻止一些对象被移动到左侧）
        beforeMovingToLeft?: (selectedFileBases: TreeFileBase[]) => TreeFileBase[];
    };
    modalClassName?: string;
}

export const TreeTransfer2 = baseInjectHook((props: TreeTransfer2Props) => {
    const leftStoreRef: React.MutableRefObject<TreeStore | undefined> = React.useRef(undefined);
    const rightTreeStoreRef = React.useRef(new TransferRightTreeStore());
    const rightStore = rightTreeStoreRef.current;

    const onTreeLoaded = React.useCallback((leftStore: TreeStore) => {
        leftStoreRef.current = leftStore;
        // didMount时将rightSideRootFiles所代表的key的节点在左侧的树中设置为disabled
        runInAction(() => {
            for (const key of props.rightSideKeys) {
                const ele = leftStore.getByKey(key);
                if (ele) {
                    ele.setDisabled(true);
                } else {
                    console.warn(key + '无法找到,可能已经被删除');
                }
            }
            rightStore.initFromStore(leftStore, props.rightSideKeys);
        });
    }, []);

    const transferToRight = React.useCallback(() => {
        const leftStore = leftStoreRef.current;
        if (!leftStore) {
            return;
        }
        // 目前只支持非文件夹级别的移动
        let moveFiles = leftStore.getAllTreeFileBasesOfKeys(new Set(leftStore.effectiveCheckedKeys))
            .filter(f => f instanceof TreeFile);
        if (_get(props.callbacks, 'beforeMovingToRight')) {
            moveFiles = props.callbacks!.beforeMovingToRight!(moveFiles);
        }
        runInAction(() => {
            // 右侧添加左侧对象的copy
            rightStore.addToRoot(moveFiles);
            // 移动到右侧后，左侧也被禁用，防止二次移动
            for (const file of moveFiles) {
                file.setDisabled(true);
            }
        });

    }, []);

    const transferToLeft = React.useCallback(() => {
        const leftStore = leftStoreRef.current;
        if (!leftStore) {
            return;
        }
        let moveFiles = rightStore.getAllTreeFileBasesOfKeys(new Set(rightStore.effectiveCheckedKeys));
        if (_get(props.callbacks, 'beforeMovingToLeft')) {
            moveFiles = props.callbacks!.beforeMovingToLeft!(moveFiles);
        }
        runInAction(() => {
            rightStore.batchRemove(moveFiles);
            for (const file of moveFiles) {
                const fileInLeft = leftStore.getByKey(file.key);
                // 如果反显时，左侧的某个数据被删除了，也不会报错
                if (fileInLeft) {
                    fileInLeft.setDisabled(false);
                }
            }
        });
    }, []);

    const doOnConfirm = React.useCallback(async () => {
        await props.onConfirm(rightStore.rootChildren.map(c => c.toJson()));
        nextEventLoop(() => {
            props.onClose();
        });
    }, [props.onConfirm]);

    const [onConfirm, isConfirming] = useLoadingEffect(doOnConfirm);
    return (
        <SophonModal
            cancelOption={{
                onCancel: props.onClose,
                showCross: true,
            }}
            confirmOption={{
                onConfirm,
            }}
            buttonAlign='right'
            loading={isConfirming}
            className={`sophon-utils tree-transfer2-modal ${props.modalClassName || ''}`}
            height={props.height}
            locale={props.locale!} title={props.modalTitle} noShadow draggble showState>
            <div className='tree-transfer2-wrapper'>
                <SearchableTree
                    className='tree-transfer2-left'
                    checkable={true}
                    rootFiles={props.rootFiles}
                    placeholder={props.leftPlaceholder}
                    title={props.leftTitle}
                    folderIconRenderer={props.folderIconRenderer}
                    fileIconRenderer={props.fileIconRenderer}
                    locale={props.locale!}
                    onTreeLoaded={onTreeLoaded}/>
                <div className='tree-transfer2-buttons'>
                    <Icon type='right' onClick={transferToRight}/>
                    <Icon type='left' onClick={transferToLeft}/>
                </div>
                <div className='tree-transfer-custom-area'>
                    <TransferTarget
                        rightPlaceholder={props.rightPlaceholder}
                        rightTitle={props.rightTitle || ''}
                        rightTitle2={props.rightTitle2}
                        store={rightStore} rightComponent={props.rightComponent}/>
                </div>
            </div>
        </SophonModal>
    );
});
