import * as React from 'react';
import {getTranslation, Locales, showMessage} from '../../utils';
import {TypedAttributeSelector} from '../TypedAttributeSelector/TypedAttributeSelector';
import {SophonModal} from '../SophonModal';
import {AttributeMappingTarget} from '../AttributeMappingTarget/AttributeMappingTarget';
import './index.scss';
import {AttributeMappingStore} from './AttributeMappingStore';
import {observer} from 'mobx-react-lite';
import _find from 'lodash/find';
import {IMappingTargetEntry} from './interface';
import invariant from 'invariant';
import {ITreeFileBase} from '../../stores/TreeStore/interface';
import {TreeFile, TreeFolder} from '../../stores/TreeStore/TreeStoreModels';

export interface DatasetAttributeMappingProps {
    locale: Locales;
    // 使用者可以自己准备store，如果是这样的话，store中的数据也需要自己准备，如果不提供，那么组件第一次初始化时会生成一个store
    store?: AttributeMappingStore;
    // 左侧供选择的数据集表
    datasetTree: ITreeFileBase[];
    // 右侧待填充的目标条目的初始化值,如果用户没有传入store，使用这个值。如果传入了store，使用store里的值
    targetEntries?: IMappingTargetEntry[];
    // 目标条目未映射上时的提示信息
    unmappedHint: string;
    leftTitle: string; // 左侧表选择的标题
    rightTitle: string; // 右侧属性target的标题
    onCancel: () => any;
    // 点击确定时，将右侧待填充条目的当前状态作为参数返回
    onConfirm: (results: IMappingTargetEntry[]) => any;
    show: boolean;
    singletonMode?: boolean; // 在singleton模式下，如果一个attribute被选择过了，不能再次被选择
    fromMultipleDatasets?: boolean; // 映射的数据是否支持来自多张表，如果是的话，切换数据集的时候不会清空现有映射
}

function DatasetAttributeMappingFunc(props: DatasetAttributeMappingProps) {
    const locale = props.locale;
    const storeRef = React.useRef(props.store || new AttributeMappingStore());
    const store = storeRef.current;
    (window as any).ds = store;
    const defaultDataset = _find(props.targetEntries, e => !!e.defaultTableId);
    const defaultDatasetId = defaultDataset ? defaultDataset.defaultTableId : '';

    // 如果用户没有提供外部store，使用props.targetEntries初始化当前store的条目
    React.useEffect(() => {
        if (!props.store) {
            invariant(props.targetEntries, 'props.store和props.targetEntries必须提供一个');
            const copy = [];
            for (const entry of props.targetEntries!) {
                copy.push({...entry});
            }

            store.setTargetEntryStates(copy);
        }
    }, []);

    let files = props.datasetTree;

    function disableSomeFields(file: ITreeFileBase) {
        if ((file as TreeFolder).children) {
            for (const child of (file as TreeFolder).children) {
                disableSomeFields(child);
            }
        } else {
            const dataset = file as TreeFile;
            for (const attr of dataset.attributes) {
                attr.disabled = !store.isAttributeAvailable(dataset.key, attr);
            }
        }
    }

    if (props.singletonMode) {
        for (const file of files) {
            disableSomeFields(file);
        }
        files = [...files];
    }

    const [currentSelectedDataset, setCurrentSelectedDataset] = React.useState<TreeFile | null>(null);

    const autoMapping = {
        text: getTranslation(locale, 'Auto Mapping'),
        onClick: () => {
            if (currentSelectedDataset) {
                store.autoMapping(currentSelectedDataset);
            }
        },
    };

    const firstTime = React.useRef(true);

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
            <div className='attribute-mapping-wrapper'>
                <TypedAttributeSelector
                    datasetId={defaultDatasetId}
                    onDatasetChanged={(dataset: TreeFile | null) => {
                        setCurrentSelectedDataset(dataset);
                        if (!props.fromMultipleDatasets && !firstTime.current) {
                            store.startFromBrandNewMappingsEntries();
                            showMessage(getTranslation(locale, 'Mappings are reset as dataset has changed'));
                        }
                        firstTime.current = false;
                    }}
                    title={props.leftTitle} datasetTree={files} locale={locale}/>
                <AttributeMappingTarget
                    locale={locale}
                    store={store}
                    title={props.rightTitle}
                    extraBatchOption={autoMapping}
                    unmappedHint={props.unmappedHint}/>
            </div>
        </SophonModal>
    );

}

export const TypedAttributeMapping = observer(DatasetAttributeMappingFunc);
