import * as React from 'react';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import Popconfirm from 'antd/es/popconfirm';
import 'antd/es/popconfirm/style';
import './index.scss';
import EdgeCommonParams from './params/EdgeCommonParams';
import NodeSummary from './CanvasMetaInfo/NodeSummary';
import {EdgeSummary} from './CanvasMetaInfo/EdgeSummary';
import NodeParams from './params/NodeParams';
import {EdgeGroupStats} from './edge/EdgeGroupStats/EdgeGroupStats';
import {useCallback, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {FilterContext} from './filter/FilterContext';
import {ElementAttributeViewerProps, ElementType} from '../../../interfaces';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import {CyType} from '../../../model/CyElement';
import {CyNodeData} from '../../../model/CyNode';
import {CyEdgeData} from '../../../model/CyEdge';
import {getTranslation} from '../../../../../utils';
import {LoadingTargets} from '../../../../../stores/LoadableStoreImpl';
import {CyEdgeGroupData} from '../../../model/CyEdgeGroup';

function ElementAttributeViewer(props: ElementAttributeViewerProps & { mainStore: DisplayModeCanvasStore }) {
    const filterState = useState('');
    const mainStore = props.mainStore;
    const service = mainStore.canvasDrawService;
    const cy = service.stateService.cy;
    const cyState = service.stateService.cyState;
    const helperService = service.helperService;

    const handleElementDelete = useCallback(async () => {
        const elementsDeleted = props.elementsDeleted;
        if (elementsDeleted) {
            await elementsDeleted([{id: props.w.id, type: props.w.cyType}]);
        }
        // 目前只支持挨个删除，所以永远只有一个元素被选中
        service.stateService.elementService.deleteSelected();
    }, [service]);

    const normalSingleEdgeOrNode = useCallback((elementType: ElementType) => {
        const selectedEdgeCommonData = helperService.selectedCyEdgesCommonData;
        const isSingleEdge = elementType === 'edge'
            && selectedEdgeCommonData.length === 1
            && selectedEdgeCommonData[0].cyType === CyType.EDGE;

        const isSingleNode = (elementType === 'vertex' && helperService.selectedCyNodesData.length === 1);
        return isSingleEdge || isSingleNode;
    }, [helperService.selectedCyEdgesCommonData.length, helperService.selectedCyNodesData.length]);

    const w = props.w;
    let summaryContent: React.ReactNode = null;
    let edgeGroupContent: React.ReactNode = null;
    let paramsContent: React.ReactNode = null;

    let elementType: ElementType = 'vertex';
    if (w instanceof CyNodeData) {
        summaryContent =
            <NodeSummary cyState={cyState} locale={props.locale!} service={service} cy={cy} node={w}/>;
        paramsContent =
            <NodeParams
                elementData={w as CyNodeData}
                mainStore={mainStore}
                locale={props.locale!}
                {...props}
            />;
    } else if (w instanceof CyEdgeData) {
        summaryContent = <EdgeSummary edge={w} locale={props.locale!} cyState={cyState}/>;
        paramsContent =
            <EdgeCommonParams
                cyState={cyState}
                elementData={w}
                mainStore={mainStore}
                locale={props.locale!}
                {...props}
            />;
        elementType = 'edge';
    } else if (w instanceof CyEdgeGroupData) {
        edgeGroupContent = <EdgeGroupStats locale={props.locale!} eg={w}/>;
        paramsContent =
            <EdgeCommonParams
                cyState={cyState}
                elementData={w}
                mainStore={mainStore}
                locale={props.locale!}
                {...props}
            />;
        elementType = 'edge';
    }

    return (
        <FilterContext.Provider value={filterState}>
            <div className={`attribute-tab-fields ${props.className || ''}`}>
                {summaryContent}
                {/* 分割线在edgeGroup聚合统计时不出现 */}
                {!edgeGroupContent && <div className='separator summary-separator'/>}
                {edgeGroupContent}
                {paramsContent}
                {normalSingleEdgeOrNode(elementType) && !props.readonly &&
                <div className='danger-zone'>
                    <Divider/>
                    <Popconfirm
                        title={getTranslation(props.locale!, 'Are you sure to delete?')}
                        cancelText={getTranslation(props.locale!, 'Cancel')}
                        okText={getTranslation(props.locale!, 'Confirm')}
                        onConfirm={handleElementDelete}
                    >
                        <Button
                            loading={mainStore.isLoading(LoadingTargets.DELETE_BUTTON_OK)}
                            className='element-delete-btn'>{getTranslation(props.locale!, `Delete this ${elementType}`)}</Button>
                    </Popconfirm>
                </div>
                }
            </div>
        </FilterContext.Provider>
    );
}

export default observer(ElementAttributeViewer);
