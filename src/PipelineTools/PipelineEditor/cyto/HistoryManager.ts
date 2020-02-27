// 管理canvas的前进后退
import {action, computed, observable} from 'mobx';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';

// canvas的历史记录
export class HistoryManager {
    @observable private stack: string[] = [];
    @observable private cursor: number = -1;

    constructor(public mainStore: EditModeCanvasStore) {
        this.back = this.back.bind(this);
        this.forward = this.forward.bind(this);
        this.push = this.push.bind(this);
    }

    get pipeline() {
        return this.mainStore.pipeline!;
    }

    @computed
    get lastIndex() {
        return this.stack.length - 1;
    }

    @computed
    get canBack() {
        return this.stack.length > 0 && this.cursor > 0;
    }

    @computed
    get canForward() {
        return this.stack.length > 0 && this.cursor < this.lastIndex;
    }

    @computed
    get current() {
        return this.stack[this.cursor];
    }

    private triggerRerendering() {
        const json = JSON.parse(this.current);
        this.mainStore.updatePipeline(json, true);
        console.log(this.stack.length + ': ' + this.cursor);
    }

    @action
    public back() {
        if (this.canBack) {
            this.mainStore.noHistory = true; // 撤退导致的变化不进入history
            this.cursor--;
            this.triggerRerendering();
        }
    }

    @action
    public forward() {
        if (this.canForward) {
            this.mainStore.noHistory = true; // 前进导致的变化不进入history
            this.cursor++;
            this.triggerRerendering();
        }
    }

    // 新添加一个历史记录，如果当前stack长度是5，而cursor在2（cursor范围是0-4)，
    // 此时用户的某个操作导致cursor后的记录被清除
    @action
    public push() {
        if (this.cursor !== this.lastIndex) {
            const victimIndex = this.cursor + 1;
            this.stack.splice(victimIndex, (this.lastIndex - victimIndex) + 1);
        }
        this.stack.push(JSON.stringify(this.pipeline!.toJson()));
        this.cursor++;

    }

}
