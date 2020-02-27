import * as React from 'react';
import {baseInjectHook, BaseInjectHookProps} from '../../business-related/utils';
import {getTranslation} from '../../utils';
import {SophonModal} from '../SophonModal';
import {AttributeMappingStore} from '../TypedAttributeMapping/AttributeMappingStore';
import {IMappingTargetEntry} from '../TypedAttributeMapping/interface';
import './index.scss';
import {AttributeMappingTarget} from '../AttributeMappingTarget/AttributeMappingTarget';
import {ISophonTab, SophonTabs} from '../SophonTab';
import {SearchableTree} from '../TreeTransfer2/SearchableTree/SearchableTree';
import {ITreeFileBase} from '../../stores/TreeStore/interface';
import {TreeFile, TreeFolder} from '../../stores/TreeStore/TreeStoreModels';

export interface ComplexAttributeMappingProps extends BaseInjectHookProps {
    show: boolean;
    onCancel: () => any;
    // 使用者可以自己准备store，如果是这样的话，store中的数据也需要自己准备，如果不提供，那么组件第一次初始化时会生成一个store
    onConfirm: (results: IMappingTargetEntry[]) => any;
    // 左侧供选择的数据集表,key为tab名字
    datasetTreeMap: () => Promise<Map<string, ITreeFileBase[]>>;
    // 右侧待填充的目标条目的初始化值,如果用户没有传入store，使用这个值。如果传入了store，使用store里的值
    targetEntries: IMappingTargetEntry[];
    leftTitle: React.ReactNode;
    rightTitle: React.ReactNode;
    unmappedHint: string;
    folderIconRenderer?: (file: TreeFolder) => React.ReactNode;
    fileIconRenderer?: (file: TreeFile) => React.ReactNode;
    fileRenderer?: (file: TreeFile) => React.ReactNode;
}

const treeStyle = {border: 0};
const leftStyle = {flex: 1, height: '100%', overflow: 'auto'};
const rightStyle = {width: 400};
export const ComplexAttributeMapping = baseInjectHook((props: ComplexAttributeMappingProps) => {
    const locale = props.locale!;
    const storeRef = React.useRef(new AttributeMappingStore());
    const store = storeRef.current;
    // 使用props.targetEntries初始化当前store的条目
    React.useEffect(() => {
        const copy = [];
        for (const entry of props.targetEntries!) {
            copy.push({...entry});
        }

        store.setTargetEntryStates(copy);
    }, [props.targetEntries]);

    const [tabs, setTabs] = React.useState<ISophonTab[]>([]);

    const [tabKey, doSetTabKey] = React.useState('');
    const setTabKey = React.useCallback((oldKey, newKey: string) => {
        doSetTabKey(newKey);
    }, []);

    React.useEffect(() => {
        (async () => {
            const treeMap = await props.datasetTreeMap();
            const tabs: ISophonTab[] = Array.from(treeMap.keys()).map(key => {
                const datasetTree: ITreeFileBase[] = treeMap.get(key)!;
                return {
                    key,
                    label: key,
                    content: <SearchableTree
                        key={key}
                        style={treeStyle}
                        checkable={false}
                        rootFiles={async () => {
                            return datasetTree;
                        }}
                        fileIconRenderer={props.fileIconRenderer}
                        folderIconRenderer={props.folderIconRenderer}
                        fileRenderer={props.fileRenderer}
                        locale={locale}
                    />,
                };
            });
            if (tabs.length !== 0) {
                // 选择第一个key作为初始的activeKey
                doSetTabKey(treeMap.keys().next().value);
            }
            setTabs(tabs);
        })();
    }, []);

    return (
        <SophonModal
            locale={locale}
            title={getTranslation(locale, 'Attribute Mapping')}
            width={1040}
            height={635}
            draggble
            showState={props.show}
            topPadding={100}
            buttonAlign='right'
            cancelOption={{
                showCross: true,
                onCancel: props.onCancel,
            }}
            confirmOption={{
                onConfirm: () => {
                    props.onConfirm(store.targetEntryStates);
                },
            }}

        >
            <div className='complex-attribute-mapping-wrapper'>
                <div style={leftStyle}>
                    <SophonTabs tabs={tabs} onTabClick={setTabKey} activeKey={tabKey}/>
                </div>
                <AttributeMappingTarget
                    style={rightStyle}
                    locale={locale}
                    store={store}
                    title={props.rightTitle}
                    unmappedHint={props.unmappedHint}/>

            </div>
        </SophonModal>
    );

});
