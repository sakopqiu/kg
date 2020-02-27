import {CyElement, CyElementData} from './CyElement';
import {ElementGroup} from 'cytoscape';
import {CyElementDefaultClass} from '../interfaces';

export abstract class CyEdgeCommonData extends CyElementData {

    static DEFAULT_WEIGHT: number = 1;

    source: string;
    target: string;
    originalSrcId: string;
    originalTargetId: string;

    name: string;
    id: string;
    weight: number = CyEdgeCommonData.DEFAULT_WEIGHT;
    edgeIndex: number = 1;

    protected showLabel() {
        return !this.cyState!.canvasSetting.globalEdgeConfig.hideEdgeLabel;
    }

    abstract get displayLabel(): string;

    abstract get width(): number;

    get newLineColor() {
        const edgeConfig = this.cyState!.canvasSetting.globalEdgeConfig;
        return edgeConfig.edgeColorConfig.color;
    }

    get lineColorOpacity() {
        return this.cyState!.canvasSetting.globalEdgeConfig.edgeColorConfig.opacity / 100;
    }

    get fontSize() {
        return this.cyState!.canvasSetting.globalEdgeConfig.edgeFontSize;
    }

    get selectedWidth() {
        return this.width * 2;
    }
}

export abstract class CyEdgeCommon extends CyElement {
    public data: CyEdgeCommonData;

    // cytoscape固定值
    get group() {
        return 'edges' as ElementGroup;
    }

    selfLoopSetup() {
        if (this.data.source === this.data.target) {
            this.addClass(CyElementDefaultClass.SELF_LOOP);
        }
    }
}
