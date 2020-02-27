import _get from 'lodash/get';
import {observable, action} from 'mobx';
import {LineColors} from '../components/complex/interface';

export class ColorConfig {
    @observable color: string;
    @observable opacity: number;

    private constructor() {
    }

    @action
    setColor(val: string) {
        this.color = val;
    }

    @action
    setOpacity(val: number) {
        this.opacity = val;
    }

    static fromJSON(json: any, defaultColor?: string) {
        const ret = new ColorConfig();
        ret.color = _get(json, 'color', defaultColor || LineColors.COLOR1);
        ret.opacity = Number(_get(json, 'opacity', 100));
        return ret;
    }
}
