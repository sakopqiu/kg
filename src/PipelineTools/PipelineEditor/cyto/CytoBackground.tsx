import * as React from 'react';
import {ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor} from 'react-dnd';
import {DragTypes} from '../Constants';
import {WidgetModel} from '../../../models/WidgetModel';
import '../svg.scss';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {editCanvasInject} from '../EditCanvasUtils';
import classNames from 'classnames';
import {
    debug,
    disableOsDefault,
    filterCommonId,
    getTranslation,
    LAYOUT_ELEMENT_PADDING,
    showError,
    untilNextLoop,
} from '../../../utils';
import {IReactionDisposer, reaction} from 'mobx';
import {DDP} from './DDP';
import cytoscape from 'cytoscape';
import {CYTO_EDGES, CYTO_NODES, cytoStyle} from './cyto-utils';
import _debounce from 'lodash/debounce';
import {EventManager} from './EventManager';
import CytoWidgetContextMenu from '../context_menu/CytoWidgetContextMenu';
import CytoLinkContextMenu from '../context_menu/CytoLinkContextMenu';
import CytoContextMenu from '../context_menu/CytoContextMenu';
import {NODE_NORMAL_SIZE} from '../../common/cytoscapeCommonStyle';
import _get from 'lodash/get';

export interface ICytoBackgroundProps extends IEditModeCanvasComponentProps {
    canDrop?: boolean;
    connectDropTarget?: ConnectDropTarget;
}

class CytoBackground extends EditModeCanvasComponent<ICytoBackgroundProps> {
    private disposer: IReactionDisposer;
    private ddp: DDP = new DDP(this.mainStore);
    private eventManager: EventManager = new EventManager(this.mainStore);

    public constructor(props: ICytoBackgroundProps) {
        super(props);
    }

    private debouncedSetCytoSize = _debounce(() => {
        this.currentActiveStore!.updateCanvasClientPosition();
    }, 200);

    private destroyOldCy() {
        if (this.mainStore.cy) {
            this.mainStore.cy.destroy();
            debug('Old cy instance is destroyed');
            this.mainStore.cy = null;
        }
    }

    public componentWillUnmount() {
        if (this.disposer) {
            this.disposer();
        }
        this.destroyOldCy();
        debug('Old cy instance is destroyed because of route change');

        document.removeEventListener('resize', this.debouncedSetCytoSize, true);
        document.removeEventListener('keydown', this.eventManager.keyDown, true);
        this.mainStore.setCurrentSelectedPipelineId(null);
        this.mainStore.setCurrentToBeClosedPipeline(null);
    }

    private cytoFinished = () => {
        setTimeout(() => {// 等一个eventloop直到cy被赋值给tabstore
            const s = this.currentActiveStore!;
            if (!s.noHistory) {
                this.currentActiveStore!.historyManager.push();
            }
            if (s.currentWidget) {// 新增加的元素会被addWidget方法设置成当前选中的元素
                // 选中当前节点
                this.mainStore.cy.nodes(filterCommonId(s.currentWidget.id)).select();
            }
            if (s.currentLink) {// 新增加的元素会被addWidget方法设置成当前选中的元素
                // 选中当前边
                this.mainStore.cy.edges(filterCommonId(s.currentLink.id)).select();
            }
            if (this.pipeline.firstTimeRender && this.pipeline.readonly) {
                this.pipeline.firstTimeRender = false;
                this.mainStore.fit();
            }

            s.resetOnetimeStatus();
        });
    }

    get pipeline() {
        return this.currentActiveStore!.pipeline!;
    }

    public async componentDidMount() {
        this.currentActiveStore!.updateCanvasClientPosition();
        document.addEventListener('resize', this.debouncedSetCytoSize, true);
        document.addEventListener('keydown', this.eventManager.keyDown, true);
        this.currentActiveStore!.pipeline!.needRedraw = true;
        await untilNextLoop();
        this.disposer = reaction(() => {
                // 所有tab已经关完
                if (!this.currentActiveStore) {
                    this.disposer();
                    return null;
                } else {
                    return JSON.stringify(this.pipeline.toJson());
                }
            },
            (simpleJson: string | null) => {
                if (!simpleJson) {
                    return;
                }
                this.draw();
            }, {fireImmediately: true});
    }

    private get cytoCommonConfigs() {
        return {
            container: document.getElementById('edit-mode-cyto-background'),
            elements: [],
            style: cytoStyle,
            zoom: this.pipeline.ratio,
            pan: this.pipeline.scrollDimension,
            wheelSensitivity: .5,
            minZoom: .3,
            maxZoom: 2,
        };
    }

