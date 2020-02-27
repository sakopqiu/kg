import {CanvasDrawService} from '../../../service/CanvasDrawService';

export function showDiffDetailsModal(cytoEle: any, canvasDrawService: CanvasDrawService, needCenter = true) {
    const diffCy = canvasDrawService.diffService.diffCy;
    if (needCenter) {
        diffCy.center(cytoEle);
    }
    diffCy.elements().unselect();
    cytoEle.select();
    const base = document.getElementById('pipeline-diff')!.getBoundingClientRect()!;
    let x, y;
    if (cytoEle.isNode()) {
        const renderedPosition = cytoEle.renderedPosition();
        x = renderedPosition.x + base.left + cytoEle.width() / 2 * diffCy.zoom();
        y = renderedPosition.y + base.top + 30;
    } else {
        const renderedMidPoint = cytoEle.renderedMidpoint();
        x = renderedMidPoint.x + base.left + 10;
        y = renderedMidPoint.y + base.top + 20;
    }

    canvasDrawService.diffService.setCurrentSelectedDiffObj({
        eleId: cytoEle.id() as string,
        eleType: cytoEle.isNode() ? 'vertex' : 'edge',
        x,
        y,
    });
}
