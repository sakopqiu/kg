import {CommonService} from './CommonService';
import {CyState} from '../model/CyState';
import {DisplayModePipelineSchema} from '../interfaces';

export class NewSerializationService extends CommonService {

    private beforeSerialize() {
        const state = this.cyState;
        // 将state中所有节点的位置都进行更新,pan和zoom也要更新
        for (const node of state.cyNodes) {
            CyState.updateNodePosition(this.drawService, node);
        }
        for (const node of state.cyDescriptionContainers) {
            CyState.updateNodePosition(this.drawService, node);
        }
        for (const node of state.cyTexts) {
            CyState.updateNodePosition(this.drawService, node);
        }

        for (const community of state.communities) {
            CyState.updateCommunityPosition(this.drawService, community.id);
        }

        this.cyState.updateViewport(this.cy);
    }

    serialize() {
        this.beforeSerialize();
        return JSON.stringify(this.cyState);
    }

    serializationJson(): CyState {
        this.beforeSerialize();
        return this.cyState;
    }

    deserialize(data: string, schema: DisplayModePipelineSchema): CyState {
        return CyState.fromJSON(this.drawService, data, schema);
    }
}
