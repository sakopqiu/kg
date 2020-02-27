import * as React from 'react';
import './contextMenu.scss';
import {editCanvasInject} from '../EditCanvasUtils';
import {getTranslation} from '../../../utils';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {action} from 'mobx';

import _get from 'lodash/get';
import {WidgetContextMenuConfig} from '../interfaces';

const MenuItem = Menu.Item;
@editCanvasInject
export default class WidgetContextMenu extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.removeWidget = this.removeWidget.bind(this);
        this.copyWidgets = this.copyWidgets.bind(this);
    }

    @action
    private removeWidget(e: any) {
        this.currentActiveStore!.removeSelectedWidgets();
    }

    @action
    private copyWidgets(e: any) {
        const s = this.currentActiveStore!;
        const newWidgets = s.copyWidgets();
        s.clearAllSelections();
        // copy完选中已经copied的widgets
        s.setCurrentWidgets(newWidgets);
        if (_get(this.canvasConfig, 'events.onWidgetsCopied')) {
            this.canvasConfig.events!.onWidgetsCopied!(newWidgets);
        }
    }

    get x() {
        let width = 0;
        const s = this.currentActiveStore!;
        if (this.drawCircle) {
            width = s.circleRadius * 2;
        } else if (this.drawRect) {
            width = s.rectWidth;
        }

        const w = s.currentWidgets[0]!;
        return w.x + width / 2;
    }

    get y() {
        let height = 0;
        const s = this.currentActiveStore!;
        if (this.drawCircle) {
            height = s.circleRadius * 2;
        } else if (this.drawRect) {
            height = s.rectHeight;
        }
        const w = s.currentWidgets[0]!;
        return w.y + height + 2;
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }

        const isReadOnly = s.pipeline!.readonly;
        const locked = s.pipeline!.locked;
        let extraMenuItems: WidgetContextMenuConfig[] = [];

        if (_get(this.canvasConfig, 'contextMenuConfigs.widgetContextMenuItems')) {
            extraMenuItems = this.canvasConfig.contextMenuConfigs!.widgetContextMenuItems!(s.currentWidget!);
        }

        if (s.showWidgetContextMenu) {
            const p = s.svgToClient({x: this.x, y: this.y});
            return (
                <div style={{left: p.x, top: p.y}} className='widget-context-menu-wrapper'>
                    <Menu className='widget-context-menu'>
                        {(!isReadOnly && !locked) &&
                        <MenuItem
                            onClick={this.removeWidget}>
                            {getTranslation(this.locale, 'Delete')}
                        </MenuItem>
                        }
                        {(!isReadOnly && !locked) &&
                        <MenuItem
                            onClick={this.copyWidgets}>
                            {getTranslation(this.locale, 'Copy')}
                        </MenuItem>
                        }
                        {extraMenuItems.map(config => (
                            <MenuItem
                                key={config.key}
                                onClick={() => {
                                    const result = !!config.onClick(s.currentWidget!);
                                    if (result) {
                                        s.setShowWidgetContextMenu(false);
                                    }
                                }}>
                                {config.render(s.currentWidget!)}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            );
        }
        return null;
    }
}
