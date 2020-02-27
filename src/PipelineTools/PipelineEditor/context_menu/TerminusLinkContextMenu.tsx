import * as React from 'react';
import {getTranslation, Locales} from '../../../utils';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import './contextMenu.scss';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {observer} from 'mobx-react-lite';
import {runInAction} from 'mobx';

export interface TerminusLinkContextMenuProps {
    mainStore: EditModeCanvasStore;
    locale: Locales;
}

const MenuItem = Menu.Item;

function TerminusLinkContextMenuFunc(props: TerminusLinkContextMenuProps) {

    const s = props.mainStore;
    if (!s) {
        return null;
    }
    if (!s.currentTerminusLink) {
        return null;
    }

    const terminusLink = s.currentTerminusLink!;
    const removeTerminusLink = React.useCallback(() => {
        runInAction(() => {
            props.mainStore.removeTerminusLink(terminusLink);
            props.mainStore.closeAllMenus();
        });
    }, [terminusLink]);

    const isReadOnly = s.pipeline!.readonly;
    const locked = s.pipeline!.locked;

    if (s.showTerminusLinkContextMenu) {
        const x = s.clickEventPosition!.x + 20;
        const y = s.clickEventPosition!.y + 20;
        return (
            <div
                style={{left: x, top: y}}
                className='terminus-link-context-menu-wrapper'>
                <Menu className='terminus-link-context-menu'>
                    {(!isReadOnly && !locked) &&
                    <MenuItem onClick={removeTerminusLink}
                    >
                        {getTranslation(props.locale, 'Delete Connection')}
                    </MenuItem>}
                </Menu>
            </div>);
    }
    return null;

}

export const TerminusLinkContextMenu = observer(TerminusLinkContextMenuFunc);
