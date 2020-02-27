import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import ThemeIcon0 from '../../../../images/kg/theme0.png';
import ThemeIcon1 from '../../../../images/kg/theme1.png';
import './homeSection2.scss';
import classNames from 'classnames';
import * as React from 'react';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';

export function homeSection2(locale: Locales, s: StatusService): SectionChild[] {

    const cyState = s.drawService.cyState;
    return [
        {
            type: SectionChildType.CUSTOM,
            render: () => (
                <div className='theme-icons' key={'theme-icons'}>
                    <ThemeIcon
                        selected={cyState.theme === 0}
                        src={ThemeIcon0} title={getTranslation(locale, 'Theme') + 0}
                        locale={locale}
                        onClick={() => {
                            cyState.setTheme(0);
                        }}/>
                    <ThemeIcon
                        selected={cyState.theme === 1}
                        src={ThemeIcon1} title={getTranslation(locale, 'Theme') + 1}
                        locale={locale}
                        onClick={() => {
                            cyState.setTheme(1);
                        }}/>
                </div>
            ),
        },

    ];
}

interface ThemeIconProps {
    src: string;
    title: string;
    onClick: () => void;
    locale: Locales;
    selected: boolean;
}

class ThemeIcon extends React.Component<ThemeIconProps> {
    render() {
        return (
            <Tooltip title={getTranslation(this.props.locale, 'Switch to', {theme: this.props.title})}>
                <div onClick={this.props.onClick}
                     className='theme-icon-wrapper'>
                    <img src={this.props.src} className={classNames('theme-icon', {selected: this.props.selected})}/>
                    <span className={classNames('theme-icon-title', {selected: this.props.selected})}>{this.props.title}</span>
                </div>
            </Tooltip>
        );
    }
}
