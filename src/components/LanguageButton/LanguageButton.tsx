import * as React from 'react';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import Dropdown from 'antd/es/dropdown';
import 'antd/es/dropdown/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import {Locales} from '../../utils';
import {cacheUtils} from '../../cacheUtils';
import i18n from 'i18next';

export interface LanguageButtonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function LanguageButton(props: LanguageButtonProps) {
    const translation = {
        [Locales.en]: 'English',
        [Locales.zh]: '中文',
    };
    const operateMenu = (
        <Menu
            className='languages'
            onClick={({key}: { key: string }) => {
                cacheUtils.saveLocale(key as Locales);
                i18n.changeLanguage(key);
            }}
        >
            {Object.keys(Locales).map((language) => (
                <Menu.Item key={language}>{translation[language]}</Menu.Item>
            ))}
        </Menu>
    );
    const currentLocale = cacheUtils.getLocale();
    return (
        <Dropdown
            overlay={operateMenu}
        >
            <Button className={props.className || ''}
                    style={{
                        marginRight: 15,
                        ...(props.style || {}),
                    }}
            >{translation[currentLocale]}</Button>
        </Dropdown>
    );
}
