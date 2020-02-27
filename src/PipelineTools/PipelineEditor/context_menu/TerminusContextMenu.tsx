import * as React from 'react';
import {getTranslation, Locales} from '../../../utils';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import './contextMenu.scss';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {observer} from 'mobx-react-lite';
import {runInAction} from 'mobx';

export interface TerminusContextMenuProps {
    mainStore: EditModeCanvasStore;
    locale: Locales;
}

const MenuItem = Menu.Item;

function TerminusContextMenuFunc(props: TerminusContextMenuProps) {

    const s = props.mainStore;
    if (!s) {
        return null;
    }
    if (!s.currentTerminus) {
        return null;
    }

    const terminus = s.currentTerminus!;
    const removeTerminus = React.useCallback(() => {
        runInAction(() => {
            props.mainStore.removeTerminus(terminus);
            props.mainStore.closeAllMenus();
        });
    }, [terminus]);

    const isReadOnly = s.pipeline!.readonly;
    const locked = s.pipeline!.locked;

    if (s.showTerminusContextMenu) {
        const x = s.clickEventPosition!.x + 20;
        const y = s.clickEventPosition!.y - 30;
        return (
            <div
                style={{left: x, top: y}}
                className='terminus-context-menu-wrapper'>
                <Menu className='terminus-context-menu'>
                    {(!isReadOnly && !locked) &&
                    <MenuItem onClick={removeTerminus}
                    >
                        {getTranslation(props.locale, 'Delete Terminus')}
                    </MenuItem>}
                </Menu>
            </div>);
    }
    return null;

}

export const TerminusContextMenu = observer(TerminusContextMenuFunc);
