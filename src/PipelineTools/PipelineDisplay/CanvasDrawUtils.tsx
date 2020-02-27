import {CanvasDrawService} from './service/CanvasDrawService';
import {FieldStat} from './service/StatisticsService';
import {CyNodeData} from './model/CyNode';
import {DisplayModeCanvasStore} from './stores/DisplayModeCanvasStore';
import {FieldSchema} from './interfaces';
import * as React from 'react';
import {CyEdgeData} from './model/CyEdge';
import {FieldStatViewer} from './right/DetailsPanel/tabs/stats/FieldStatViewer';
import {
    AddAuxiliaryNodeConfig,
    AddElementConfig,
    AddFindPathEntryConfig,
    AddMixtureType,
    AddNonAuxiliaryElementConfig,
    AddNormalNodeEdgeConfig,
    FindNeighborConfig,
} from './model/CyState';
import {innerFieldPrefix} from './kg-interface';
import _compact from 'lodash/compact';

export type CanvasContextMenuType = 'BACKGROUND' | 'NODE' | 'EDGE' | 'FIND_PATH_EDGE' | 'COMMUNITY' | 'OTHERS';

export type AttributeTab = 'CANVAS_INFO' | 'EDGE_CONFIG' | 'NODE_CONFIG' | 'COMMUNITY_DISCOVERY';
export type DiffTab = 'INTERNAL' | 'EXTERNAL';

export interface LayoutConfig {
    name: string;
    value: string;
}

export const LayoutConfigs: LayoutConfig[] = [
    {
        name: 'Grid',
        value: 'grid',
    },
    {
        name: 'Dagre',
        value: 'dagre',
    },
    {
        name: 'Circle',
        value: 'circle',
    },
    {
        name: 'Concentric',
        value: 'concentric',
    },
    {
        name: 'BFS',
        value: 'breadthfirst',
    },
    {
        name: 'Cose', // 对compound的支持不好
        value: 'cose',
    },
    {
        name: 'Cose-bilkent',
        value: 'cose-bilkent',
    },
    {
        name: 'Klay', // handles DAGs and compound graphs very nicely
        value: 'klay',
    },
    {
        name: 'Spread', // The layout tries to keep elements spread out evenly, making good use of constrained space.
        value: 'spread',
    },
    {
        name: 'Springy',
        value: 'springy',
    },
    {
        name: 'Cola', //  force-directed, all the edges are of more or less equal length and there are as few crossing edges as possible
        value: 'cola',
    },

];

/**
 * kg需要显示_id,以及arangodb的算法属性，其他meta属性不显示。
 * 并且，_id和arangodb属性需要放在最前面，其他属性也需要排序
 * @param {any[]} inputElements
 * @param {(ele: any) => string} keyExtractor
 * @param {boolean} includeMetaKeys
 * @returns {any}
 */
export function getKgFields(inputElements: any[], keyExtractor: (ele: any) => string, includeMetaKeys = true) {
    let result = inputElements.filter((ele) => {
        const key = keyExtractor(ele);
        if (key.startsWith('__algo')) {
            return true;
        }
        return key.indexOf('_') !== 0;
    });

    result = result.sort((ele1: any, ele2: any) => {
        const key1 = keyExtractor(ele1);
        if (key1[0] === '_') {
            return -1;
        }
        return 1;
    });

    // 需要加上的通用属性
    if (includeMetaKeys) {
        const metaIdEle = inputElements.find(ele => keyExtractor(ele) === '_id');
        const metaNameEle = inputElements.find(ele => keyExtractor(ele) === '__name');
        return _compact([metaIdEle, metaNameEle, ...result]);
    }
    return result;
}

export function renderForNodeType(store: DisplayModeCanvasStore, nodeType: string, data: CyNodeData[]) {
    const schema = store.getNodeSchema(nodeType)!;
    const statService = store.canvasDrawService.statsService;
    // 只显示id以外的字段
    const fields = getKgFields(schema.fields, (field: FieldSchema) => field.fieldName);
    const fieldsStat: FieldStat[] = fields.map((f: FieldSchema) => {
        return statService.statsForField(data, f);
    }).sort((f1: FieldSchema, f2: FieldSchema) => {
        // 内部属性永远放在最前面显示
        if (f1.fieldName.startsWith(innerFieldPrefix)) {
            return -1;
        }
        return 1;
    });

    return fieldsStat.map((stat: FieldStat) => {
        return <FieldStatViewer
            mainStore={store}
            data={data} stat={stat} key={stat.fieldName}/>;
    });
}

export function renderForEdgeType(store: DisplayModeCanvasStore, label: string, data: CyEdgeData[]) {
    const schema = store.getEdgeSchema(label)!;
    const statService = store.canvasDrawService.statsService;
    // 只显示id以外的字段
    const fields = getKgFields(schema.fields, (field: FieldSchema) => field.fieldName);
    const fieldsStat: FieldStat[] = fields.map((f: FieldSchema) => {
        return statService.statsForField(data, f);
    }).sort((f1: FieldSchema, f2: FieldSchema) => {
        // 内部属性永远放在最前面显示
        if (f1.fieldName.startsWith(innerFieldPrefix)) {
            return -1;
        }
        return 1;
    });
    return fieldsStat.map((stat: FieldStat) => {
        return <FieldStatViewer
            mainStore={store}
            data={data} stat={stat} key={stat.fieldName}/>;
    });
}

// 弹出框（可能是menu也可能是普通div）如果超过当前canvas的视野范围，重新修正他的位置
export function fineTunePopupPosition(drawService: CanvasDrawService,
                                      containerRef: React.RefObject<HTMLElement>,
                                      margin = 50,
) {
    const current = containerRef.current;
    if (drawService && current) {
        const bound = current.getBoundingClientRect();
        const canvas = document.getElementsByClassName('drawing-context-wrapper')[0];
        const canvasBoundingRect = canvas.getBoundingClientRect();
        const canvasBottom = canvasBoundingRect.bottom;
        if (bound.bottom > canvasBottom) {
            const newTop = canvasBottom - bound.height - margin;
            current.style.top = newTop + 'px';
            drawService.stateService.setCanvasContextMenuPositionY(newTop);
        }

        // over the right boundary
        if (bound.right > canvasBoundingRect.right) {
            const newLeft = canvasBoundingRect.right - bound.width - margin;
            current.style.left = newLeft + 'px';
            drawService.stateService.setCanvasContextMenuPositionX(newLeft);
        }
        if (document.activeElement !== current) {
            current.focus();
        }
    }
}

// 自定义类型保护
export function isTextNodeAdded(config: AddElementConfig): config is AddAuxiliaryNodeConfig {
    return config.type === AddMixtureType.TEXT;
}

// 自定义类型保护
export function isDescriptionNodeAdded(config: AddElementConfig): config is AddAuxiliaryNodeConfig {
    return config.type === AddMixtureType.DESCRIPTION;
}

// 节点查找邻居
export function isAddNeighbor(config: AddNonAuxiliaryElementConfig): config is FindNeighborConfig {
    return config.type === AddMixtureType.NEIGHBOR;
}

// 节点查找邻居
export function isAddNormal(config: AddNonAuxiliaryElementConfig): config is AddNormalNodeEdgeConfig {
    return config.type === AddMixtureType.NORMAL;
}

export function isAddFindPathEntry(config: AddElementConfig): config is AddFindPathEntryConfig {
    return config.type === AddMixtureType.FIND_PATH_ENTRY;
}
