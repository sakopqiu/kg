/**
 * 定义所有的工具便捷方法
 */
import {CommonService} from './CommonService';
import {CanvasDrawService} from './CanvasDrawService';
import {observable, action, computed} from 'mobx';
import {SelectedElementDiffInfo} from '../interfaces';

export class DiffService extends CommonService {
    @observable public diffDetailsCollapsed = false;
    @observable public currentSelectedDiffObj: SelectedElementDiffInfo | undefined;
    @observable public showAll: boolean = false;
    @observable diffCy: any;

    constructor(drawService: CanvasDrawService) {
        super(drawService);
    }

    @action
    public setCurrentSelectedDiffObj(val: SelectedElementDiffInfo | undefined) {
        this.currentSelectedDiffObj = val;
    }

    @action
    public toggleDiffDetailsCollapsed() {
        this.diffDetailsCollapsed = !this.diffDetailsCollapsed;
    }

    @action
    public setDiffCy(val: any | null) {
        this.diffCy = val;
    }

    @action
    public setShowAll(val: boolean) {
        this.showAll = val;
    }

    @computed
    get isInDiffMode() {
        return !!this.diffCy;
    }

}
