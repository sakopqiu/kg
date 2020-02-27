import {CommonService} from './CommonService';
import {CYTO_FIT_PADDING, DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG} from '../../../utils';
import {layoutElements} from '../../PipelineEditor/cyto/cyto-utils';
import {AddNormalNodeEdgeConfig} from '../model/CyState';
import {CyElementDefaultClass} from '../interfaces';

export class AddNormalElementsService extends CommonService {
    async exec() {
        const oldPanning = {...this.cy.pan()};
        const oldZooming = this.cy.zoom();

        const ns = this.cyState.newNodeStats;
        const es = this.cyState.newEdgeStats;
        const config = this.cyState.addElementConfig as AddNormalNodeEdgeConfig;

        let elementsToBeLayouted = null;
        let nodeCount = 0;
        // 在路径的预览框里，只有路径相关的几个元素，因此layout设计的是整个cy.elements()
        if (config.pathResultHack) {
            elementsToBeLayouted = this.cy.elements();
            nodeCount = this.cy.nodes(`node.${CyElementDefaultClass.NORMAL_NODE}`).length;
        } else {
            const allNewNodeIds: string[] = Array.from(ns.keys()).filter((key) => !ns.get(key));
            const allNewEdgeIds: string[] = Array.from(es.keys()).filter((key) => !es.get(key));
            const allNewElementIds = [...allNewNodeIds, ...allNewEdgeIds];
            elementsToBeLayouted = this.cy.filter(allNewElementIds.join(','));
            nodeCount = allNewNodeIds.length;
        }

        const extraLayoutConfig = config.extraLayoutConfig || {};

        const layoutConfig = {
            ...DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG,
            ...extraLayoutConfig,
        };
        if (!layoutConfig.fit) {
            layoutConfig.boundingBox = this.elementService
                .calculateNewElementsBounding(nodeCount,
                    CYTO_FIT_PADDING, 'around');
        }

        await layoutElements(elementsToBeLayouted, layoutConfig);

        if (!config.pathResultHack) {
            this.cy.batch(() => {
                this.cy.zoom(oldZooming);
                this.cy.pan(oldPanning);
            });
        }
    }

}
