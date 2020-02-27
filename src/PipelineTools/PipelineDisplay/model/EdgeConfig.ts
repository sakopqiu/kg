import {observable, action} from 'mobx';

// 边的配置，支持配置权重，预留颜色字段
export class EdgeConfig {
    @observable show: boolean = true; // 表示权重的字段
    constructor(public name: string) {
    }

    toJSON() {
        return {
            name: this.name,
            show: this.show,
        };
    }

    @action
    static fromJSON(json: any): EdgeConfig {
        const ret = new EdgeConfig(json.name);
        ret.show = json.show;
        return ret;
    }

    @action
    setShow(val: boolean) {
        this.show = val;
    }
}
