import * as React from 'react';
import './contextMenu.scss';
import {editCanvasInject} from '../EditCanvasUtils';
import {getTranslation} from '../../../utils';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';

const MenuItem = Menu.Item;
@editCanvasInject
export default class CytoLinkContextMenu extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        if (s.showLinkContextMenu) {
            const x = s.clickEventPosition!.x + 20;
            const y = s.clickEventPosition!.y + 20;
            return (
                <div
                    style={{left: x, top: y}}
                    className='link-context-menu-wrapper'>
                    <Menu className='link-context-menu'>
                        <MenuItem onClick={this.removeSelected}
                        >
                            {getTranslation(this.locale, 'Delete')}
                        </MenuItem>
                    </Menu>
                </div>);
        }
        return null;
    }
}
