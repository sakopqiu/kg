import * as React from 'react';
import WidgetRectangle from './Rectangle/WidgetRectangle';
import Line from './components/Line';
import {ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor} from 'react-dnd';
import {DragTypes} from './Constants';
import WidgetContextMenu from './context_menu/WidgetContextMenu';
import {computed, IReactionDisposer, reaction, runInAction} from 'mobx';
import CanvasGrids from './components/CanvasGrids';
import {WidgetModel} from '../../models/WidgetModel';
import LinkContextMenu from './context_menu/LinkContextMenu';
import WidgetCircle from './Circle/WidgetCircle';
import BezierLines from './components/BezierLines';
import {RectLink} from './Rectangle/RectLink';
import {CanvasDefs} from './CanvasDefs';
import _debounce from 'lodash/debounce';
import './svg.scss';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from './components/EditModeCanvasComponent';
import {editCanvasInject} from './EditCanvasUtils';
import classNames from 'classnames';
import {shortcut} from '../../keyboard_utils';
import {disableOsDefault} from '../../utils';
import {EditModeCanvasTabStore} from './stores/EditModeCanvasTabStore';
import _get from 'lodash/get';
import {BackgroundContextMenu} from './context_menu/BackgroundContextMenu';
import {TerminusWidget} from './components/TerminusWidget/TerminusWidget';
import {TerminusLinkWidget} from './Rectangle/TerminusLinkWidget';
import {TerminusLinkContextMenu} from './context_menu/TerminusLinkContextMenu';
import {TerminusContextMenu} from './context_menu/TerminusContextMenu';

const body = document.body;

export interface IMainCanvasProps extends IEditModeCanvasComponentProps {
    canDrop?: boolean;
    connectDropTarget?: ConnectDropTarget;
}

class SvgBackground extends EditModeCanvasComponent<IMainCanvasProps> {

    // 拖拽画布时用的临时位置计算偏移
    private currentX: number;
    private currentY: number;
    private isDrag: boolean;
    private disposer: IReactionDisposer;
    private debouncedUpdateHistory: any;

    public constructor(props: IMainCanvasProps) {
        super(props);
        this.setSvgSize = this.setSvgSize.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.doOnWheel = _debounce(this.doOnWheel, 10);
        this.debouncedUpdateHistory = _debounce(this.updateHistory, 100);
    }

    private setSvgSize() {
        this.currentActiveStore!.updateCanvasClientPosition();
    }

    private debouncedSetSvgSize = _debounce(() => {
        this.setSvgSize();
    }, 200);

