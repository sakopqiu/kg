import * as React from 'react';
import {ChangeEvent} from 'react';
import {Locales, normalizeType} from '../../utils';
import './index.scss';
import Cascader from 'antd/es/cascader';
import 'antd/es/cascader/style';
import {ISophonTab, SophonTabs} from '../SophonTab';
import {DragSourceMonitor, useDrag} from 'react-dnd';
import classNames from 'classnames';
import {observer} from 'mobx-react-lite';
import {useIfPropsChanged} from '../SophonHooks/hookUtils';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import _uniq from 'lodash/uniq';
import {TreeFile, TreeFileAttribute, TreeFolder} from '../../stores/TreeStore/TreeStoreModels';
import {ITreeFile, ITreeFileBase, ITreeFolder} from '../../stores/TreeStore/interface';

export interface DatasetAttributeSelectorProps {
    datasetTree: ITreeFileBase[]; // 树状结构的数据集
    datasetId?: string; // 在原有的非受控datasetId默认值基础上新增的受控属性
    locale: Locales;
    title: string;
    // 数据集选择发生变化时
    onDatasetChanged: (newDataset: TreeFile | null) => void;
    withSearch?: boolean; // 是否开启搜索功能
}

function DatasetAttributeSelectorFunc(props: DatasetAttributeSelectorProps) {
    const [tab, setTab] = React.useState('string');
    const [data, setData] = React.useState(props.datasetTree);
    const [innerDatasetId, setInnerDatasetId] = React.useState<string>(props.datasetId || '');
    const [keyword, setKeyword] = React.useState<string>('');

    // 如果外部传入的dataset树变了，重绘
    // TODO 如果新的树不包含当前的innerDatasetId，理论上要重新onDatasetChanged
    useIfPropsChanged(props.datasetTree, () => {
        setData(props.datasetTree);
    });

    function changeDataset(newDatasetId: string) {
        const dataset = getDatasetById(newDatasetId);
        props.onDatasetChanged(dataset);
        if (dataset && dataset.attributes.length !== 0) {
            setTab(dataset.attributes[0].type);
        }
    }

    useIfPropsChanged(props.datasetId, () => {
        const newDatasetId = props.datasetId || '';
        setInnerDatasetId(newDatasetId);
        changeDataset(newDatasetId);
    });

    React.useEffect(() => {
        changeDataset(props.datasetId || '');
    }, []);

    // 这个options是给Cascader组件用哪个的，因为保留了rawObject指向原来的文件夹或者数据集
    const antdCascaderOptions = React.useMemo(() => {
        function doMapping(e: ITreeFileBase, parent: TreeFolder | null): any {
            if ((e as ITreeFolder).children) {
                const folder = e as TreeFolder;
                const result: any = {
                    label: folder.name,
                    value: '$folder$' + folder.name,
                    rawObject: folder,
                    parent,
                };
                result.children = folder.children.map((c) => doMapping(c, result));
                return result;
            } else {
                const dataset = e as ITreeFile;
                return {
                    label: dataset.name,
                    value: dataset.key,
                    rawObject: dataset,
                    parent,
                };
            }
        }

        return data.map((d) => doMapping(d, null));
    }, [data]);

    const getCascaderOptionById = React.useCallback((datasetId: string) => {
        let leafNode = null;
        const candidates = [...antdCascaderOptions];
        while (candidates.length > 0) {
            const c = candidates.pop();
            if ((c as any).children) {
                for (const child of (c as any).children) {
                    candidates.push(child);
                }
            } else {
                if (c.value === datasetId) {
                    leafNode = c;
                    break;
                }
            }
        }
        return leafNode;
    }, [antdCascaderOptions]);

    const getDatasetById = React.useCallback((datasetId: string) => {
        const newDatasetWrapper = getCascaderOptionById(datasetId);
        return !!newDatasetWrapper ? newDatasetWrapper.rawObject : null;
    }, [antdCascaderOptions]);

    // 传递给cascader的options对象是一个嵌套结构，该方法通过传入datasetId获取处于深处的描述某个id的数据集的option
    const currentCascaderOption = React.useMemo(() => {
        return getCascaderOptionById(innerDatasetId);
    }, [innerDatasetId, antdCascaderOptions]);

    // 通过datasetOption的parent不断向上遍历，获取一个传递给Cascader的value的数组
    const datasetPath = React.useMemo(() => {
        if (!innerDatasetId) {
            return [];
        }

        const path: string[] = [];
        let curr = currentCascaderOption;
        while (curr) {
            path.unshift(curr.value);
            curr = curr.parent;
        }
        return path;
    }, [innerDatasetId, antdCascaderOptions]);

    // tab展示所有的数据类型
    const tabs: ISophonTab[] = React.useMemo(() => {
        const currentDataset = currentCascaderOption ? currentCascaderOption.rawObject : null;
        let availableAttributeTypes = currentDataset ? currentDataset.attributes.map((attr: TreeFileAttribute) => attr.type) : [];
        availableAttributeTypes = _uniq(availableAttributeTypes);
        if (availableAttributeTypes.length === 0) {
            return [];
        }

        return availableAttributeTypes.map((type: string) => {
            const datasetOption = currentCascaderOption;
            // 可能外部传入的是空的数据集数组
            if (!datasetOption) {
                return {
                    key: type,
                    label: type,
                    content: null,
                };
            }

            const dataset = datasetOption.rawObject as TreeFile;
            const attributes = dataset.attributes.filter((attr: any) => attr.type === type);
            return {
                key: type,
                label: type,
                content: (
                    <div className='dataset-attributes-wrapper'>
                        {attributes.map((f) =>
                            <DatasetAttributeOval
                                disabled={!!f.disabled}
                                tableName={dataset.name}
                                tableId={innerDatasetId}
                                key={f.name}
                                attrName={f.name}
                                type={f.type}
                            />,
                        )}
                    </div>
                ),
            };
        });
    }, [innerDatasetId, antdCascaderOptions]);

    return (
        <div className='dataset-attribute-selector'>
            <div className='dataset-attribute-selector-header'>
                <div>
                    {props.title}
                    <Cascader
                        className='dataset-cascader'
                        value={datasetPath}
                        options={antdCascaderOptions}
                        onChange={path => {
                            const newDatasetId = path[path.length - 1];
                            setInnerDatasetId(newDatasetId);
                            changeDataset(newDatasetId);
                        }}
                    />
                </div>
            </div>
            <div className='dataset-attribute-selector-body'>
                {props.withSearch && <Input
                    value={keyword}
                    onChange={(event: ChangeEvent<any>) => setKeyword(event.target.value)}
                />}
                <SophonTabs
                    tabs={tabs}
                    activeKey={tab}
                    onTabClick={(oldKey, newKey) => {
                        setTab(newKey);
                    }}
                />
            </div>
        </div>
    );
}

interface DatasetAttributeOvalProps {
    tableId: string;
    tableName: string;
    attrName: string;
    type: string;
    disabled: boolean;
}

export function DatasetAttributeOval(props: DatasetAttributeOvalProps) {
    const dragConfig = {
        item: {
            ...props,
            // api返回的某些type可能是decimal(30,10)这样的格式，但是react-dnd的accept只接受常量，因此这里瘦身一下
            type: normalizeType(props.type),
            realType: props.type,
        },
        end: ((dropResult: any, monitor: DragSourceMonitor) => {
            // console.log(dropResult);
            // console.log(monitor.getDropResult());
        }),
        collect: (monitor: DragSourceMonitor) => {
            return {
                isBeingDragged: monitor.isDragging(),
            };
        },
    };
    const [{isBeingDragged}, dragRef] = useDrag(dragConfig);
    return (
        <div className={classNames('dataset-attribute-oval', {isBeingDragged, disabled: props.disabled})} ref={dragRef}>
            {props.attrName}
        </div>
    );
}

export const TypedAttributeSelector = observer(DatasetAttributeSelectorFunc);
