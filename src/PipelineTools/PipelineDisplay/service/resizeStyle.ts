// 不能被resize的元素的过滤器
const NonResizableCondition = (n: any) => {
    return !(n.hasClass('description-container')
        || n.hasClass('description-arrow'));
};

export default {
    padding: 5, // spacing between node and grapples/rectangle
    grappleSize: 8, // size of square dots
    grappleColor: '#4D5850', // color of grapples
    inactiveGrappleStroke: 'inside 0px rgba(0,0,0,0)',
    boundingRectangleLineColor (node: any) {
        if (NonResizableCondition(node)) {
            return 'rgba(0,0,0,0)';
        } else {
            return '#4D5850';
        }
    },
    boundingRectangleLineWidth (node: any) {
        if (NonResizableCondition(node)) {
            return 0;
        } else {
            return 1;
        }
    },
    zIndex: 10,
    isNoResizeMode: NonResizableCondition,
    isNoControlsMode: NonResizableCondition,
};