    public componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedSetSvgSize, true);
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
        document.removeEventListener('mousemove', this.onDragMove, true);
        document.removeEventListener('keydown', this.onKeyDown, true);
        this.mainStore.setCurrentSelectedPipelineId(null);
        this.mainStore.setCurrentToBeClosedPipeline(null);
        if (this.disposer) {
            this.disposer();
        }
    }

    public componentDidMount() {
        this.setSvgSize();
        window.addEventListener('resize', this.debouncedSetSvgSize, true);
        document.addEventListener('keydown', this.onKeyDown, true);
        this.disposer = reaction(() => {
                // 所有tab已经关完
                if (!this.currentActiveStore) {
                    this.disposer();
                    return null;
                } else {
                    const pipeline = this.currentActiveStore!.pipeline!;
                    if (pipeline.readonly) {
                        return null; // readonly的pipeline不使用History
                    }
                    return JSON.stringify(pipeline.simpleJson());
                }
            },
            (simpleJson: string | null) => {
                this.debouncedUpdateHistory();
            }, {fireImmediately: true});
    }

    private updateHistory = () => {
        const simpleJson = this.currentActiveStore && JSON.stringify(this.currentActiveStore!.pipeline!.simpleJson());
        if (!simpleJson) {
            return;
        }
        // 撤退会导致simpleJson发生变化，但是不应该引起history的变化
        if (this.currentActiveStore!.noHistory) {
            this.currentActiveStore!.noHistory = false;
            return;
        }
        this.currentActiveStore!.historyManager.push();
    }

    private onScroll = (e: any) => {
        const canvasWrapper = document.querySelector('.pipeline-background') as HTMLDivElement;
        if (this.currentActiveStore) {
            this.currentActiveStore.pipeline!.setScroll({x: canvasWrapper.scrollLeft, y: canvasWrapper.scrollTop});
        }
    }

    private onWheel(e: React.WheelEvent) {
        if (this.canvasConfig.panningType !== 'drag') {
            return;
        }
        if (this.currentActiveStore) {
            this.currentActiveStore.closeAllMenus();
        }
        e.persist();
        this.doOnWheel(e);
    }

    private doOnWheel(e: React.WheelEvent) {
        const zoomCount = Math.max(Math.floor(Math.abs(e.deltaY) / 40), 1);
        runInAction(() => {
            for (let i = 0; i < zoomCount; i++) {
                if (e.deltaY > 0) {
                    this.currentActiveStore!.zoomOut();
                } else {
                    this.currentActiveStore!.zoomIn();
                }
            }
        });
    }

    private onKeyDown = (e: KeyboardEvent) => {
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        // disableOsDefault(e);
        const editMode = !s.isPipelineReadOnly || !s.pipeline!.locked;
        if (editMode && shortcut(e, 'ctrl+s')) {
            s.parent.save();
        } else if (editMode && shortcut(e, 'ctrl + shift + z')) {
            s.historyManager.forward();
        } else if (editMode && shortcut(e, 'ctrl + z')) {
            s.historyManager.back();
        } else if (editMode && shortcut(e, 'delete', false)) {
            if (document.activeElement === body) {
                s.removeSelectedWidgets();
            }
        } else if (shortcut(e, 'esc')) {
            s.clearAllSelections();
        }
    }

    // 用于绘制选中区域
    private onMouseDown = (e: React.MouseEvent<any>) => {
        const s = this.currentActiveStore;

        if (!s) {
            return;
        }
        if (e.button === 2) {
            return;
        }
        s.clearAllSelections();

        if (shortcut(e.nativeEvent as any, 'ctrl')) {
            s.setTempAreaStart({x: e.clientX, y: e.clientY});
            document.addEventListener('mousemove', this.onMouseMove, true);
            document.addEventListener('mouseup', this.onMouseUp, true);
        } else if (this.canvasConfig.panningType === 'drag') {
            this.currentX = e.clientX;
            this.currentY = e.clientY;
            this.isDrag = true;
            document.addEventListener('mousemove', this.onDragMove, true);
            document.addEventListener('mouseup', this.onMouseUp, true);
        }
    }

    private onContextMenu = (e: React.MouseEvent) => {
        this.currentActiveStore!.clearAllSelections();
        this.currentActiveStore!.setBackgroundContextMenuConfig(e);
    }

    private onDragMove = (e: MouseEvent) => {
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        if (this.isDrag) {
            const oldPosition = s.pipeline!.viewBoxPosition;
            const clientX = e.clientX;
            const clientY = e.clientY;
            const newViewBoxPosition = {
                x: oldPosition.x + (this.currentX - clientX) / s.svgRatio,
                y: oldPosition.y + (this.currentY - clientY) / s.svgRatio,
            };
            s.pipeline!.setViewBoxPosition(newViewBoxPosition);
            this.currentX = clientX;
            this.currentY = clientY;
        }
    }

    // 选中区域拖拽
    private onMouseMove = (e: MouseEvent) => {
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        if (s.tempAreaStart) {
            s.setTempAreaEnd({x: e.clientX, y: e.clientY});
        }
    }

    // 选中区域完成
    private onMouseUp = (e: MouseEvent) => {
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        s.tryToSelectWidgets();
        s.setTempAreaStart(null);
        s.setTempAreaEnd(null);
        this.isDrag = false;
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
        document.removeEventListener('mousemove', this.onDragMove, true);
    }

    private renderTempLine() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (s.isLinking) {
            const start = s.tempLineStart!;
            const end = s.tempLineEnd!;

            const smallTuningX = start.x < end.x ? -10 : 10;
            const smallTuningY = start.y < end.y ? -6 : 6;
            // console.log(end.x + smallTuningX, end.y + smallTuningY);
            return (
                <Line
                    type={1}
                    x1={start.x} y1={start.y} x2={end.x + smallTuningX} y2={end.y + smallTuningY}/>
            );
        } else {
            return null;
        }
    }

    private renderRectLinks() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        const result = [];
        let i = 0;

        for (const link of s.links) {
            result.push(
                <RectLink model={link} key={i++}/>,
            );
        }
        return result;
    }

    private renderPairedLinks(): BezierLines[] | null {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (s.pipeline) {
            const result: BezierLines[] = [];
            let i = 0;
            for (const pl of s.pipeline.pairedLinks) {
                const lines = <BezierLines key={i++} link={pl}/>;
                result.push(lines as any);
            }
            return result;
        }
        return [];
    }

    // 当使用circle时, 不希望线从圆心开始画，所以要把这个图形放在最后，遮住templine
    private drawSelectedOutPortCircle() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (this.drawCircle && s.currentSelectedOutPortWidget) {
            return <WidgetCircle key={'selected-outport'} preview={false}
                                 widget={s.currentSelectedOutPortWidget}/>;
        } else {
            return null;
        }
    }

    private shape(op: WidgetModel, index: number) {
        const s = this.currentActiveStore!;
        const selected = s.currentWidgets.includes(op);

        if (this.drawCircle && op === s.currentSelectedOutPortWidget) {
            return null;
        }

        if (this.drawRect) {
            return <WidgetRectangle key={index} preview={false} widget={op} selected={selected}/>;
        } else if (this.drawCircle) {
            return <WidgetCircle key={index} preview={false} widget={op} selected={selected}/>;
        } else {
            throw this.throwShapeNotSupported();
        }
    }

    private renderOps() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        return s.widgets.map((op, index) => (this.shape(op, index)));
    }

    private renderTerminus() {
        if (!this.currentActiveStore) {
            return null;
        }
        const terminusPosition = this.currentActiveStore!.terminusPositions;
        if (terminusPosition.length === 0) {
            return null;
        }
        const result: React.ReactNode[] = [];
        for (let i = 0; i < terminusPosition.length; i++) {
            const terminus = this.currentActiveStore!.pipeline!.terminusArray[i];
            const p = terminusPosition[i];
            result.push(
                <TerminusWidget
                    mainStore={this.currentActiveStore!}
                    terminus={terminus}
                    position={{x: p.x, y: p.y}} key={terminus.id}/>,
            );
        }

        return result;
    }

    private renderTerminusLinks() {
        if (!this.currentActiveStore) {
            return null;
        }
        const terminusLinks = this.currentActiveStore!.terminusLinks;
        if (terminusLinks.length === 0) {
            return null;
        }
        return terminusLinks.map(link => (
            <TerminusLinkWidget
                key={link.id}
                mainStore={this.currentActiveStore!}
                link={link}
            />
        ));
    }

    @computed
    get viewBoxWidth() {
        return this.currentActiveStore!.svgWidth / this.ratio;
    }

    @computed
    get viewBoxHeight() {
        return this.currentActiveStore!.svgHeight / this.ratio;
    }

    private drawMultiSelectionArea() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (s.tempAreaStart && s.tempAreaEnd) {
            const p1 = s.clientToSvg(s.tempAreaStart);
            const p2 = s.clientToSvg(s.tempAreaEnd);

            const startX = Math.min(p1.x, p2.x);
            const startY = Math.min(p1.y, p2.y);

            return (
                <rect className={'multi-selection-area'}
                      x={startX} y={startY}
                      height={Math.abs(p1.y - p2.y)}
                      width={Math.abs(p1.x - p2.x)}/>
            );
        }
        return null;
    }

    get ratio() {
        return this.currentActiveStore ? this.currentActiveStore.svgRatio : 1;
    }

    get showBackgroundContextMenu() {
        const a = this.currentActiveStore!;
        if (a.pipeline!.readonly || a.pipeline!.locked) {
            return false;
        }
        return !this.showWidgetMenu && !this.showTerminusLinkMenu
            && !this.showLinkMenu
            && !this.showTerminusMenu
            && !!a.backgroundContextConfig;
    }

    get showWidgetMenu() {
        const p = this.mainStore;
        const a = p.currentActiveStore!;
        if (a.pipeline!.readonly || a.pipeline!.locked) {
            return _get(this.canvasConfig, 'contextMenuConfigs.widgetContextMenuItems.length', 0) > 0;
        }
        return a.showWidgetContextMenu;
    }

    get showLinkMenu() {
        const p = this.mainStore;
        const a = p.currentActiveStore!;
        if (a.pipeline!.readonly || a.pipeline!.locked) {
            return _get(this.canvasConfig, 'contextMenuConfigs.linkContextMenuItems.length', 0) > 0;
        }
        return a.showLinkContextMenu;
    }

    get showTerminusLinkMenu() {
        const p = this.mainStore;
        const a = p.currentActiveStore!;
        if (a.pipeline!.readonly || a.pipeline!.locked) {
            return false;
        }
        return a.showTerminusLinkContextMenu;
    }

    get showTerminusMenu() {
        const p = this.mainStore;
        const a = p.currentActiveStore!;
        if (a.pipeline!.readonly || a.pipeline!.locked) {
            return false;
        }
        return a.showTerminusContextMenu;
    }

    public render() {
        const p = this.mainStore;
        const a = p.currentActiveStore!;
        let panningX = 0, panningY = 0;
        if (this.canvasConfig.panningType === 'drag' && a && a.pipeline) {
            const {x, y} = a.pipeline.viewBoxPosition;
            panningX = x;
            panningY = y;
        }
        return this.props.connectDropTarget!(
            <div
                onContextMenu={disableOsDefault}
                onScroll={this.onScroll}
                className={classNames('svg-background pipeline-background', {
                    readonly: a.isPipelineReadOnly,
                    drag: this.canvasConfig.panningType === 'drag',
                })}>
                {this.showWidgetMenu && <WidgetContextMenu/>}
                {this.showBackgroundContextMenu &&
                <BackgroundContextMenu mainStore={this.currentActiveStore!} locale={this.locale}/>}
                {this.showLinkMenu && <LinkContextMenu/>}
                {this.showTerminusLinkMenu &&
                <TerminusLinkContextMenu mainStore={this.currentActiveStore!} locale={this.locale}
                />}
                {this.showTerminusMenu &&
                <TerminusContextMenu mainStore={this.currentActiveStore!} locale={this.locale}
                />}
                <svg
                    onWheel={this.onWheel}
                    onMouseDown={this.onMouseDown}
                    onContextMenu={this.onContextMenu}
                    className={classNames('svg', {drag: this.canvasConfig.panningType === 'drag'})}
                    viewBox={`${panningX} ${panningY} ${this.viewBoxWidth} ${this.viewBoxHeight}`}>
                    <CanvasDefs/>
                    <CanvasGrids
                        panning={a.pipeline!.viewBoxPosition}// scroll模式viewBoxPosition总是0，所以无所谓
                        gridGap={p.gridGap}
                        svgWidth={a.svgWidth} svgHeight={a.svgHeight} ratio={this.ratio}/>
                    {this.drawMultiSelectionArea()}
                    {this.drawRect ? this.renderRectLinks() : null}
                    {this.drawRect ? this.renderTerminusLinks() : null}
                    {this.drawCircle ? this.renderPairedLinks() : null}
                    {this.renderOps()}
                    {this.renderTerminus()}
                    {this.renderTempLine()}
                    {this.drawSelectedOutPortCircle()}
                </svg>
            </div>,
        );
    }
}

