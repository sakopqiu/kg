import {action, computed, observable, ObservableMap, runInAction, toJS} from 'mobx';
import uuidv1 from 'uuid/v1';
import {IParamsContainer} from '../PipelineTools/common/interfaces';
import {IPipelineTerminus, IWidget} from '../PipelineTools/PipelineEditor/interfaces';
import EventEmitter from 'wolfy87-eventemitter';
import {EditModeCanvasStore} from '../PipelineTools/PipelineEditor/stores/EditModeCanvasStore';
import {isFieldEmpty} from '../PipelineTools/PipelineEditor/EditCanvasUtils';
import {IPoint} from '../utils';
import {TreeFile} from '../stores/TreeStore/TreeStoreModels';
import _get from 'lodash/get';

export class ParamsContainer extends EventEmitter {
    private map: ObservableMap<string, any> = new ObservableMap<string, any>();

    toJson(): any {
        const entries: Record<string, any> = {};
        for (const key of this.map.keys()) {
            entries[key] = toJS(this.map.get(key)!);
        }
        return entries;
    }

    static fromJson(json: IParamsContainer) {
        const ret = new ParamsContainer();
        runInAction(() => {
            for (const key of Object.keys(json)) {
                ret.setValueNoEvent(key, json[key]);
            }
        });
        return ret;
    }

    initWith(param: IParamsContainer) {
        for (const key in param) {
            this.map.set(key, param[key]);
        }
    }

    clear() {
        return this.map.clear();
    }

    has(key: string) {
        return this.map.has(key);
    }

    @action
    setValue(key: string, val: any) {
        this.map.set(key, val);
        this.emitEvent('paramUpdated', [key, val]);
    }

    @action
    setValueNoEvent(key: string, val: any) {
        this.map.set(key, val);
    }

    @action
    replaceWith(newMap: {
        [key: string]: any,
    }) {
        this.map.clear();
        for (const key of Object.keys(newMap)) {
            this.map.set(key, newMap[key]);
        }
    }

    // 返回一个不带mobx版本的对象，即一个新对象
    getValue(key: string) {
        return toJS(this.map.get(key));
    }

    getRawValue(key: string) {
        return this.map.get(key);
    }

    keys() {
        return this.map.keys();
    }

    deleteKey(val: string) {
        return this.map.delete(val);
    }

    entries() {
        return this.map.entries();
    }
}

export enum WidgetStatus {
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    SUCCESS = 'SUCCESS',
    NONE = 'NONE',
    SKIPPED = 'SKIPPED',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
}

export class Terminus {
    public static UNKNOWN_ID = 'unknown';
    public id: string = uuidv1();
    public name: string = '';
    @observable public params: ParamsContainer = new ParamsContainer();

    public getValue(str: string, raw = false) {
        if (str === 'id') {
            return this.id;
        } else {
            return raw ? this.params.getRawValue(str) : this.params.getValue(str);
        }
    }

    static fromJSON(terminusJson: IPipelineTerminus) {
        const ret = new Terminus();
        runInAction(() => {
            ret.id = terminusJson.id;
            if (!ret.id || ret.id === Terminus.UNKNOWN_ID) {
                ret.id = uuidv1();
            }
            ret.name = terminusJson.name;
            ret.params = ParamsContainer.fromJson(terminusJson.params);
        });
        return ret;
    }

    toJson(): IPipelineTerminus {
        return {
            id: this.id,
            name: this.name,
            params: this.params.toJson(),
        };
    }

    toSimpleJson() {
        return {
            id: this.id,
            name: this.name,
        };
    }

}

export class WidgetModel {
    public store: EditModeCanvasStore;

    // 算子当前状态
    @observable public status: WidgetStatus = WidgetStatus.NONE;
    @observable public x: number = 0;
    @observable public y: number = 0;
    @observable public name: string = '';
    @observable public id: string;
    @observable public params: ParamsContainer = new ParamsContainer();
    @observable public nodeType: string;
    @observable public checkFormFailed: boolean = false;

    // 当算子第一次被拖出来时，调用双参数构造函数，如果是从api这里复原，那么执行
    // 单参数构造函数，然后调用下面的fromJson来初始化算子
    public constructor(store: EditModeCanvasStore) {
        this.store = store;
        if (this.store.parent.singleton) {
            this.params.addListener('paramUpdated', this.updateParam.bind(this));
        }
    }

    @computed
    get dataset() {
        return this.store.datasetTree.getByKey(this.nodeType) as TreeFile;
    }

    get paramDefs() {
        if (!this.store.parent.canvasConfig.callbacks.getWidgetParamDefs) {
            return null;
        }
        // 如果该nodeType不存在（比如说之前用户配置的数据集被删除了）
        if (!this.dataset) {
            return null;
        }
        return this.store.parent.canvasConfig.callbacks.getWidgetParamDefs(this.store, this);
    }

    @computed
    get dimension(): IPoint {
        return {x: this.x, y: this.y};
    }

    // 以下三个方法通过不同渠道生成一个新的WidgetModel
    // 复制功能
    public copyFrom() {
        const newWidget = new WidgetModel(this.store);
        newWidget.name = this.name;
        newWidget.nodeType = this.nodeType;
        newWidget.genId();
        for (const [key, value] of this.params.entries()) {
            newWidget.params.setValueNoEvent(key, value);
        }
        return newWidget;
    }