    private draw() {
        if (this.pipeline!.readonly && !this.pipeline.needRedraw) {
            return;
        }
        this.pipeline.needRedraw = false;
        let layout = {
            name: 'preset',
            fit: false,
            stop: this.cytoFinished,
        };
        if (this.pipeline.readonly && this.pipeline.firstTimeRender) {
            layout = Object.assign(layout, {
                name: 'breadthfirst',
                fit: true,
                avoidOverlapPadding: LAYOUT_ELEMENT_PADDING,
                padding: LAYOUT_ELEMENT_PADDING,
            });
        }

        this.destroyOldCy();
        try {
            // 允许外部修改
            const enhanceDDPState = _get(this.props.canvasConfig, 'callbacks.enhanceDDPState');
            const enhanceCytoConfig = _get(this.props.canvasConfig, 'callbacks.enhanceCytoConfig');
            const nextState = enhanceDDPState ? enhanceDDPState(this.currentActiveStore!, this.ddp.nextState) : this.ddp.nextState;

            const elements: any[] = [...nextState.edges, ...nextState.vertices];
            let cytoConfigs = this.cytoCommonConfigs;
            if (enhanceCytoConfig) {
                cytoConfigs = enhanceCytoConfig(this.currentActiveStore!, cytoConfigs);
            }

            const newCy = cytoscape(
                Object.assign(cytoConfigs, {
                    elements,
                    layout,
                }));
            this.mainStore.cy = newCy;
            // (window as any).ce = newCy;
            this.registerEvents();
        } catch (e) {
            console.error(e);
            const newCy = cytoscape(
                Object.assign(this.cytoCommonConfigs, {
                    elements: [],
                    layout,
                }));
            this.mainStore.cy = newCy;
            (window as any).ce = newCy;
            this.registerEvents();
            showError(getTranslation(this.locale, 'Failed to render canvas'));
        }
    }

    private registerEvents() {
        const cy = this.mainStore.cy;
        if (!this.currentActiveStore!.isPipelineReadOnly) {
            cy.on('drag', () => {
                this.currentActiveStore!.closeAllMenus();
            });
            cy.on('viewport', () => {
                this.currentActiveStore!.closeAllMenus();
            });
            cy.on('mousemove', this.eventManager.mouseMove);
            cy.on('cxttap', `.${CYTO_NODES}`, this.eventManager.widgetRightClicked);
            cy.on('cxttap', `.${CYTO_EDGES}`, this.eventManager.linkRightClicked);
            cy.on('cxttap', this.eventManager.backgroundRightClicked);
        }
        cy.on('tap', this.eventManager.backgroundClicked);
        // cytoscape3.3开始才支持这个时间，因此sophonweb必须使用cytoscape3.3以上
        cy.on('dragfree', _debounce(this.eventManager.elementPositionChanged, 100));
        cy.on('viewport', _debounce(this.eventManager.viewportChanged, 100));
        cy.on('tap', `.${CYTO_NODES}`, this.eventManager.tapWidget);
        cy.on('tap', `.${CYTO_EDGES}`, this.eventManager.tapLink);
    }

    public render() {
        return this.props.connectDropTarget!(
            <div id='edit-mode-cyto-background-wrapper'
                 className={classNames({hideTab: _get(this, 'canvasConfig.tabConfig.hideTab')})}
            >
                <div
                    onContextMenu={disableOsDefault}
                    id='edit-mode-cyto-background'
                    className='pipeline-background'>
                </div>
                {!this.currentActiveStore!.isPipelineReadOnly &&
                <React.Fragment>
                    <CytoWidgetContextMenu/>
                    <CytoLinkContextMenu/>
                    <CytoContextMenu/>
                </React.Fragment>
                }
            </div>,
        );
    }
}

const boxTarget = {
    drop(props: ICytoBackgroundProps, monitor: DropTargetMonitor) {
        const p = props.canvasConfig!.mainStore;
        const s = p.currentActiveStore!;
        const dataset = (monitor.getItem() as any).dataset;
        const widget = new WidgetModel(s).fromDataset(dataset);
        const offset = s.mainCanvasClientPosition!;
        const current = monitor.getClientOffset()!;
        const cy = p.cy;
        const cyExtent = cy.extent();
        widget.setX((current.x - offset.x) / s.pipeline!.ratio + cyExtent.x1 + NODE_NORMAL_SIZE / 2);
        widget.setY((current.y - offset.y) / s.pipeline!.ratio + cyExtent.y1 + NODE_NORMAL_SIZE / 2);
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
)(editCanvasInject(CytoBackground)));
