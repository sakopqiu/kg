// 节点类型（Person，Company）的配置，目前支持配置颜色，以及社群
import {action, observable} from 'mobx';

export class NodeTypeConfig {
    @observable public show: boolean = true;
    public name: string;

    @action
    static newConfig(name: string) {
        const ret = new NodeTypeConfig();
        ret.name = name;
        ret.show = true;
        return ret;
    }

    toJSON() {
        return {
            name: this.name,
            show: this.show,
        };
    }

    @action
    static fromJSON(json: any) {
        const config = new NodeTypeConfig();
        config.name = json.name;
        config.show = json.show;
        return config;
    }

    @action
    public setShow(val: boolean) {
        this.show = val;
    }

}