    @action
    setNodeType(nodeType: string) {
        const oldVal = this.nodeType;
        // 更改nodeType导致this.dataset发生改变，
        this.nodeType = nodeType;
        if (_get(this.store.parent.canvasConfig, 'events.onNodeTypeChanged')) {
            this.store.parent.canvasConfig.events!.onNodeTypeChanged!(this, oldVal, nodeType);
        }
        // 利用fromDataset重新设置所有侧参数值
        if (this.nodeType && this.paramDefs) {
            this.fromDataset(this.dataset!);
        }
    }

    // 从左侧拖出或者双击左侧数据集
    @action
    public fromDataset(treeFile: TreeFile) {
        this.genId();
        this.nodeType = treeFile.key;
        const def = this.paramDefs!;
        if (def) {
            for (const paramDef of def) {
                this.params.setValue(paramDef.name!, paramDef.value_default);
            }
        }
        this.nodeType = treeFile.key;
        if (this.store.parent.singleton) {
            this.name = '';
        } else {
            this.name = treeFile.name;
        }
        return this;
    }

    // 获取某个算子的nodeType所对应的TreeFile对象
    getNodeType() {
        return this.store.datasetTree.getByKey(this.nodeType) as TreeFile | undefined;
    }

    // 也许某个算子对应的数据集或者实体已经被删除了
    isNodeTypeExist() {
        // 节点时模板中的某个节点并且未被映射时，nodeType为null
        if (!this.nodeType) {
            return true;
        }
        // 有些图没有左侧的树，只做纯展示，那么这类图不需要检测nodeType是否存在
        if (this.store.parent.canvasConfig.hideDatasetPanel) {
            return true;
        }
        return !!this.getNodeType();
    }

    // 从api读取
    @action
    public fromJson(json: IWidget, skipWidgetDef: boolean) {
        this.id = json.node_id;
        this.name = json.node_name;
        this.nodeType = json.node_type;

        if (json.node_props) {
            this.params.initWith(json.node_props);
        }
        this.x = json.node_ui ? json.node_ui.location_x || 0 : 0;
        this.y = json.node_ui ? json.node_ui.location_y || 0 : 0;

        if (!skipWidgetDef) {
            if (!this.nodeType) {// 蓝图模板未匹配上时是没有nodeType的
                return this;
            }
            if (!this.isNodeTypeExist) {
                this.store.definitionMissing = true;
                return null; // 数据集或者实体可能被用户删除了
            }

            if (this.paramDefs) {
                for (const param of this.paramDefs) {
                    // api这里给某个算子定义了新属性，但是数据库里的算子没有这个值，在这里填上
                    if (!this.params.has(param.name!)) {
                        this.params.setValue(param.name!, param.value_default);
                    }
                }
            }
        }

        return this;
    }

    get canonicalId() {
        return this.nodeType + this.id;
    }

    private updateParam(key: string, val: any) {
        for (const w of this.store.widgets) {
            if (w.name === this.name && w.name.trim() !== '' && w !== this) {
                w.params.setValueNoEvent(key, val);
            }
        }
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

    public toJson() {
        return {
            node_id: this.id,
            node_name: this.name,
            node_props: this.params.toJson(),
            node_type: this.nodeType,
            checkFormFailed: this.checkFormFailed,
            node_ui: {
                location_x: this.x,
                location_y: this.y,
            },
        };
    }

    public toSimpleJson() {
        return {
            node_id: this.id,
            node_name: this.name,
            node_props: this.params.toJson(),
            node_type: this.nodeType,
            checkFormFailed: this.checkFormFailed,
            x: this.x,
            y: this.y,
        };
    }

    @action
    private genId() {
        this.id = uuidv1();
    }

    @action
    public setStatus(val: WidgetStatus) {
        this.status = val;
    }

    @action
    public remove() {
        this.store.removeWidget(this);
    }

    @computed
    get isSelected() {
        return !!this.store.currentWidgets.find(w => w.id === this.id);
    }

    @action
    public setCheckFormFailed(val: boolean) {
        this.checkFormFailed = val;
    }

    // singleton模式下用于统一设置 TODO未实现
    @action
    public setParamsContainer(params: ParamsContainer) {
        this.params = params;
    }

    public checkForm() {
        if (isFieldEmpty(this.name) || isFieldEmpty(this.id)) {
            this.setCheckFormFailed(true);
            return false;
        }
        // 检查每个必填参数是否填写了
        const paramDefs = this.paramDefs;
        if (paramDefs) {
            for (const def of paramDefs) {
                if (def.validateFunc) {
                    if (!def.validateFunc()) {
                        this.setCheckFormFailed(true);
                        return false;
                    }
                } else {
                    const value = this.params.getValue(def.name || '');
                    if (def.required && isFieldEmpty(value)) {
                        this.setCheckFormFailed(true);
                        return false;
                    }
                }
            }
        }
        this.setCheckFormFailed(false);
        return true;
    }

    @action
    public setName(val: string) {
        this.name = val;

    }

    @action
    public setX(val: number) {
        this.x = val;
    }

    @action
    public setY(val: number) {
        this.y = val;
    }

    @action
    public setXY(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
