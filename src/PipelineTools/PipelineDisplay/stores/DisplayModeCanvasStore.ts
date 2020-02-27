import {DisplayModePipelineSchema, EdgeSchema, NodeSchema} from '../interfaces';
import {CanvasDrawService} from '../service/CanvasDrawService';
import {action, computed, observable} from 'mobx';
import _find from 'lodash/find';
import {CanvasStore} from '../../common/CanvasStore';
import {debug} from '../../../utils';
import {DisplayModePipelineModel} from '../../../models/DisplayModePipelineModel';
import {DisplayModeCanvasTabStore} from './DisplayModeCanvasTabStore';

export class DisplayModeCanvasStore extends CanvasStore {
    @observable public pipeline: DisplayModePipelineModel | null;
    @observable public displayModePipelineSchema: DisplayModePipelineSchema;
    @observable public externalTags: Set<string> = new Set<string>();
    // SimplePipelineDisplay中是否显示工具盒
    @observable public showToolbox = true;

    @computed
    get internalTags() {
        const tags = new Set<string>();
        this.canvasDrawService.cyState.cyNodes.forEach((n) => {
            for (const t of n.data.tags) {
                tags.add(t);
            }
        });
        return tags;
    }

    @computed
    public get allTags() {
        return Array.from(this.internalTags).concat(Array.from(this.externalTags));
    }

    @action
    public updateExternalTags(tags: string[]) {
        this.externalTags.clear();
        tags.forEach((tag) => this.externalTags.add(tag));
    }

    public canvasDrawService: CanvasDrawService;

    constructor(public parent?: DisplayModeCanvasTabStore) {
        super(parent);
    }

    @computed
    get cy() {
        return this.canvasDrawService.cy;
    }

    @action
    public setShowToolbox(val: boolean) {
        this.showToolbox = val;
    }

    @action
    public setDisplayModePipelineSchema(val: DisplayModePipelineSchema) {
        this.displayModePipelineSchema = val;
    }

    @action
    public setDisplayPipeline(val: DisplayModePipelineModel) {
        this.pipeline = val;
    }

    @computed
    get schemaNodeNames() {
        return this.displayModePipelineSchema.vertices.map(v => v.labelName);
    }

    @computed
    get schemaEdgeNames() {
        return this.displayModePipelineSchema.edges.map(e => e.labelName);
    }

    @computed
    get canvasWidth() {
        const rightPanelWidth = this.detailsPanelCollapsed ? 43 : 300;
        const leftPanelWidth = 0;
        const total = rightPanelWidth + leftPanelWidth;
        return `calc(100% - ${total}px)`;
    }

    @computed
    get canvasRatioDisplay() {
        if (!this.pipeline) {
            return 100;
        } else {
            return Math.round(this.canvasDrawService.stateService.canvasRatio * 100);
        }
    }

    @action
    public setRatio(val: number) {
        this.canvasDrawService.stateService.setCanvasRatio(val);
    }

    public getEdgeSchema(label: string): EdgeSchema {
        return _find(this.displayModePipelineSchema.edges, ((s: EdgeSchema) => {
            return s.labelName === label;
        }))!;
    }

    public getFieldType(schema: EdgeSchema | NodeSchema, fieldName: string): string {
        const field = _find(schema.fields, ((field) => field.fieldName === fieldName));
        if (!field) {
            return '';
        }
        return field.fieldType;
    }

    public getNodeSchema(label: string): NodeSchema {
        return _find(this.displayModePipelineSchema.vertices, ((s: NodeSchema) => {
            return s.labelName === label;
        }))!;
    }

    public isEditable(schema: EdgeSchema | NodeSchema, fieldName: string): boolean {
        const field = _find(schema.fields, ((field) => field.fieldName === fieldName));
        if (!field) {
            return false;
        }
        return !!field.editable;
    }

    public onPipelineClosed() {
        this.canvasDrawService.destroyOldCy();

        debug('cy is destroyed for ' + this.pipeline!.name);
        if (this.canvasDrawService.autorunDisposer) {
            this.canvasDrawService.autorunDisposer();
        }

        this.canvasDrawService.cyState.destroy();
    }

    public async onSwitchedFrom(oldStore: DisplayModeCanvasStore) {
        const oldDrawService = oldStore.canvasDrawService;
        // close minimap when switching tabs
        oldDrawService.stateService.miniMapService.setMiniMapVisible(false);
        const newDrawService = this.canvasDrawService;
        newDrawService.cyState.resetOneTimeStatus();
        newDrawService.cyState.noHistory = true;
        newDrawService.newRedraw();
    }
}
