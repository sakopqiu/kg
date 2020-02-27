import {EditModePipelineModel} from '../../../models/EditModePipelineModel';
import {action, computed, observable} from 'mobx';
import {Terminus, WidgetModel} from '../../../models/WidgetModel';
import {PipelineLink, TerminusLink} from '../../../models/LinkModel';
import _findIndex from 'lodash/findIndex';
import _remove from 'lodash/remove';
import _some from 'lodash/some';
import _find from 'lodash/find';
import _each from 'lodash/each';
import {CanvasStore} from '../../common/CanvasStore';
import {debug, IPoint, scrollPipeline} from '../../../utils';
import {EditModeCanvasTabStore} from './EditModeCanvasTabStore';
import {HistoryManager} from '../cyto/HistoryManager';
import {IPipeline, TERMINUS_RADIUS, USE_DEFAULT_BEHAVIOR} from '../interfaces';
import {leftPanelCollapsedWidth, leftPanelWidth, rightPanelWidth} from '../EditCanvasUtils';
import _get from 'lodash/get';
import {TreeStore} from '../../../stores/TreeStore/TreeStore';

const ratioMin: number = 30;
const ratioMax: number = 250;

export function within(targetStart: IPoint, targetEnd: IPoint, startArea: IPoint, endArea: IPoint) {
    return targetStart.x >= startArea.x && targetEnd.x <= endArea.x
        && targetStart.y >= startArea.y && targetEnd.y <= endArea.y;
}

export class EditModeCanvasStore<TreeFileRawType = any, TreeFolderRawType = any> extends CanvasStore {
    @observable public pipeline: EditModePipelineModel | null;
    // 进入待移动状态
    @observable public moveStatus: boolean = false;
    // 当前被选择的算子
    @observable public currentWidgets: WidgetModel[] = [];
    // 当前被选择连接
    @observable public currentLink: PipelineLink | null;

    // 当前被选中terminusLink
    @observable public currentTerminusLink: TerminusLink | null;

    // 当前被选中terminus
    @observable public currentTerminus: Terminus | null;

    // 当前悬浮着的终端节点
    @observable public currentHoveredTerminus: Terminus | null;

    // 当前被选择的输出端口
    @observable public currentSelectedOutPortWidget: WidgetModel | null;

    // 当前悬浮着的输入端口
    @observable public currentHoveredInPort: WidgetModel | null;

    // 临时线段的起点，一般是output
    @observable public tempLineStart: IPoint | null;
    // 临时线段的终点，一般是input
    @observable public tempLineEnd: IPoint | null;

    // 多选时临时区域的开始和结束节点
    @observable public tempAreaStart: IPoint | null;
    @observable public tempAreaEnd: IPoint | null;

    @observable public showBackgroundContextMenu: boolean = false;
    @observable public showWidgetContextMenu: boolean = false;
    @observable public showLinkContextMenu: boolean = false;
    @observable public showTerminusLinkContextMenu: boolean = false;
    @observable public showTerminusContextMenu: boolean = false;

    // antd menu需要用到的key，用于告知哪些节点需要展开
    @observable public openKeys: Set<string> = new Set<string>();
    // link或者背景被点击时，展开上下文菜单的位置
    @observable public clickEventPosition: IPoint | null = null;
    @observable public scrollInfo: IPoint = {x: 0, y: 0};
    // 画布的clientX和clientY，用于计算偏移
    @observable public mainCanvasClientPosition: IPoint | null;
    @observable public showNameAsValueSelector: boolean = true;
    @observable public svgWidth: number = 0;
    @observable public svgHeight: number = 0;
    // undefined时不显示
    @observable backgroundContextConfig: { x: number, y: number } | undefined = undefined;
    datasetTree: TreeStore = new TreeStore();

    // 图中有任何widgetDef或者linkDef被用户删除时会设置为true
    definitionMissing = false;

    public historyManager: HistoryManager;
    // 一次性的属性
    noHistory: boolean = false;
    cytoTempLineStart: WidgetModel | null = null;

    constructor(public parent: EditModeCanvasTabStore<EditModeCanvasStore<TreeFileRawType>, TreeFileRawType>) {
        super(parent);
        this.historyManager = new HistoryManager(this);
    }

