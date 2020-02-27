import {EditModeCanvasTabStore} from '../stores/EditModeCanvasTabStore';
import {runInAction} from 'mobx';
import {
    BACKGROUND_IMAGE_RATIO,
    EDGE_NORMAL_WIDTH,
    FONT_FAMILY,
    NODE_NORMAL_SIZE,
    NODE_TEXT_MARGIN_Y,
    SELECTED_BACKGROUND_COLOR,
    SELF_LOOP_DIRECTION,
    SELF_LOOP_STEP_SIZE,
} from '../../common/cytoscapeCommonStyle';
import {NewElementLayoutConfig} from '../../PipelineDisplay/model/CyState';
import {FindPathInnerPath} from '../../PipelineDisplay/kg-interface';
import {CyAssortedInnerPath} from '../../PipelineDisplay/model/CyFindPathBeaconEdge';
import _uniq from 'lodash/uniq';

export const TEMP_NODE_ID = 'temp_node_id';
export const TEMP_EDGE_ID = 'temp_edge_id';
export const CYTO_NODES = 'cyto_nodes';
export const CYTO_EDGES = 'cyto_edges';
export const CYTO_SELF_LOOP = 'cyto_self_loop_edges';

const edgeCommonStyle = {
    'width': EDGE_NORMAL_WIDTH,
    'font-size': 12,
    'line-color': 'data(color)',
    'target-arrow-color': 'data(color)',
    'arrow-scale': 1,
    'target-arrow-shape': 'vee',
    'curve-style': 'bezier',
    'label': 'data(label)',
    'color': 'data(color)',
    'text-background-color': 'white',
    'text-background-opacity': 1,
    'text-background-padding': 3,
};

export const cytoStyle = [ // the stylesheet for the graph
    {
        selector: `.${CYTO_NODES}`,
        style: {
            'background-color': 'white',
            'background-opacity': 0,
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'width': NODE_NORMAL_SIZE,
            'height': NODE_NORMAL_SIZE,
            'color': 'data(color)',
            'font-size': 12,
            'font-family': FONT_FAMILY,
            'padding': 0,
            'shape': 'polygon',
            'shape-polygon-points': 'data(roundRectangleArray)',
            'z-index': 10,
            'overlay-opacity': 0,
            'background-image': 'data(backgroundImage)',
            'background-width': BACKGROUND_IMAGE_RATIO,
            'background-height': BACKGROUND_IMAGE_RATIO,
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': 5,
            'text-margin-y': NODE_TEXT_MARGIN_Y,
            'border-color': 'red',
            'border-width': 'data(borderWidth)',
        },
    },
    {
        selector: `#${TEMP_NODE_ID}`,
        style: {
            'width': 1,
            'height': 1,
            'background-color': 'white',
            'z-index': 1,
        },
    },

    {
        selector: `.${CYTO_EDGES}`,
        style: edgeCommonStyle,
    },

    {
        selector: `.${CYTO_SELF_LOOP}`,
        style: {
            ...edgeCommonStyle,
            'curve-style': 'bezier',
            'loop-direction': SELF_LOOP_DIRECTION,
            'control-point-step-size': SELF_LOOP_STEP_SIZE,
        },
    },
    {
        selector: `#${TEMP_EDGE_ID}`,
        style: {
            'line-style': 'dashed',
            'width': 3,
            'line-color': 'rgb(24, 180, 255)',
            'target-arrow-color': 'rgb(24, 180, 255)',
            'arrow-scale': 1,
            'curve-style': 'bezier',
            'target-arrow-shape': 'vee',
            'z-index': 1,
        },
    },
    {
        selector: `.${CYTO_NODES}:selected`,
        style: {
            'background-color': SELECTED_BACKGROUND_COLOR,
            'background-opacity': 1,
            'color': 'data(selectedColor)',
        },
    },
    {
        selector: `.${CYTO_EDGES}:selected`,
        style: {
            'width': EDGE_NORMAL_WIDTH * 2,
            'line-style': 'dashed',
        },
    },

];

export function removeSelected(tabStore: EditModeCanvasTabStore) {
    const nodeIds = tabStore.cy.nodes(':selected').map((n: any) => n.id());
    const edgeIds = tabStore.cy.edges(':selected').map((e: any) => e.id());
    const s = tabStore.currentActiveStore!;
    runInAction(() => {
        s.clearAllSelections();
        s.removeMixtureById(edgeIds, nodeIds);
    });
}

export async function cyAnimation(animationSubject: any, animationConfig: any, onCompleted?: () => any) {
    return new Promise((resolve) => {
        animationSubject.animate({
            ...animationConfig,
            complete: () => {
                if (onCompleted) {
                    onCompleted();
                }
                resolve();
            },
        });
    });
}

export async function layoutElements(elements: any, layoutConfig: NewElementLayoutConfig & { boundingBox?: CytoBoundingBox }) {
    return new Promise(resolve => {
        elements.layout({
            ...layoutConfig,
            stop: () => {
                resolve();
            },
        }).run();
    });
}

export interface CytoBoundingBox {
    x1: number;
    y1: number;
    w: number;
    h: number;
}

export type AssortedInnerPathId = string;

// 每一个条innerPath有一堆小边组成
// a=>b=>c=>d由a=>b,b=>c,c=>d组成
export function innerPathVertexIds(path: FindPathInnerPath) {
    let vertexIds: string[] = [];
    for (let i = 0; i < path.edges.length; i++) {
        const e = path.edges[i];
        if (i !== 0) {
            vertexIds.push(e.data.source);
        }
        if (i !== path.edges.length - 1) {
            vertexIds.push(e.data.target);
        }
    }
    vertexIds = _uniq(vertexIds);
    // 加入头和尾，之所以这么做，怕的是当头尾是一个节点时，uniq函数会把尾巴过滤掉
    vertexIds.unshift(path.edges[0].data.source);
    vertexIds.push(path.edges[path.edges.length - 1].data.target);
    return vertexIds;
}

/**
 * 以路径为唯一标识符，因为一条路径里可能包含很多重复边，比如
 * a-(交易)->b-(交易)->c
 * 其中a,b,c之间可能存在多次交易关系，虽然交易关系有多条，路径却只有一条
 * 需要注意的是
 * a-(购买)->b-(交易)->c 和上面的路径不算一条，需要节点和边的名字完全匹配才算
 */
export function calculatePathId(path: FindPathInnerPath): AssortedInnerPathId {
    let result = '';
    for (let i = 0; i < path.vertices.length - 1; i++) {
        const node = path.vertices[i].data;
        const edge = path.edges[i].data;
        result += `${node.id} <-> ${edge.name} <->`;
    }
    const lastVertex = path.vertices[path.vertices.length - 1];
    result += `${lastVertex.data.id}`;

    //
    // for (let i = 0; i < path.edges.length; i++) {
    //     const currEdge = path.edges[i].data;
    //     if(cu)
    //     result += `${currEdge.source} -> ${currEdge.name} -> `
    // }
    // result += path.edges[path.edges.length - 1].data.target;
    return result;
}

export function calculatePathReadableString(path: CyAssortedInnerPath): AssortedInnerPathId {
    let result = '';
    for (let i = 0; i < path.vertices.length; i++) {
        result += path.vertices[i].data.name;
        if (i !== path.vertices.length - 1) {
            result += `(${path.edgeNames[i]})`;
            result += ' => ';
        }
    }
    return result + ` (total: ${path.realEdges.length})`;
}
