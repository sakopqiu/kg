import * as React from 'react';
import './contextMenu.scss';
import {editCanvasInject} from '../EditCanvasUtils';
import {filterCommonId, getTranslation} from '../../../utils';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {NODE_NORMAL_SIZE} from '../../common/cytoscapeCommonStyle';

const MenuItem = Menu.Item;
@editCanvasInject
export default class CytoWidgetContextMenu extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
    }

    private startConnection = () => {
        const s = this.currentActiveStore!;
        s.closeAllMenus();
        s.cytoTempLineStart = s.currentWidget!;
    }

    private addSelfLoop = () => {
        const s = this.currentActiveStore!;
        s.closeAllMenus();
        s.addLink(s.currentWidget!, s.currentWidget!);
    }

    get x() {
        const s = this.currentActiveStore!;
        const w = this.mainStore.cy.filter(filterCommonId(s.currentWidget!.id));
        const renderedPosition = w.renderedPosition();
        return s.mainCanvasClientPosition!.x + renderedPosition.x + (NODE_NORMAL_SIZE / 2 + 10) * s.pipeline!.ratio;
    }

    get y() {
        const s = this.currentActiveStore!;
        const w = this.mainStore.cy.filter(filterCommonId(s.currentWidget!.id));
        const renderedPosition = w.renderedPosition();
        const y = s.mainCanvasClientPosition!.y + renderedPosition.y - NODE_NORMAL_SIZE * s.pipeline!.ratio / 2;
        console.log(renderedPosition.y, y);
        return y;
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (s.showWidgetContextMenu) {
            return (
                <div style={{left: this.x, top: this.y}} className='widget-context-menu-wrapper'>
                    <Menu className='widget-context-menu'>
                        <MenuItem
                            onClick={this.removeSelected}>
                            {getTranslation(this.locale, 'Delete')}
                        </MenuItem>
                        <MenuItem
                            onClick={this.startConnection}>
                            {getTranslation(this.locale, 'Connect')}
                        </MenuItem>
                        <MenuItem
                            onClick={this.addSelfLoop}>
                            {getTranslation(this.locale, 'Self Loop')}
                        </MenuItem>
                    </Menu>
                </div>
            );
        }
        return null;
    }
}
