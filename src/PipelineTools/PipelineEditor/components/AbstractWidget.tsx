import * as React from 'react';
import {WidgetModel} from '../../../models/WidgetModel';
import {action, runInAction, observable} from 'mobx';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from './EditModeCanvasComponent';
import './index.scss';
import _get from 'lodash/get';

export interface IAbstractWidgetProps extends IEditModeCanvasComponentProps {
    widget: WidgetModel;
}

export abstract class AbstractWidget<T extends IAbstractWidgetProps, S = any> extends EditModeCanvasComponent<T, S> {

    private currentX: number;
    private currentY: number;
    @observable public isHovered: boolean = false;

    constructor(props: T) {
        super(props);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onDblClick = this.onDblClick.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    protected onContextMenu(e: React.MouseEvent<any>) {
        e.stopPropagation();
        e.preventDefault();
    }

    protected onMouseDown(e: React.MouseEvent<any>) {
        const s = this.currentActiveStore;
        e.stopPropagation();
        e.preventDefault();

        if (!s) {
            return;
        }
        s.closeAllMenus();
        if (e.button === 0) {
            s.setShowWidgetContextMenu(false);

            if (e.ctrlKey || e.metaKey) { // ctrl or command os MacOs
                s.addOrRemoveWidget(this.props.widget);
            } else {
                if (s.currentWidgets.length <= 1) {
                    s.setCurrentWidgets([this.props.widget]);
                } else {
                    // 如果当前是多选选中的状态，用户再次点击某一个widget时，如果该widget在选中列表中，那么忽略点击事件
                    // （因为需要响应批量widget的移动）。如果不在选中列表中，那么取消选中的其他widgets，将当前这个设置成选中
                    if (!s.currentWidgets.includes(this.props.widget)) {
                        s.setCurrentWidgets([this.props.widget]);
                    }
                }
                s.setMoveStatus(true);
                this.currentX = e.clientX;
                this.currentY = e.clientY;
                document.addEventListener('mousemove', this.onMouseMove as any, true);
                document.addEventListener('mouseup', this.onMouseUp as any, true);
            }
        } else if (e.button === 2) {
            s.setShowWidgetContextMenu(true);
            if (s.currentWidgets.length > 1) {
                // 把当前选中的这个塞到队列最前面，因为上下文菜单显示的是第0个currentWidgets
                const result = [...s.currentWidgets];
                const index = s.currentWidgets.indexOf(this.props.widget);
                result.splice(index, 1);
                result.unshift(this.props.widget);
                s.setCurrentWidgets(result);
            } else {
                s.setCurrentWidgets([this.props.widget]);
            }
        }
    }

    @action
    protected onMouseMove(e: React.MouseEvent<any>) {
        e.stopPropagation();
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        if (!s.moveStatus) {
            document.removeEventListener('mousemove', this.onMouseMove as any, true);
            document.removeEventListener('mouseup', this.onMouseUp as any, true);
            return;
        }
        const ex = e.clientX;
        const ey = e.clientY;
        runInAction(() => {
            for (const widget of s.currentWidgets) {
                const dx = widget.x + (ex - this.currentX) * s.humanRatio;
                const dy = widget.y + (ey - this.currentY) * s.humanRatio;
                if (this.mainStore.canvasConfig.panningType === 'scroll') {// 如果是滚动方式，不允许滚出最左边
                    widget.setXY(Math.max(dx, 0), Math.max(dy, 0));
                } else {// 如果是drag模式，则没有这个限制
                    widget.setXY(dx, dy);
                }
            }
        });
        this.currentX = ex;
        this.currentY = ey;
    }

    protected onMouseUp(e: React.MouseEvent<any>) {
        e.stopPropagation();
        document.removeEventListener('mousemove', this.onMouseMove as any, true);
        document.removeEventListener('mouseup', this.onMouseUp as any, true);

        const s = this.currentActiveStore;
        if (s) {
            s.setMoveStatus(false);
            // TODO 性能可以优化,只snap被移动的
            s.try2SnapAllEle();
        }
    }

    protected onDblClick(e: React.MouseEvent<any>) {
        e.stopPropagation();
        if (_get(this, 'props.canvasConfig.events.onWidgetDblClick')) {
            this.props.canvasConfig!.events!.onWidgetDblClick!(this.currentActiveStore!.currentWidget!, e);

        }
    }

    protected onClick(e: React.MouseEvent<any>) {
        e.stopPropagation();
        if (_get(this, 'props.canvasConfig.events.onWidgetClick')) {
            this.props.canvasConfig!.events!.onWidgetClick!(this.currentActiveStore!.currentWidget!, e);

        }
    }

    @action
    protected onMouseEnter = (e: React.MouseEvent<any>) => {
        this.isHovered = true;
    }

    @action
    protected onMouseLeave = (e: React.MouseEvent<any>) => {
        this.isHovered = false;
    }
}
