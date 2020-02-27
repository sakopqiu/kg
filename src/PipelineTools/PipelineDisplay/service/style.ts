import ArrowSvg from './Arrow.svg';
import {
    LINE_FONT_COLOR,
    NODE_FONT_COLOR,
    NODE_SELECTED_FONT_COLOR,
    SELECTED_BACKGROUND_COLOR,
    SELF_LOOP_DIRECTION,
    NODE_TEXT_MARGIN_Y,
    FONT_FAMILY,
    TEMP_HIDDEN_CLASS,
    SELF_LOOP_STEP_SIZE, TEMP_NODE_SIZE,
} from '../../common/cytoscapeCommonStyle';
import {CyElementDefaultClass} from '../interfaces';

const selectedEdge = {
    'width': 'data(selectedWidth)',
    // "line-style": "dashed",
    // "line-style": "dashed",
    'line-color': '#83C8FF',
    'target-arrow-color': '#83C8FF',
    'opacity': 1,
};

const arrowType = 'triangle-backcurve';

const tempPathOpacity = .5;

enum Z_INDEX {
    very_low = 8,
    low = 9,
    middle = 10,
    high = 11,
}

export const cytoStyle = [ // the stylesheet for the graph
    {
        selector: '.' + TEMP_HIDDEN_CLASS,
        style: {
            'visibility': 'hidden',
            'opacity': 0,
            'text-opacity': 0,
            'width': 0,
            'height': 0,
            'color': 'white',
            'label': '',
        },
    },
    {
        selector: `node.${CyElementDefaultClass.NORMAL_NODE}`,
        style: {
            'background-image': 'data(backgroundImage)',
            'background-color': 'white',
            'background-opacity': 0,
            'label': 'data(displayLabel)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-color': 'data(borderColor)',
            'border-width': 'data(borderWidth)',
            'font-size': 'data(fontSize)',
            'color': NODE_FONT_COLOR,
            'text-margin-y': NODE_TEXT_MARGIN_Y,
            'font-family': FONT_FAMILY,
            'padding': 0,
            'shape': 'data(shape)',
            'shape-polygon-points': 'data(roundRectangleArray)',
            'background-fit': ['none', 'none', 'none'], // note and tag should be none, otherwise the height will expand to the height of the node
            'background-position-x': 'data(backgroundX)',
            'background-position-y': 'data(backgroundY)',
            'background-width': 'data(backgroundSize)',
            'background-height': 'data(backgroundSize)',
            'z-index': Z_INDEX.high,
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': 5,
            // 'bounds-expansion': "data(boundsExpansion)",
            'background-clip': 'none',
        },
    },
    {
        selector: `node.${CyElementDefaultClass.ADD_PATH_MOVER}`, // 添加路径时，半透明的指路标
        style: {
            'background-image-opacity': tempPathOpacity,
            'text-opacity': tempPathOpacity,
        },
    },
    {
        selector: 'node.low-priority-node',
        style: {
            'background-image-opacity': .3,
            'text-opacity': .3,
            'border-style': 'dashed',
        },
    },
    {
        selector: 'node.low-priority-community-node',
        style: {
            'background-image-opacity': .3,
            'border-opacity': .3,
            'text-opacity': .3,
        },
    },
    {
        selector: 'node.description-container',
        style: {
            'width': 'data(width)',
            'height': 'data(height)',
            'background-color': '#EC991F',
            'background-opacity': .2,
            'shape': 'data(shape)',
            'z-index': Z_INDEX.very_low,
        },
    },
    {
        selector: 'node.description-container:selected',
        style: {
            'border-color': '#5AACED',
            'border-width': 5,
            'border-style': 'dashed',
        },
    },
    {
        selector: 'node.description-text',
        style: {
            'text-max-width': 1000,
            'width': 'label',
            'height': 'label',
            'label': 'data(text)',
            'background-color': 'white',
            'background-opacity': 0,
            'color': '#E64D4D',
            'font-size': 36,
            // "font-weight": 700,
            'shape': 'rectangle',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'padding': 5,
            'z-index': Z_INDEX.low,
        },
    },
    {
        selector: 'node.description-text:selected',
        style: {
            'border-color': '#5AACED',
            'border-width': 5,
            'border-style': 'dashed',
        },
    },
    {
        selector: 'node.description-arrow',
        style: {
            'width': 'data(width)',
            'height': 'data(height)',
            'background-image': ArrowSvg,
            'background-width': '80%',
            'background-height': '80%',
            'text-rotation': .75,
        },
    },
    {
        selector: 'node#nodefind-path-temp',
        style: {
            'width': 1,
            'height': 1,
            'background-color': 'white',
            'z-index': Z_INDEX.very_low,
            'background-width': TEMP_NODE_SIZE,
            'background-height': TEMP_NODE_SIZE,
        },
    },
    {
        selector: '$node > node',
        style: {
            'padding-top': '70px',
            'padding-left': '70px',
            'padding-bottom': '70px',
            'padding-right': '70px',
            'text-valign': 'top',
            'text-halign': 'center',
            'background-color': 'data(backgroundColor)',
            'background-opacity': .5,
            'shape': 'rectangle',
            'z-index': Z_INDEX.middle,
        },
    },

    {
        selector: 'edge',
        style: {
            'width': 'data(width)',
            'font-size': 'data(fontSize)',
            'line-color': 'data(newLineColor)',
            'opacity': 'data(lineColorOpacity)',
            'target-arrow-color': 'data(newLineColor)',
            'arrow-scale': 2,
            'target-arrow-shape': arrowType,
            'curve-style': 'bezier',
            'label': 'data(displayLabel)',
            'color': LINE_FONT_COLOR,
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': 3,
            'z-index': Z_INDEX.high,
        },
    },
    {
        selector: `edge.${CyElementDefaultClass.FIND_PATH_BEACON}`,
        style: {
            'width': 'data(width)',
            'font-size': 14,
            'line-color': '#000000',
            'opacity': 1,
            'line-style': 'dashed',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            'label': 'data(displayLabel)',
            'color': '#000000',
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': 3,
        },
    },
    {
        selector: `edge.${CyElementDefaultClass.ADD_PATH_MOVER}`, // 添加路径时，半透明的指路标
        style: {
            'opacity': tempPathOpacity,
            'text-opacity': tempPathOpacity,
        },
    },
    {
        selector: 'edge.low-priority-edge,edge.low-priority-edgegroup',
        style: {
            'opacity': .3,
            'text-opacity': .3,
        },
    },
    {
        selector: `edge.${CyElementDefaultClass.SELF_LOOP}`,
        style: {
            'arrow-scale': 1.5,
            'curve-style': 'bezier',
            'loop-direction': SELF_LOOP_DIRECTION,
            'control-point-step-size': SELF_LOOP_STEP_SIZE,
            'color': LINE_FONT_COLOR,
        },
    },
    {
        selector: `edge.${CyElementDefaultClass.MERGED_EDGE}`,
        style: {
            width: 'data(width)',
        },
    },
    {
        selector: 'edge#edgefind-path-temp',
        style: {
            ...selectedEdge,
            'label': '',
            'line-style': 'dashed',
            'width': 2,
            'target-arrow-shape': 'none', // api返回双向路径了，语义上将不存在方向性了
        },
    },
    {
        selector: `.${CyElementDefaultClass.COLLAPSED_COMMUNITY}`,
        style: {
            'background-color': 'data(backgroundColor)',
            'label': 'data(name)',
            'text-valign': 'center',
            'width': 100,
            'height': 100,
            'border-color': '#5AACED',
            'border-width': 5,
            'z-index': Z_INDEX.high,
        },
    },
    {
        selector: `.${CyElementDefaultClass.COLLAPSED_COMMUNITY}:selected`,
        style: {
            'border-style': 'dashed',
        },
    },
    // {
    //     selector: 'core', // 背景外面灰一下的bugfix
    //     style: {
    //         "outside-texture-bg-color": "white",
    //     }
    // },
    {
        selector: `node.${CyElementDefaultClass.NORMAL_NODE}:selected`,
        style: {
            'background-color': SELECTED_BACKGROUND_COLOR,
            'background-opacity': 1,
            'color': NODE_SELECTED_FONT_COLOR,
            'width': 'data(size)',
            'height': 'data(size)',
        },
    },
    // {
    //     selector: 'node.description-text:selected',
    //     style: {
    //         width: 1,
    //         height: 1,
    //         label: '',
    //     }
    // },
    {
        selector: 'edge:selected',
        style: {
            ...selectedEdge,
        },
    },
];
