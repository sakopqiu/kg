import {EditModeCanvasTabStore} from '../stores/EditModeCanvasTabStore';
import {removeSelected, TEMP_EDGE_ID, TEMP_NODE_ID} from './cyto-utils';
import {filterCommonId} from '../../../utils';
import {action, runInAction} from 'mobx';
import {shortcut} from '../../../keyboard_utils';

export class EventManager {

    constructor(public tabStore: EditModeCanvasTabStore) {

    }

    get currentActiveStore() {
        return this.tabStore.currentActiveStore!;
    }

    public exitLinkingStatus = () => {
        this.currentActiveStore.cytoTempLineStart = null;
        this.clearPreviousTempElements();
    }

    public resetStatus = () => {
        this.currentActiveStore!.clearAllSelections();
        this.tabStore.cy.batch(() => {
            this.exitLinkingStatus();
            this.tabStore.cy.elements().unselect();
        });
    }

    public backgroundClicked = (e: any) => {
        // 普通节点的tap处理完后会传播到这里，无法停止传播行为
        if (e.target !== this.tabStore.cy) {
            return;
        }
        this.resetStatus();
    }

    public backgroundRightClicked = (e: any) => {
        const s = this.currentActiveStore!;
        if (s.cytoTempLineStart) {
            this.exitLinkingStatus();
        } else {
            if (e.target === this.tabStore.cy) {
                runInAction(() => {
                    s.closeAllMenus();
                    s.setShowBackgroundContextMenu(true);
                    s.setClickEventPosition({
                        x: e.originalEvent.x,
                        y: e.originalEvent.y,
                    });
                });
            }
        }
    }

    @action
    public elementPositionChanged = () => {
        const cy = this.tabStore.cy;
        for (const widget of this.currentActiveStore!.widgets) {
            const id = filterCommonId(widget.id);
            const elementInCy = cy.filter(id);
            if (elementInCy.length > 0) {
                const p = elementInCy.position();
                widget.setXY(p.x, p.y);
            }
        }
    }

    @action
    public viewportChanged = () => {
        const cy = this.tabStore.cy;
        const pipeline = this.currentActiveStore!.pipeline!;
        pipeline.setScroll(cy.pan());
        pipeline.setRatio(cy.zoom());
    }

    public mouseMove = (e: any) => {
        const startElement = this.currentActiveStore.cytoTempLineStart;
        if (startElement) {
            this.clearPreviousTempElements();
            const node = {
                data: {
                    id: TEMP_NODE_ID,
                },
                classes: 'temp-node',
                group: 'nodes',
                position: e.position,
            };
            const edge = {
                data: {
                    id: TEMP_EDGE_ID,
                    source: startElement.id,
                    target: TEMP_NODE_ID,
                },
                group: 'edges',
            };
            const cy = this.tabStore.cy;
            cy.batch(() => {
                cy.add(node);
                cy.add(edge);
            });
        }
    }

    private clearPreviousTempElements() {
        const cy = this.tabStore.cy;
        const victims = [filterCommonId(TEMP_NODE_ID), filterCommonId(TEMP_EDGE_ID)];
        cy.filter(victims.join(',')).remove();
    }

    public widgetRightClicked = (e: any) => {
        e.target.select();
        runInAction(() => {
            this.selectSingleWidget(e);
            this.currentActiveStore!.closeAllMenus();
            this.currentActiveStore!.setShowWidgetContextMenu(true);
        });
    }

    public linkRightClicked = (e: any) => {
        const s = this.currentActiveStore!;
        e.target.select();
        runInAction(() => {
            this.selectSingleLink(e);
            s.setClickEventPosition({
                x: e.originalEvent.clientX,
                y: e.originalEvent.clientY,
            });
            this.currentActiveStore!.closeAllMenus();
            s.setShowLinkContextMenu(true);
        });
    }

    public tapWidget = (e: any) => {
        if (e.originalEvent.button === 0) {
            const s = this.currentActiveStore!;
            // 连线结束，加入一条新边
            if (s.cytoTempLineStart && s.cytoTempLineStart.id !== e.target.id()) {
                const input = s.getWidgetById(e.target.id())!;
                runInAction(() => {
                    s.addLink(input, s.cytoTempLineStart!);
                    this.exitLinkingStatus();
                });
            } else {
                this.selectSingleWidget(e);
            }
        }
    }

    public tapLink = (e: any) => {
        if (e.originalEvent.button === 0) {
            this.selectSingleLink(e);
        }
    }

    private selectSingleLink = (e: any) => {
        const s = this.currentActiveStore!;
        const link = s.getLinkById(e.target.id())!;
        runInAction(() => {
            link.setCheckFormFailed(false);
            s.setCurrentLink(link);
        });
    }

    private selectSingleWidget = (e: any) => {
        const s = this.currentActiveStore!;
        const widget = s.getWidgetById(e.target.id())!;
        runInAction(() => {
            widget.setCheckFormFailed(false);
            s.setCurrentWidgets([widget]);
        });
    }

    public keyDown = (e: any): void => {
        const s = this.currentActiveStore!;

        if (document.activeElement instanceof HTMLBodyElement) {
            if (shortcut(e, 'esc')) {
                this.resetStatus();
            } else if (shortcut(e, 'delete')) {
                removeSelected(this.tabStore);
            } else if (shortcut(e, 'ctrl+shift+z')) {
                s.historyManager.forward();
            } else if (shortcut(e, 'ctrl+z')) {
                s.historyManager.back();
            } else if (shortcut(e, 'ctrl+s')) {
                s.parent.save();
            }
        }
    }

}
