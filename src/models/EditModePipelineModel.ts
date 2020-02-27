import {action, computed, IReactionDisposer, observable, reaction} from 'mobx';
import {ParamsContainer, Terminus, WidgetModel} from './WidgetModel';
import {IPoint} from '../utils';
import {IPipeline, IPipelineLink, SPECIAL_BLUEPRINT_KEY} from '../PipelineTools/PipelineEditor/interfaces';
import {PairedLink, PipelineLink, TerminusLink} from './LinkModel';
import CJSON from 'circular-json';
import {SimplePipelineModel} from './SimplePipelineModel';
import {EditModeCanvasStore} from '../PipelineTools/PipelineEditor/stores/EditModeCanvasStore';
import _compact from 'lodash/compact';

export class EditModePipelineModel extends SimplePipelineModel {
    @observable public widgets: WidgetModel[] = [];
    @observable public links: PipelineLink[] = [];
    @observable public terminusArray: Terminus[] = [];
    // 连接一个widget到底部终点的边
    @observable public terminusLinks: TerminusLink[] = [];
    @observable public createTime?: string | number = '';
    @observable public modifyTime?: string | number = '';
    @observable public ratio: number; // svg使用ratio， TODO统一canvas和svg的ratio
    @observable public scrollDimension: IPoint;
    @observable public viewBoxPosition: IPoint;
    @observable public snap: boolean = false;
    @observable public params: ParamsContainer = new ParamsContainer();
    @observable dirty: boolean = false;

    // 可以用于标注特殊类型的流程图
    public specialKey: string | undefined = void 0;
    readonly: boolean = false;
    needRedraw: boolean = true;
    showWidgetContextMenu: boolean = false;
    // 当前pipeline临时被锁定，不能进行更多的交互
    @observable locked: boolean = false;

    public reactionDisposer: IReactionDisposer;

    constructor(json: IPipeline, public type: 'drag' | 'scroll') {
        super(json.pipeline_id, json.pipeline_name);
        this.unpack(json);
    }

    private unpack(json: IPipeline) {
        this.pipelineName = json.pipeline_name || '';
        this.pipelineId = json.pipeline_id;
        this.createTime = json.create_time;
        if (this.createTime && typeof this.createTime === 'string') {
            this.createTime = this.createTime!.trim();
        }
        this.modifyTime = json.create_time;
        if (this.modifyTime && typeof this.modifyTime === 'string') {
            this.modifyTime = this.modifyTime!.trim();
        }
        const obj = JSON.parse(json.pipeline_ui || JSON.stringify({}));
        this.scrollDimension = obj.scrollDimension || {x: 0, y: 0};
        this.viewBoxPosition = obj.viewBoxPosition || {x: 0, y: 0};
        this.ratio = obj.ratio || 1;
        this.snap = obj.snap;
        this.specialKey = json.specialKey as SPECIAL_BLUEPRINT_KEY || void 0;
        this.params.initWith(json.params);
        this.readonly = !!json.readonly;
        this.showWidgetContextMenu = !!json.showWidgetContextMenu;
    }

    @action
    public setViewBoxPosition(val: IPoint) {
        this.viewBoxPosition = val;
    }

    @action
    public setRatio(val: number) {
        this.ratio = val;
    }

    @action
    public lock() {
        this.locked = true;
    }

    @action
    public unlock() {
        this.locked = false;
    }

    @action
    public setScroll(val: IPoint) {
        this.scrollDimension = val;
    }

    @action
    public setDirty(val: boolean) {
        this.dirty = val;
    }

    /**
     * 声明为computed，因为一旦有link消失或者加入的话，这个值将被重新计算
     */
    @computed
    public get pairedLinks(): PairedLink[] {
        const map: Map<string, PairedLink> = new Map<string, PairedLink>();
        for (const link of this.links) {
            const compoundId = PairedLink.compoundId(link.input, link.output);
            if (map.has(compoundId)) {
                map.get(compoundId)!.addLink(link);
            } else {
                const pairedLink = PairedLink.newPair(link);
                pairedLink.addLink(link);
                map.set(compoundId, pairedLink);
            }
        }
        return Array.from(map.values());
    }

    @action
    public initDetails(store: EditModeCanvasStore, json: IPipeline) {
        if (json.pipeline_nodes) {
            this.widgets = _compact(json.pipeline_nodes.map((node) => {
                return new WidgetModel(store).fromJson(node, !!json.readonly);
            }));
        }
        // 如果widget的WidgetDef找不到（数据集被用户删除了），那么他不会出现在结果集里
        this.widgets = _compact(this.widgets);

        if (json.pipeline_links) {
            this.links = _compact(json.pipeline_links.map((link) => {
                const ret: PipelineLink | null = new PipelineLink(store).fromJson(link, !!json.readonly);
                if (ret) {
                    return ret.initInputsOutPuts(this, link);
                }
                return null;
            }));
        }
        if (json.pipeline_terminus_array) {
            this.terminusArray = json.pipeline_terminus_array.map(t => Terminus.fromJSON(t));
        }

        if (json.pipeline_terminus_links) {
            this.terminusLinks = json.pipeline_terminus_links.map(l => TerminusLink.fromJson(this, l));
        }

        if (!json.readonly) {
            this.reactionDisposer = reaction(() => {
                return CJSON.stringify(this.toJson());
            }, () => {
                if (!this.locked) {
                    this.setDirty(true);
                }
            });
        }
    }

    public toJson(): IPipeline {
        return {
            pipeline_id: this.pipelineId,
            // api返回的数据里可能一条连接的input或者output不存在，这种连接需要过滤
            pipeline_links: this.links.map((l) => l.toJson()).filter((j: IPipelineLink) => !!j.from_node_id && !!j.to_node_id),
            pipeline_name: this.pipelineName,
            pipeline_nodes: this.widgets.map((w) => w.toJson()),
            pipeline_terminus_array: this.terminusArray.map(t => t.toJson()),
            pipeline_terminus_links: this.terminusLinks.map(l => l.toJson()),
            pipeline_ui: JSON.stringify({
                ratio: this.ratio,
                scrollDimension: this.scrollDimension,
                viewBoxPosition: this.viewBoxPosition,
                snap: this.snap,
            }),
            create_time: this.createTime,
            update_time: this.modifyTime,
            params: this.params.toJson(),
            specialKey: this.specialKey || '',
        };
    }

    // 不包含params的变化，适用于流程构建
    public simpleJson() {
        return {
            pipeline_links: this.links.map((l) => l.toSimpleJson()),
            pipeline_nodes: this.widgets.map((w) => w.toSimpleJson()),
            pipeline_terminus_array: this.terminusArray.map(t => t.toSimpleJson()),
            pipeline_terminus_links: this.terminusLinks.map(l => l.toSimpleJson()),
            pipeline_ui: JSON.stringify({
                ratio: this.ratio,
                scrollDimension: this.scrollDimension,
                viewBoxPosition: this.viewBoxPosition,
                snap: this.snap,
            }),
        };
    }

}
