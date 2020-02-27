import {StatusService} from '../service/StatusService';
import {CyElementDefaultClass} from '../interfaces';

export function determineMenuPosition(s: StatusService, e: any) {
    if (!s.showForSingleNode) {
        setMenuPosition(s, e);
    } else {
        setMenuPositionAtSelectedNode(s);
    }
}

export function setMenuPosition(s: StatusService, e: any) {
    s.stateService.setCanvasContextMenuPosition(e.clientX, e.clientY + 40);
}

/**
 * 当前选中的唯一节点在window下的坐标
 */
export function setMenuPositionAtSelectedNode(s: StatusService) {
    const node = s.cy.nodes(`.${CyElementDefaultClass.NORMAL_NODE}:selected`);
    if (node.length !== 1) {
        throw new Error('Only one node should be selected');
    }
    const backgroundRectangle = document.querySelector('.canvas-background')!.getBoundingClientRect();
    const nodePosition = node.renderedPosition();
    s.stateService.setCanvasContextMenuPosition(
        backgroundRectangle.left + nodePosition.x + 40,
        backgroundRectangle.top + nodePosition.y,
    );
}

export const truthy = () => true;
export const falsy = () => false;
