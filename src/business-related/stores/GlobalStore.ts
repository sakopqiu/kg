import {action, observable} from 'mobx';
import {LoadableStoreImpl} from '../../stores/LoadableStoreImpl';
import {SophonTheme} from '../../components/SophonThemeSelect/interface';

// 全局一些共享变量的store
export class GlobalStore extends LoadableStoreImpl {

    constructor() {
        super();
    }

    @observable public theme: SophonTheme = SophonTheme.DEFAULT;

    @action
    public setTheme(theme: SophonTheme) {
        this.theme = theme;
    }

}

export const globalStore = new GlobalStore();
