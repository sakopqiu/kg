import {ParamsContainer, Terminus, WidgetModel} from './WidgetModel';
import {EditModePipelineModel} from './EditModePipelineModel';
import {action, observable, computed} from 'mobx';
import uuidv1 from 'uuid/v1';
import {ILinkParamDef, IPipelineLink, IPipelineTerminusLink} from '../PipelineTools/PipelineEditor/interfaces';
import {EditModeCanvasStore} from '../PipelineTools/PipelineEditor/stores/EditModeCanvasStore';
import {isFieldEmpty} from '../PipelineTools/PipelineEditor/EditCanvasUtils';

/**
 * 两个节点间可能A->B，也可能B->A，因为我们要统计A和B之间一共有多少条双向路径，
 * 即认定他为无向图，继而可以算出每条曲线的弧度
 */
export class PairedLink {

    @observable public links: PipelineLink[] = [];

    private constructor(public node1: WidgetModel, public node2: WidgetModel) {
    }

    public isSelfLink() {
        return this.node1 === this.node2;
    }

    public static newPair(link: PipelineLink) {
        const n1 = link.input;
        const n2 = link.output;
        if (n1.id < n2.id) {
            return new PairedLink(n1, n2);
        } else {
            return new PairedLink(n2, n1);
        }
    }

    public static compoundId(n1: WidgetModel, n2: WidgetModel) {
        if (n1.id < n2.id) {
            return n1.id + ':' + n2.id;
        } else {
            return n2.id + ':' + n1.id;
        }
    }

    public addLink(link: PipelineLink) {
        this.links.push(link);
    }
}

export class TerminusLink {
    public static UNKNOWN_ID = 'unknown_terminus_link';

    public id: string;
    public input: Terminus;
    public output: WidgetModel;
    public params: ParamsContainer = new ParamsContainer();

    private constructor() {
    }

    public static newTerminusLink(input: Terminus, output: WidgetModel) {
        const ret = new TerminusLink();
        ret.input = input;
        ret.output = output;
        ret.id = uuidv1();
        return ret;
    }

    public getValue(str: string) {
        return this.params.getValue(str);
    }

    toJson(): IPipelineTerminusLink {
        return {
            id: this.id,
            from_node_id: this.output.id,
            to_terminus_id: this.input.id,
            params: this.params.toJson(),
        };
    }

    toSimpleJson() {
        return {
            id: this.id,
            from_node_id: this.output.id,
            to_terminus_id: this.input.id,
        };
    }

    static fromJson(pipelineModel: EditModePipelineModel, json: IPipelineTerminusLink) {
        const ret = new TerminusLink();
        ret.id = json.id;
        if (!ret.id || ret.id === TerminusLink.UNKNOWN_ID) {
            ret.id = uuidv1();
        }
        ret.input = pipelineModel.terminusArray.find(t => t.id === json.to_terminus_id)!;
        ret.output = pipelineModel.widgets.find(w => w.id === json.from_node_id)!;
        ret.params = ParamsContainer.fromJson(json.params);
        return ret;
    }

}

// api返回的pipeline的一条连接
export class PipelineLink {
    public input: WidgetModel;
    public output: WidgetModel;
    public id: string;
    public createTime: number;
    @observable public name: string = '';
    public params: ParamsContainer = new ParamsContainer();
    @observable public checkFormFailed: boolean = false;

    constructor(public store: EditModeCanvasStore) {
    }

    @computed
    get linkParamDefs() {
        if (this.store!.parent.canvasConfig.callbacks.getLinkParamDefs) {
            return this.store!.parent.canvasConfig.callbacks.getLinkParamDefs(this.store, this);
        }
        return null;
    }

    @action
    public fromJson(json: IPipelineLink, skipDef: boolean) {
        const paramsMap = json.params || {};
        this.params.initWith(paramsMap);
        this.name = json.name || '';
        this.id = json.link_id || uuidv1();
        this.createTime = json.create_time || +new Date();

        if (this.linkParamDefs && !skipDef) {
            const paramDefs = this.linkParamDefs;
            // 如果api给连接定义了新属性，但是数据库的老数据里肯定没有这个值，在这里填上
            for (const param of paramDefs) {
                const key = param.name || '';
                if (!this.params.has(key)) {
                    this.params.setValue(key, param.value_default);
                }
            }
        }
        return this;
    }

    @action
    public setCheckFormFailed(val: boolean) {
        this.checkFormFailed = val;
    }

    public checkForm() {
        if (isFieldEmpty(this.name) || isFieldEmpty(this.id)) {
            this.setCheckFormFailed(true);
            return false;
        }
        // 检查每个必填参数是否填写了
        const linkParams = this.linkParamDefs || [];
        for (const def of linkParams) {
            const value = this.params.getValue(def.name || '');
            if (def.required && isFieldEmpty(value)) {
                this.setCheckFormFailed(true);
                return false;
            }
        }

        return true;
    }

    @action
    public setName(val: string) {
        this.name = val;
    }

    public getValue(str: string, raw = false) {
        if (str === 'name') {
            return this.name;
        } else if (str === 'id') {
            return this.id;
        } else {
            return raw ? this.params.getRawValue(str) : this.params.getValue(str);
        }

    }

    @action
    public initInputsOutPuts(pipeline: EditModePipelineModel, json: IPipelineLink) {
        this.output = pipeline.widgets.find((w) => w.id === json.from_node_id)!;
        this.input = pipeline.widgets.find((w) => w.id === json.to_node_id)!;
        // input或者output由于widgetDef不存在被过滤，或者from_node_id和to_node_id不合法时
        if (!this.output.isNodeTypeExist() || !this.input.isNodeTypeExist()) {
            this.store!.definitionMissing = true;
            return null;
        }
        return this;
    }

    @action
    public fromParamDefs(def: ILinkParamDef[]) {
        for (const paramDef of def) {
            if (paramDef.name) {
                this.params.setValue(paramDef.name, paramDef.value_default);
            }
        }
        return this;
    }

    public static newPipelineLink(store: EditModeCanvasStore, input: WidgetModel, output: WidgetModel) {
        const ret = new PipelineLink(store);
        ret.input = input;
        ret.output = output;
        ret.id = uuidv1();
        return ret;
    }

    public toJson() {
        const fromId = this.output ? this.output.id : '';
        const toId = this.input ? this.input.id : '';
        // api返回的数据里可能一条连接的input或者output不存在，这种连接需要过滤并且给出警告
        if (!fromId || !toId) {
            console.warn(`Link ${name} does not have its input(${fromId}) or output(${toId})`);
        }

        return {
            from_node_id: fromId,
            to_node_id: toId,
            link_id: this.id,
            name: this.name,
            create_time: this.createTime,
            params: this.params.toJson(),
            checkFormFailed: this.checkFormFailed,
        };
    }

    public toSimpleJson() {
        const fromId = this.output ? this.output.id : '';
        const toId = this.input ? this.input.id : '';
        return {
            from_node_id: fromId,
            to_node_id: toId,
            link_id: this.id,
            name: this.name,
            checkFormFailed: this.checkFormFailed,
        };
    }
}
