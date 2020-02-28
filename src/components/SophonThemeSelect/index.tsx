import * as React from 'react';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import {cacheUtils} from '../../cacheUtils';
import _set from 'lodash/set';
import _get from 'lodash/get';
import {changeTheme, getTranslation} from '../../utils';
import {globalStore} from '../../business-related/stores/GlobalStore';
import {SophonTheme} from './interface';
import {baseInjectHook, BaseInjectHookProps} from '../../business-related/utils';
import './index.scss';

const { SubMenu } = Menu;

export interface SophonThemeSelectProps extends BaseInjectHookProps {
    onChange?: (theme: SophonTheme) => void;
}

const SophonThemeSelect = baseInjectHook((props: SophonThemeSelectProps) => {
    const [themeText, setThemeText] = React.useState();
    const locale = cacheUtils.getLocale();

    React.useEffect(() => {
        const text = {};
        Object.keys(SophonTheme).forEach((theme: SophonTheme) => {
            _set(text, theme, getTranslation(locale, `${theme} THEME`));
        });
        setThemeText(text);
        changeTheme(globalStore.theme, props.onChange);
    }, []);

    function onThemeChange(t: SophonTheme) {
        changeTheme(t, props.onChange);
    }

    const title = (
        <span>
            {_get(themeText, globalStore.theme && globalStore.theme.toUpperCase())}
            <Icon type='down' style={{paddingLeft: '8px'}} />
        </span>
    );

    return (
        <Menu
            mode='horizontal'
            className='sophon-theme-menu'
        >
            <SubMenu title={title} popupClassName='sophon-theme-sub-menu'>
                {
                    Object.keys(SophonTheme).map((theme: SophonTheme) => {
                        return (
                            <Menu.Item key={SophonTheme[theme]}
                                       className={'sophon-theme-menu-item'}
                                       onClick={() => onThemeChange(SophonTheme[theme])}>
                                {_get(themeText, theme)}</Menu.Item>
                        );
                    })
                }
            </SubMenu>
        </Menu>
    );
});

export default SophonThemeSelect;
