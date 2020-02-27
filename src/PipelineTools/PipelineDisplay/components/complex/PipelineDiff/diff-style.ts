import {
    FONT_FAMILY,
    NODE_FONT_COLOR,
    NODE_SELECTED_FONT_COLOR,
    NODE_TEXT_MARGIN_Y,
    SELECTED_BACKGROUND_COLOR,
} from '../../../../common/cytoscapeCommonStyle';

const selectedEdge = {
    'width': 'data(selectedWidth)',
    'line-color': '#83C8FF',
    'target-arrow-color': '#83C8FF',
};

export const cytoDiffStyle = [ // the stylesheet for the graph
    {
        selector: 'node.diff-node',
        style: {
            'background-image': 'data(backgroundImage)',
            'background-color': 'white',
            'background-opacity': 0,
            'label': 'data(displayLabel)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'font-size': 'data(fontSize)',
            'color': NODE_FONT_COLOR,
            'text-margin-y': NODE_TEXT_MARGIN_Y,
            'font-family': FONT_FAMILY,
            'padding': 0,
            'shape': 'polygon',
            'background-fit': ['none'], // note and tag should be none, otherwise the height will expand to the height of the node
            'background-position-x': 'data(backgroundX)',
            'background-position-y': 'data(backgroundY)',
            'background-width': 'data(backgroundSize)',
            'background-height': 'data(backgroundSize)',
            'background-image-opacity': 'data(backgroundOpacity)',
            'z-index': 10,
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': 5,
            'background-clip': 'none',
            'text-opacity': 'data(textOpacity)',
            'text-outline-opacity': 'data(textOpacity)',
        },
    },
    {
        selector: 'edge.diff-edge',
        style: {
            'width': 'data(width)',
            'font-size': 12,
            'line-color': 'data(lineColor)',
            'target-arrow-color': 'data(lineColor)',
            'arrow-scale': 1,
            'target-arrow-shape': 'vee',
            'curve-style': 'bezier',
            'label': 'data(displayLabel)',
            'color': '#aaa',
            'text-background-color': 'white',
            'text-background-opacity': 1,
            'text-background-padding': 3,
            'line-style': 'data(lineStyle)',
            'opacity': 'data(opacity)',
        },
    },
    {
        selector: 'node.diff-node:selected',
        style: {
            'background-color': SELECTED_BACKGROUND_COLOR,
            'background-opacity': 1,
            'color': NODE_SELECTED_FONT_COLOR,
            'width': 'data(size)',
            'height': 'data(size)',
        },
    },
    {
        selector: 'edge:selected',
        style: {
            ...selectedEdge,
        },
    },
];
