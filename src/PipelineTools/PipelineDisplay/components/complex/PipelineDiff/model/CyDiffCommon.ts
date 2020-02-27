import {ElementGroup} from 'cytoscape';
import {cytoCloneObj} from '../../../../../../utils';
import {CommonElementData, MutationNameType} from '../../../../kg-interface';

export enum ModificationColor {
    add = '#00c58a',
    delete = '#e7df56',
    update = '#e8595c',
    default = '#D1D1D1',
}

export const COMMON_OPACITY = 0.3;

export abstract class CyDiffCommon {
    classSet: Map<string, any> = new Map<string, any>();
    data: CyDiffCommonData;

    public addClass(c: string) {
        this.classSet.set(c, 0);
    }

    public removeClass(c: string) {
        this.classSet.delete(c);
    }

    public hasClass(c: string) {
        return this.classSet.has(c);
    }

    public get classes() {
        return Array.from(this.classSet.keys()).join(' ');
    }

    constructor() {
        this.initCssClass();
    }

    protected initCssClass(): CyDiffCommon {
        this.addClass((this.constructor as any).defaultClass);
        return this;
    }

    // 将内部形式转换成cytoscape需要的格式,这里只是简单的复制一下对象，
    // 因为cytoscape不接受一个节点有__proto__属性
    cytoFormat() {
        // 需要getter数据就用lodash的assign
        const data = cytoCloneObj(this.data);
        const ret = cytoCloneObj(this);
        ret.data = data;
        return ret;
    }

    abstract get group(): ElementGroup;
}

export abstract class CyDiffCommonData {
    mutationName: MutationNameType | undefined;

    constructor(json: CommonElementData) {
        this.mutationName = json.mutationName;
    }

}
