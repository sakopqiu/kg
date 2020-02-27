import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import {computed} from 'mobx';
import {IPoint} from '../../../utils';
import {WidgetModel} from '../../../models/WidgetModel';
import {PipelineLink} from '../../../models/LinkModel';
import {EditModeCanvasTabStore} from '../stores/EditModeCanvasTabStore';
import {CYTO_EDGES, CYTO_NODES, CYTO_SELF_LOOP} from './cyto-utils';
import {
    getBackgroundIcon,
    getRoundRectangleArray,
    LINE_COLOR,
    NODE_FONT_COLOR, NODE_NORMAL_SIZE,
    NODE_SELECTED_FONT_COLOR, RADIUS_ITERATION, RECTANGLE_RADIUS,
} from '../../common/cytoscapeCommonStyle';

// 为了cytoscape显示所使用的数据结构，只用于展示，不影响真正被保存下来的数据
export interface CytoNodeData {
    id: string;
    label: string;
    nodeType: string;
    params: { [key: string]: any };
}

export interface CytoNode {
    classes: string;
    group: string;
    position: IPoint;
    data: CytoNodeData;
}

export interface CytoEdgeData {
    id: string;
    source: string;
    target: string;
    label: string;
    params: { [key: string]: any };
}

export interface CytoEdge {
    classes: string;
    group: string;
    data: CytoEdgeData;
}

export interface DDPState {
    vertices: CytoNode[];
    edges: CytoEdge[];
}

export class DDP {
    constructor(public mainStore: EditModeCanvasTabStore) {
    }

    @computed
    private get activeStore(): EditModeCanvasStore | null {
        if (this.mainStore.currentActiveStore) {
            return this.mainStore.currentActiveStore;
        }
        return null;
    }

    @computed
    private get vertices(): CytoNode[] {
        if (!this.activeStore) {
            return [];
        }
        return this.activeStore.widgets.map((w: WidgetModel) => {
            return {
                classes: CYTO_NODES,
                group: 'nodes',
                position: {
                    x: w.x,
                    y: w.y,
                },
                data: {
                    id: w.id,
                    label: w.name || w.dataset!.name,
                    nodeType: w.nodeType || '',
                    params: w.params.toJson(),
                    color: w.checkFormFailed ? 'red' : NODE_FONT_COLOR,
                    selectedColor: w.checkFormFailed ? 'red' : NODE_SELECTED_FONT_COLOR,
                    backgroundImage: getBackgroundIcon(w.params.getValue('icon')),
                    borderWidth: w.checkFormFailed ? 3 : 0,
                    roundRectangleArray: getRoundRectangleArray(RECTANGLE_RADIUS, NODE_NORMAL_SIZE, RADIUS_ITERATION),
                },
            };
        });
    }

    @computed
    private get edges(): CytoEdge[] {
        if (!this.activeStore) {
            return [];
        }
        return this.activeStore.links.map((l: PipelineLink) => {
            const srcId = l.output.id;
            const targetId = l.input.id;
            const classes = srcId === targetId ? `${CYTO_EDGES} ${CYTO_SELF_LOOP}` : CYTO_EDGES;
            return {
                classes,
                group: 'edges',
                data: {
                    id: l.id,
                    label: l.name,
                    params: l.params.toJson(),
                    source: srcId,
                    target: targetId,
                    color: l.checkFormFailed ? 'red' : LINE_COLOR,
                },
            };
        });
    }

    @computed
    get nextState(): DDPState {
        const vertices = this.vertices;
        const edges = this.edges;
        return {
            vertices,
            edges,
        };
    }
}
