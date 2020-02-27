// 管理canvas的前进后退
import {CanvasDrawService} from './CanvasDrawService';
import {observable, action, computed} from 'mobx';
import {CommonService} from './CommonService';
// import {debug, isDebugMode} from "../../../utils";

// canvas的历史记录
export class HistoryService extends CommonService {
    @observable private stack: string[] = [];
    @observable private cursor: number = -1;

    constructor(public drawService: CanvasDrawService, public historySize = 20) {
        super(drawService);
        this.back = this.back.bind(this);
        this.forward = this.forward.bind(this);
        this.push = this.push.bind(this);
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

    @action
    public async back() {
        if (this.canBack) {
            this.cursor--;
            this.timeFilterService.showTimeFilter = false;
            const cyState = this.drawService.cyState;
            cyState.reloadFromHistory(this.current);
            cyState.noHistory = true;
        }
    }

    @action
    public async forward() {
        if (this.canForward) {
            this.cursor++;
            this.timeFilterService.showTimeFilter = false;
            const cyState = this.drawService.cyState;
            cyState.reloadFromHistory(this.current);
            cyState.noHistory = true;
        }
    }

    @computed
    get footPrint() {
        let totalCharacters = 0;
        for (const c of this.stack) {
            const len = c.length;
            for (let j = 0; j < len; j++) {
                if (c.charCodeAt(j) < 255) {
                    totalCharacters++;
                } else {
                    totalCharacters += 2;
                }
            }
        }
        return totalCharacters / 1048576;
    }

    // 新添加一个历史记录，如果当前stack长度是5，而cursor在2（cursor范围是0-4)，
    // 此时用户的某个操作导致cursor后的记录被清除
    @action
    public push() {
        if (this.cursor !== this.lastIndex) {
            const victimIndex = this.cursor + 1;
            this.stack.splice(victimIndex, (this.lastIndex - victimIndex) + 1);
        }
        this.stack.push(this.serializationService.serialize());
        this.cursor++;
        if (this.stack.length > this.historySize) {
            const diff = this.stack.length - this.historySize;
            this.stack = this.stack.slice(diff);
            this.cursor -= diff;
        }

        // if (isDebugMode()) {
        //     debug(`Current history status, \n
        //     items: ${this.stack.length},
        //     cursor: ${this.cursor},
        //     mem footprint: ${this.footPrint} MB,
        // `);
        // }
    }

}
