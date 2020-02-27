import * as React from 'react';
import './contextMenu.scss';
import {editCanvasInject} from '../EditCanvasUtils';
import {getTranslation} from '../../../utils';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';

import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';

const MenuItem = Menu.Item;
@editCanvasInject
export default class CytoContextMenu extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
    }

    private clear = () => {
        this.currentActiveStore!.closeAllMenus();
        this.currentActiveStore!.clear();
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (s.showBackgroundContextMenu) {
            const x = s.clickEventPosition!.x + 20;
            const y = s.clickEventPosition!.y + 20;

            const someElementsSelected = this.mainStore.cy.elements(':selected').length > 0;

            return (
                <div
                    style={{left: x, top: y}}
                    className='background-context-menu-wrapper'>
                    <Menu className='background-context-menu'>
                        {someElementsSelected &&
                        <MenuItem onClick={this.removeSelected} key='delete'>
                            {getTranslation(this.locale, 'Delete')}
                        </MenuItem>}
                        <MenuItem key='clear' onClick={this.clear}>
                            {getTranslation(this.locale, 'Clear')}
                        </MenuItem>
                    </Menu>
                </div>);
        }
        return null;
    }
}
