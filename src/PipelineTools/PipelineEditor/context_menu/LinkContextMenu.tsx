import * as React from 'react';
import './contextMenu.scss';
import {editCanvasInject} from '../EditCanvasUtils';
import {getTranslation} from '../../../utils';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {action} from 'mobx';
import {LinkContextMenuConfig} from '../interfaces';
import _get from 'lodash/get';

const MenuItem = Menu.Item;
@editCanvasInject
export default class LinkContextMenu extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.removeLink = this.removeLink.bind(this);
    }

    @action
    private removeLink(e: any) {
        const s = this.currentActiveStore;
        if (s) {
            s.removeLink(s.currentLink!);
            s.setCurrentLink(null);
            s.clearAllSelections();
        }
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }

        const isReadOnly = s.pipeline!.readonly;
        const locked = s.pipeline!.locked;

        if (s.showLinkContextMenu) {
            const x = s.clickEventPosition!.x + 20;
            const y = s.clickEventPosition!.y + 20;
            let extraMenuItems: LinkContextMenuConfig[] = [];

            if (_get(this.canvasConfig, 'contextMenuConfigs.linkContextMenuItems')) {
                extraMenuItems = this.canvasConfig.contextMenuConfigs!.linkContextMenuItems!(s.currentLink!);
            }
            return (
                <div
                    style={{left: x, top: y}}
                    className='link-context-menu-wrapper'>
                    <Menu className='link-context-menu'>
                        {(!isReadOnly && !locked) &&
                        <MenuItem onClick={this.removeLink}
                        >
                            {getTranslation(this.locale, 'Delete Connection')}
                        </MenuItem>}
                        {extraMenuItems.map(config => (
                            <MenuItem
                                key={config.key}
                                onClick={() => {
                                    const result = config.onClick(s.currentLink!);
                                    if (result) {
                                        s.setShowLinkContextMenu(false);
                                    }
                                }}>
                                {config.render(s.currentLink!)}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>);
        }
        return null;
    }
}
