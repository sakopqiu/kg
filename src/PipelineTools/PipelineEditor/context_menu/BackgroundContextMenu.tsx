import * as React from 'react';
import {getTranslation, Locales} from '../../../utils';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import {EditModeCanvasStore} from '../stores/EditModeCanvasStore';
import {observer} from 'mobx-react-lite';

const MenuItem = Menu.Item;

export interface BackgroundContextMenuProps {
    mainStore: EditModeCanvasStore;
    locale: Locales;
}

function BackgroundContextFunc(props: BackgroundContextMenuProps) {
    const mainStore = props.mainStore;
    const config = mainStore.backgroundContextConfig!;
    const locale = props.locale;
    const isLimited = mainStore.isPipelineReadOnly || mainStore.pipeline!.locked;

    const addTerminus = React.useCallback(() => {
        mainStore.addTerminus();
        mainStore.closeBackgroundContextMenu();
    }, []);

    const clearAll = React.useCallback(() => {
        mainStore.clear();
        mainStore.closeAllMenus();
    }, []);

    const back = React.useCallback(() => {
        mainStore.historyManager.back();
        mainStore.closeAllMenus();
    }, []);

    const forward = React.useCallback(() => {
        mainStore.historyManager.forward();
        mainStore.closeAllMenus();
    }, []);

    const terminusEnabled = mainStore.parent.canvasConfig.terminusEnabled;

    return (
        <div style={{left: config.x, top: config.y}} className='widget-context-menu-wrapper'>
            <Menu className='widget-context-menu'>
                {!isLimited && terminusEnabled &&
                <MenuItem onClick={addTerminus}>
                    {getTranslation(locale, 'Add Terminus')}
                </MenuItem>
                }
                {!isLimited &&
                <MenuItem onClick={clearAll}>
                    {getTranslation(locale, 'ClearAll')}
                </MenuItem>
                }
                {!isLimited && mainStore && mainStore.historyManager.canBack
                && <MenuItem onClick={back}>
                    {getTranslation(locale, 'Back')}
                </MenuItem>
                }
                {!isLimited && mainStore && mainStore.historyManager.canForward &&
                <MenuItem onClick={forward}>
                    {getTranslation(locale, 'Forward')}
                </MenuItem>
                }
            </Menu>
        </div>
    );
}

export const BackgroundContextMenu = observer(BackgroundContextFunc);
