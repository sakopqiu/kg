// shared function for ElementParams and ElementAttributeViewer
import {CyNodeData} from '../../../../model/CyNode';
import {CyEdgeCommonData} from '../../../../model/CyEdgeCommonData';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {EdgeSchema, NodeSchema} from '../../../../interfaces';

export function useSchemaHook(w: CyNodeData | CyEdgeCommonData, s: DisplayModeCanvasStore) {
    let schema: EdgeSchema | NodeSchema | undefined;
    if (w instanceof CyEdgeCommonData) {
        schema = s.getEdgeSchema(w.name);
    } else if (w instanceof CyNodeData) {
        schema = s.getNodeSchema(w.nodeType);
    }
    return schema;
}