const boxTarget = {
    drop(props: IMainCanvasProps, monitor: DropTargetMonitor) {
        const s = props.canvasConfig!.mainStore.currentActiveStore!;
        const dataset = (monitor.getItem() as any).dataset;
        const widget = new WidgetModel(s).fromDataset(dataset);
        const offset = s.mainCanvasClientPosition!;
        const current = monitor.getClientOffset()!;

        const {scrollLeft, scrollTop} = EditModeCanvasTabStore.scrollDiffs();
        const translate = s.pipeline!.viewBoxPosition;
        widget.setX((current.x - offset.x + scrollLeft) * s.humanRatio + translate.x);
        widget.setY((current.y - offset.y + scrollTop) * s.humanRatio + translate.y);

        if (_get(props, 'canvasConfig.events.beforeWidgetAdded')) {
            props.canvasConfig!.events!.beforeWidgetAdded!(widget);
        }
        s.addWidget(widget);
        if (_get(props, 'canvasConfig.events.onWidgetAdded')) {
            props.canvasConfig!.events!.onWidgetAdded!(widget);
        }
    },
};

export default editCanvasInject(DropTarget(
    DragTypes.Widget,
    boxTarget,
    (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
        connectDropTarget: connect.dropTarget(),
        canDrop: monitor.canDrop(),
    }),
)(editCanvasInject(SvgBackground)));
