import {CyState} from './CyState';
import {action, isObservable, observable} from 'mobx';
import {ElementGroup} from 'cytoscape';
import {CyNodeData} from './CyNode';
import {CyEdgeData} from './CyEdge';
import {cytoCloneObj} from '../../../utils';
import {TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';

export enum CyType {
    'NODE' = 'NODE',
    'EDGE' = 'EDGE',
    'PATH_BEACON_EDGE' = 'PATH_BEACON_EDGE',
    'EDGEGROUP' = 'EDGEGROUP',
    'COMMUNITY' = 'COMMUNITY',
    'DESCRIPTION' = 'DESCRIPTION',
    'TEXT' = 'TEXT',
    'ARROW' = 'ARROW',
}

export abstract class CyElement {
    static defaultClass = '';
    data: CyElementData;

    @observable public selected: boolean;

    @action
    setSelected(selected: boolean) {
        this.selected = selected;
    }

    classSet: Map<string, any> = new Map<string, any>();

    public addClass(c: string) {
        this.classSet.set(c, 0);
    }

    public removeClass(c: string) {
        this.classSet.delete(c);
    }

    @action
    public becomeTempInvisible() {
        this.addClass(TEMP_HIDDEN_CLASS);
    }

    public becomeVisible() {
        this.classSet.delete(TEMP_HIDDEN_CLASS);
    }

    public hasClass(c: string) {
        return this.classSet.has(c);
    }

    public get classes() {
        // this.classSet.set('init-hidden', true);
        return Array.from(this.classSet.keys()).join(' ');
    }

    abstract get group(): ElementGroup;

    constructor(public cyState?: CyState) {
        this.initCssClass();
    }

    protected initCssClass(): CyElement {
        this.addClass((this.constructor as any).defaultClass);
        return this;
    }

    protected initClassSet(obj: any) {
        if (obj) {
            const entries = (obj as Map<string, number>).entries();
            this.classSet = new Map<string, any>(entries);
        }
    }

    // 将内部形式转换成cytoscape需要的格式,这里只是简单的复制一下对象，
    // 因为cytoscape不接受一个节点有__proto__属性
    cytoFormat() {
        // 需要getter数据就用lodash的assign
        const data = cytoCloneObj(this.data);
        const ret = cytoCloneObj(this);
        ret.data = data;
        delete ret.cyState;
        delete ret.data.cyState;
        return ret;
    }

    toJSON() {
        // 不需要getter数据就用Object.assign
        const obj = Object.assign({}, this);
        obj.data = Object.assign({}, this.data);
        delete obj.classSet;
        delete obj.cyState;
        // delete obj.selected;
        delete obj.data.cyState;
        return obj;
    }
}

export abstract class CyElementData {
    id: string;
    public params: Map<string, any> = new Map<string, any>();

    constructor(public cyState?: CyState) {
    }

    static copyParams(params: any, data: CyNodeData | CyEdgeData) {
        data.params = new Map<string, any>();

        if (isObservable(params)) {
            data.params = params;
            // for (const key of params.keys()) {
            //     data.params.set(key, params.get(key));
            // }
        } else {
            // 从api获得的裸数据
            for (const key in params) {
                data.params.set(key, params[key]);
            }
        }
    }
    abstract get cyType(): CyType;
}

export interface HasParent {
    parent: string;
}