    get isPipelineReadOnly() {
        if (this.pipeline) {
            return this.pipeline.readonly;
        }
        return false;
    }

    resetOnetimeStatus() {
        this.noHistory = false;
    }

    @action
    public setBackgroundContextMenuConfig(e: React.MouseEvent) {
        this.backgroundContextConfig = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    @action
    public closeBackgroundContextMenu() {
        this.backgroundContextConfig = undefined;
    }

    @action
    public updateCanvasClientPosition() {
        const container = document.getElementById(this.parent.canvasConfig.id)!;
        if (!container) {
            // 如果当前没有在PipelineEditor中，比如在列表中删除一个tab，会触发另一个tab的onSwitchedFrom被调用，从而触发该函数被调用，这种情况下什么都不需要
            return;
        }
        const bg = container.querySelector('.pipeline-background')!;
        const bgSvg = container.querySelector('.svg')!
            || document.querySelector('#edit-mode-cyto-background');
        // for svg
        if (bgSvg) {
            const size = bgSvg.getBoundingClientRect();
            const bgSize = bg.getBoundingClientRect();
            this.setSvgWidth(size.width);
            this.setSvgHeight(size.height);
            this.setMainCanvasClientPosition({x: bgSize.left, y: bgSize.top});
        }
    }

    /**
     * 用新的pipeline替换老的，用于前进后退，或者从api刷新
     */
    @action
    updatePipeline(newPipeline: IPipeline, markDirty: boolean) {
        this.currentWidgets = [];
        const oldTempMap = this.pipeline!.tempMap;
        const oldEasyTempMap = this.pipeline!.easyTempMap;

        const pieplineModel = new EditModePipelineModel(newPipeline, this.parent.canvasConfig.panningType);
        pieplineModel.initDetails(this, newPipeline);
        pieplineModel.dirty = markDirty;
        this.noHistory = true;
        // 改变pipeline将导致cytoBackground#reaction触发重绘或者svg重绘
        this.pipeline = pieplineModel;

        this.pipeline!.tempMap = oldTempMap;
        this.pipeline!.easyTempMap = oldEasyTempMap;
    }

    @action
    public setMainCanvasClientPosition(val: IPoint) {
        this.mainCanvasClientPosition = val;
    }

    @action
    public setSvgHeight(val: number) {
        this.svgHeight = val;
    }

    @action
    public setSvgWidth(val: number) {
        this.svgWidth = val;
    }

    @action
    setShowNameAsValueSelector(val: boolean) {
        this.showNameAsValueSelector = val;
    }

    @action
    public setOpenKeys(keys: string[]) {
        this.openKeys = new Set<string>(keys);
    }

    @action
    public closeKey(key: string) {
        const keys = Array.from(this.openKeys);
        _remove(keys, (k) => k.indexOf(key) === 0);
        this.openKeys = new Set<string>(keys);
    }

    @action
    public addKey(key: string) {
        this.openKeys.add(key);
    }

    @computed
    get rectWidth() {
        return this.parent.rectWidth;
    }

    @computed
    get rectHeight() {
        return this.parent.rectHeight;
    }

    @computed
    get circleRadius() {
        return this.parent.circleRadius;
    }

    @action
    public setScrollInfo(val: IPoint) {
        this.scrollInfo = val;
    }

    @action
    public setEditablePipeline(val: EditModePipelineModel) {
        this.pipeline = val;
    }

    @action
    public setClickEventPosition(val: IPoint) {
        this.clickEventPosition = val;
    }

    @computed
    public get widgets() {
        if (!this.pipeline) {
            return [];
        } else {
            return this.pipeline.widgets;
        }
    }

    public getWidgetById(id: string): WidgetModel | undefined {
        return _find(this.widgets, (w) => w.id === id);
    }

    public getLinkById(id: string): PipelineLink | undefined {
        return _find(this.links, (l) => l.id === id);
    }

    get isSnapped() {
        return this.pipeline ? this.pipeline.snap : false;
    }

    public snappedValue(val: number) {
        return val - val % this.parent.gridGap;
    }

    public snapEle(w: WidgetModel) {
        w.setXY(this.snappedValue(w.x), this.snappedValue(w.y));
    }

    public try2SnapAllEle() {
        if (!this.isSnapped) {
            return;
        }
        this.widgets.forEach((w) => this.snapEle(w));
    }

    /**
     * 是否对齐元素
     * @param {boolean} val
     */
    @action
    setSnap(val: boolean) {
        this.pipeline!.snap = val;
        this.try2SnapAllEle();
    }

    @computed
    get currentWidget(): WidgetModel | null {
        if (this.currentWidgets.length > 0) {
            return this.currentWidgets[0];
        }
        return null;
    }

    /**
     * 从window坐标系转换到svg坐标系
     * @param {IPoint} p
     * @returns {{x: number; y: number}}
     */
    clientToSvg(p: IPoint) {
        const offset = this.mainCanvasClientPosition!;
        const {scrollLeft, scrollTop} = EditModeCanvasTabStore.scrollDiffs();
        const translate = this.pipeline!.viewBoxPosition;
        return {
            x: (p.x - offset.x + scrollLeft) * this.humanRatio + translate.x,
            y: (p.y - offset.y + scrollTop) * this.humanRatio + translate.y,
        };
    }

    /**
     * 从当前流程图svg坐标系转换到window坐标系
     * @param {IPoint} svgP
     * @returns {{x: number; y: number}}
     */
    svgToClient(svgP: IPoint) {
        const offset = this.mainCanvasClientPosition!;
        const {scrollLeft, scrollTop} = EditModeCanvasTabStore.scrollDiffs();
        const translate = this.pipeline!.viewBoxPosition;

        const result = {
            x: (svgP.x - translate.x) / this.humanRatio + offset.x - scrollLeft,
            y: (svgP.y - translate.y) / this.humanRatio + offset.y - scrollTop,
        };
        debug('svgToClient:' + JSON.stringify(result));
        return result;
    }

    terminusPositionFor(terminus: Terminus) {
        const positions = this.terminusPositions;
        const index = this.pipeline!.terminusArray.findIndex(t => t === terminus);
        return positions[index];
    }

    @computed
    get terminusPositions(): IPoint[] {// 通过clientPosition计算出svg中底部出口的位置

        // 还未初始化的状态
        if (!this.mainCanvasClientPosition) {
            return [];
        }

        const terminusCount = this.pipeline!.terminusArray.length;
        if (terminusCount === 0) {
            return [];
        }

        const offset = this.mainCanvasClientPosition!;
        const y = offset.y + this.svgHeight;
        const result: IPoint[] = [];
        for (let i = 0; i < terminusCount; i++) {
            const x = this.svgWidth / (terminusCount + 1) * (i + 1) - TERMINUS_RADIUS + offset.x;
            result.push(this.clientToSvg({x, y}));
        }
        return result;
    }

    /**
     * 当前ctrl+左键框选的区域
     * @returns {{leftTop: {x: any; y: any}; rightBottom: {x: any; y: any}}}
     */
    selectionArea() {
        const p1 = this.clientToSvg(this.tempAreaStart!);
        const p2 = this.clientToSvg(this.tempAreaEnd!);

        const startX = Math.min(p1.x, p2.x);
        const startY = Math.min(p1.y, p2.y);
        return {
            leftTop: {
                x: startX,
                y: startY,
            },
            rightBottom: {
                x: startX + Math.abs(p1.x - p2.x),
                y: startY + Math.abs(p1.y - p2.y),
            },
        };
    }

    /**
     * 如果参数widget已经在currentWidgets中那么删除他，不然加入他
     * @param {WidgetModel} widget
     */
    @action
    public addOrRemoveWidget(widget: WidgetModel) {
        const c = _findIndex(this.currentWidgets, (w) => w === widget);
        if (c >= 0) {
            this.currentWidgets.splice(c, 1);
        } else {
            this.currentWidgets.push(widget);
        }
    }

    // svg调整视觉范围通过viewport，但是他和人的直观是相反的，
    // 比如放大1倍，原来的视角如果是1000*1000，那么新的viewport就变成500*500，而不是2000*2000，
    // 因此ratio虽然是2，但实际上应该对1000 / 2，而不是1000*2，为了在代码里更贴切人的直觉（计算比例是直觉偏向于用乘法)，
    // 这里加入一个便捷方法
    @computed
    get humanRatio(): number {
        return 1 / this.svgRatio;
    }

    @computed
    get svgRatio(): number {
        return this.pipeline ? this.pipeline.ratio : 1;
    }

    @computed
    get svgRatioDisplay() {
        if (!this.pipeline) {
            return 100;
        } else {
            return Math.round(this.pipeline.ratio * 100);
        }
    }

    @action
    public setRatio(val: number) {
        this.pipeline!.ratio = val;
    }

    @action
    public zoomOut(range = 0.05) {
        if (this.svgRatioDisplay > ratioMin) {
            this.pipeline!.ratio -= range;
        }
    }

    @action
    public zoomIn(range = 0.05) {
        if (this.svgRatioDisplay < ratioMax) {
            this.pipeline!.ratio += range;
        }
    }

    @action
    public closeAllMenus() {
        this.setShowWidgetContextMenu(false);
        this.setShowLinkContextMenu(false);
        this.setShowBackgroundContextMenu(false);
        this.closeBackgroundContextMenu();
        this.setShowTerminusLinkContextMenu(false);
        this.setShowTerminusContextMenu(false);
    }

    @action
    public clearAllSelections() {
        this.setCurrentWidgets([]);
        this.setCurrentLink(null);
        this.setCurrentTerminus(null);
        this.setCurrentTerminusLink(null);
        this.closeAllMenus();
    }

    @action
    public setMoveStatus(val: boolean) {
        this.moveStatus = val;
    }

    @action
    public setCurrentWidgets(val: WidgetModel[]) {
        this.currentWidgets = val;
        // 当前widget被选中时，清除error状态
        this.currentWidgets.forEach((w) => w.setCheckFormFailed(false));
        this.currentLink = null;
    }

    @action
    public setCurrentLink(val: PipelineLink | null) {
        this.currentLink = val;
        // 当前link被选中时，清除error状态
        if (val) {
            val.setCheckFormFailed(false);
        }
        this.currentWidgets = [];
    }

    @action
    public setShowWidgetContextMenu(val: boolean) {
        this.showWidgetContextMenu = val;
    }

    @action
    public setShowLinkContextMenu(val: boolean) {
        this.showLinkContextMenu = val;
    }

    @action
    public setShowTerminusLinkContextMenu(val: boolean) {
        this.showTerminusLinkContextMenu = val;
    }

    @action
    public setShowTerminusContextMenu(val: boolean) {
        this.showTerminusContextMenu = val;
    }

    @action
    public setShowBackgroundContextMenu(val: boolean) {
        this.showBackgroundContextMenu = val;
    }

    @action
    public addWidget(val: WidgetModel) {
        this.widgets.push(val);
        this.currentLink = null;
        this.currentWidgets = [val];
    }

    @action
    public addTerminus() {
        this.pipeline!.terminusArray.push(new Terminus());
    }

    @computed
    public get links() {
        if (this.pipeline) {
            return this.pipeline.links;
        } else {
            return [];
        }
    }

    @computed
    public get terminusLinks() {
        if (this.pipeline) {
            return this.pipeline.terminusLinks;
        } else {
            return [];
        }
    }

    @action
    public removeMixtureById(edgeIds: string[], widgetIds: string[]) {
        this.removeLinksById(edgeIds);
        this.removeTerminusLinksById(edgeIds);
        this.removeWidgetsById(widgetIds);
    }

    @action
    public clear() {
        if (this.pipeline) {
            const p = this.pipeline;
            p.widgets = [];
            p.links = [];
            p.terminusArray = [];
            p.terminusLinks = [];
            this.clearAllSelections();
        }
    }

    @action
    public removeSelectedWidgets() {
        const widgets = [...this.currentWidgets]; // prevent from concurrent modification
        for (const w of widgets) {
            this.removeWidget(w);
        }
        // clear currentWidgets, otherwise the widgets will stay even they're deleted...
        this.clearAllSelections();
    }

    @action
    public removeWidgetsById(ids: string[]) {
        const idSet = new Set<string>(ids);
        const widgets = [...this.widgets]; // prevent from concurrent modification
        for (const w of widgets) {
            if (idSet.has(w.id)) {
                this.removeWidget(w);
            }
        }
    }

    @action
    public removeTerminusLink(link: TerminusLink) {
        this.removeTerminusLinkById(link.id);
    }

    @action
    public removeLinksById(edgeIds: string[]) {
        for (const edgeId of edgeIds) {
            this.removeLinkById(edgeId);
        }
    }

    @action
    public removeTerminusLinksById(edgeIds: string[]) {
        for (const edgeId of edgeIds) {
            this.removeTerminusLinkById(edgeId);
        }
    }

    @action
    public removeTerminus(terminus: Terminus) {
        // 删除相关link
        const victims = this.terminusLinks.filter(link => link.input === terminus)
            .map(link => link.id);
        this.removeTerminusLinksById(victims);
        _remove(this.pipeline!.terminusArray, t => t === terminus);
    }

    @action
    public removeWidget(val: WidgetModel) {
        const linkVictims: string[] = [];
        const terminusLinkVictims: string[] = [];
        for (const link of this.links) {
            if (link.input === val || link.output === val) {
                linkVictims.push(link.id);
            }
        }
        for (const tLink of this.terminusLinks) {
            if (tLink.output === val) {
                terminusLinkVictims.push(tLink.id);
            }
        }
        this.removeLinksById(linkVictims);
        this.removeTerminusLinksById(terminusLinkVictims);
        const removedWidgets = _remove(this.widgets, ((widget) => val === widget));
        // 因为widget.param上绑定了paramsUpdate事件，销毁时需要删除所有的listener
        removedWidgets.forEach((w: WidgetModel) => {
            w.params.removeAllListeners();
        });
    }

    @action
    public copySingleWidget(source: WidgetModel) {
        const widget = source.copyFrom();
        widget.setX(source.x + 30);
        widget.setY(source.y + 30);
        return widget;
    }

    @action
    public copyWidgets() {
        const existingWidgetIds = this.currentWidgets.reduce((result: Map<string, WidgetModel>, current) => {
            result.set(current.id, current);
            return result;
        }, new Map());
        const linksNeedsCopied = this.links.filter((link) => existingWidgetIds.has(link.input.id) && existingWidgetIds.has(link.output.id));
        // 处理link上widget的添加
        const newWidgets: Map<string, WidgetModel> = new Map<string, WidgetModel>();
        // 需要记录copied widget 和 new widget 之间的id map
        const oldWidgetNewWidgetIdMap: Map<string, string> = new Map<string, string>();
        _each(linksNeedsCopied, (link) => {
            let sourceWidget: WidgetModel;
            let targetWidget: WidgetModel;
            // process source widget
            if (existingWidgetIds.has(link.output.id)) {
                sourceWidget = this.copySingleWidget(link.output);
                existingWidgetIds.delete(link.output.id);
                newWidgets.set(sourceWidget.id, sourceWidget);
                oldWidgetNewWidgetIdMap.set(link.output.id, sourceWidget.id);
                this.widgets.push(sourceWidget);
            } else {
                sourceWidget = newWidgets.get(oldWidgetNewWidgetIdMap.get(link.output.id)!)!;
            }
            // process target widget
            if (existingWidgetIds.has(link.input.id)) {
                targetWidget = this.copySingleWidget(link.input);
                existingWidgetIds.delete(link.input.id);
                newWidgets.set(targetWidget.id, targetWidget);
                oldWidgetNewWidgetIdMap.set(link.input.id, targetWidget.id);
                this.widgets.push(targetWidget);
            } else {
                targetWidget = newWidgets.get(oldWidgetNewWidgetIdMap.get(link.input.id)!)!;
            }
            this.addLink(targetWidget, sourceWidget);
        });
        // copy the rest widgets...
        const restWidgets = Array.from(existingWidgetIds.values()).map((widget) => {
            const copiedWidget = this.copySingleWidget(widget);
            this.widgets.push(copiedWidget);
            return copiedWidget;
        });
        return restWidgets.concat(Array.from(newWidgets.values()));
    }

    // 尝试选择多个算子
    @action
    public tryToSelectWidgets() {
        const result: WidgetModel[] = [];
        if (this.tempAreaStart && this.tempAreaEnd) {
            const {leftTop, rightBottom} = this.selectionArea();

            for (const widget of this.widgets) {
                const {startPoint, endPoint} = this.parent.widgetBoundingArea(widget);
                if (within(startPoint, endPoint, leftTop, rightBottom)) {
                    result.push(widget);
                }
            }
            this.currentWidgets = result;
        }
    }

    @action
    public addLink(input: WidgetModel, output: WidgetModel) {
        const p = this.parent;
        if (!p.canvasConfig.allowDuplication) {
            for (const conn of this.links) {
                if (conn.input === input && conn.output === output) {
                    return;
                }
            }
        }
        const newLink = PipelineLink.newPipelineLink(this, input, output);
        if (newLink.linkParamDefs) {
            newLink.fromParamDefs(newLink.linkParamDefs);
        }
        this.links.push(newLink);
        this.setCurrentWidgets([]);
        this.setCurrentLink(newLink);
    }

    @action
    public addTerminusLink(input: Terminus) {
        const newLink = TerminusLink.newTerminusLink(input, this.currentSelectedOutPortWidget!);
        this.terminusLinks.push(newLink);
        this.setCurrentWidgets([]);
        this.setCurrentLink(null);
    }

    @action
    public removeLink(link: PipelineLink) {
        this.removeLinkById(link.id);
    }

    @action
    public removeLinkById(id: string) {
        const removedLinks = _remove(this.links, (l) => l.id === id);
        removedLinks.forEach((l) => l.params.removeAllListeners());
    }

    @action
    public removeTerminusLinkById(id: string) {
        const removedLinks = _remove(this.terminusLinks, (l) => l.id === id);
        removedLinks.forEach((l) => l.params.removeAllListeners());
    }

    @action
    public setCurrentSelectedOutPort(val: WidgetModel | null) {
        this.currentSelectedOutPortWidget = val;
    }

    @action
    public setCurrentTerminusLink(val: TerminusLink | null) {
        this.currentTerminusLink = val;
    }

    @action
    public setCurrentTerminus(val: Terminus | null) {
        this.currentTerminus = val;
    }

    @action
    public setCurrentHoveredInPort(val: WidgetModel | null) {
        this.currentHoveredInPort = val;
    }

    @action
    public setCurrentHoveredTerminus(val: Terminus | null) {
        this.currentHoveredTerminus = val;
    }

    @action
    public setTempAreaStart(val: IPoint | null) {
        this.tempAreaStart = val;
    }

    @action
    public setTempAreaEnd(val: IPoint | null) {
        this.tempAreaEnd = val;
    }

    @action
    public setTempLineStart(val: IPoint | null) {
        this.tempLineStart = val;
    }

    @action
    public setTempLineEnd(val: IPoint | null) {
        this.tempLineEnd = val;
    }

    @computed
    public get isLinking() {
        return this.tempLineStart && this.tempLineEnd && this.currentSelectedOutPortWidget;
    }

    @computed
    get allWidgetNamesSet(): Set<string> {
        const widgetNames = this.widgets.map((w) => w.name);
        return new Set<string>(widgetNames);
    }

    @computed
    get allLinkNamesSet(): Set<string> {
        const linkNames = this.links.map((l) => l.name);
        return new Set<string>(linkNames);
    }

    @computed
    get allWidgetNames(): string[] {
        return Array.from(this.allWidgetNamesSet);
    }

    @action
    public resetLinkStatus() {
        this.setCurrentSelectedOutPort(null);
        this.setCurrentHoveredInPort(null);
        this.setCurrentHoveredTerminus(null);
        this.setTempLineStart(null);
        this.setTempLineEnd(null);
    }

    @action
    public isSameTarget(): boolean {
        const input = this.currentHoveredInPort;
        const output = this.currentSelectedOutPortWidget;
        return !!input && !!output && input === output;
    }

    public canCreateLink(): boolean {
        return !!this.currentSelectedOutPortWidget && !!this.currentHoveredInPort && !this.isSameTarget();
    }

    public canCreateTerminusLink(): boolean {
        if (!!this.currentSelectedOutPortWidget && !!this.currentHoveredTerminus) {
            if (this.isTerminusCandidate(this.currentHoveredTerminus)) {
                const alreadyExists = _some(this.terminusLinks, (link) => {
                    return link.output === this.currentSelectedOutPortWidget
                        && link.input === this.currentHoveredTerminus;
                });
                return !alreadyExists;
            }
        }
        return false;
    }

    // 两个算子之间是否存在连接
    @action
    public linkExistBetween(input: WidgetModel, output: WidgetModel) {
        return _some(this.links, (link) => link.input === input && link.output === output);
    }

    public isWidgetCandidate(widget: WidgetModel) {
        if (!this.currentSelectedOutPortWidget) {
            return false;
        }

        let isCandidate = !this.linkExistBetween(widget, this.currentSelectedOutPortWidget) &&
            widget !== this.currentSelectedOutPortWidget;

        if (isCandidate && this.parent.canvasConfig.callbacks.canBecomeInput) {
            isCandidate = isCandidate && this.parent.canvasConfig.callbacks.canBecomeInput(widget, this.currentSelectedOutPortWidget);
        }

        return isCandidate;
    }

    // 每个terminus只有一个连接，如果有了就不能再被连上
    public isTerminusCandidate(terminus: Terminus) {
        if (!this.currentSelectedOutPortWidget) {
            return false;
        }

        const hasAnyLink = this.pipeline!.terminusLinks.find(link => {
            if (link.input === terminus) {
                return true;
            }
            return false;
        });
        return !hasAnyLink;
    }

    public checkForm() {
        let result = true;

        // 特殊的pipeline validate逻辑自己决定
        const validatePipeline = _get(this.parent.canvasConfig, 'callbacks.validatePipeline');
        if (validatePipeline) {
            const result = validatePipeline!(this);
            // 如果使用默认行为，逻辑继续往下走
            if (result !== USE_DEFAULT_BEHAVIOR) {
                return result as boolean;
            }
        }

        this.widgets.forEach((w: WidgetModel) => {
            result = w.checkForm() && result;
        });
        if (!this.parent.canvasConfig.ignoreLinkValidation) {
            this.links.forEach((l: PipelineLink) => {
                result = l.checkForm() && result;
            });
        }
        return result;
    }

    onPipelineClosed() {
        if (this.pipeline && this.pipeline.reactionDisposer) {
            this.pipeline.reactionDisposer();
            debug('dirty flag monitor released for ' + this.pipeline.name);
        }
    }

    async onSwitchedFrom(oldStore: EditModeCanvasStore) {
        if (this.parent.isCytoMode()) {// cyto
            this.noHistory = true; // 切换tab不生成history
            this.pipeline!.needRedraw = true;
        } else {
            this.updateCanvasClientPosition();
            scrollPipeline(this.pipeline!.scrollDimension);
        }
    }

    @computed
    get canvasWidth() {
        const rightWidth = this.detailsPanelCollapsed || this.parent.canvasConfig.hideDetailsPanel ? 0 : rightPanelWidth(this.parent.canvasConfig);
        const leftWidth = this.pipeline!.readonly || this.parent.canvasConfig.hideDatasetPanel ? 0 : this.leftPanelCollapsed ? leftPanelCollapsedWidth() :
            leftPanelWidth(this.parent.canvasConfig);
        const total = rightWidth + leftWidth;
        return `calc(100% - ${total}px)`;
    }

    // 一个widget的所有向内的连接
    allInBoundLinksFor(widget: WidgetModel) {
        const links: PipelineLink[] = [];
        for (const link of this.links) {
            if (link.input === widget) {
                links.push(link);
            }
        }
        return links;
    }

    inPortsPositions(widget: WidgetModel, parentWidth: number, cornerRadius: number) {
        // 已经有绑定的inports
        const isCandidate = this!.isWidgetCandidate(widget);

        // 可用于放置port的宽度，圆角边会被消掉
        const availableWidth = parentWidth - cornerRadius * 2;

        const links = this.allInBoundLinksFor(widget);
        const portCount = isCandidate ? links.length + 1 : links.length;

        const gap = availableWidth / (portCount + 1);
        // key为link的id，number为该link所指向的port的位置
        const result: Map<string, number> = new Map<string, number>();
        for (let i = 0; i < portCount; i++) {
            // 如果当前widget是candidate，则会多出一个position留来给新连接
            const link = links[i];
            if (link) {
                result.set(links[i].id, gap * (i + 1));
            } else {
                result.set('candidate', gap * (i + 1));
            }
        }
        return result;
    }

}
