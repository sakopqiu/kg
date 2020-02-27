import * as React from 'react';
import './index.scss';
import {getTranslation, Locales} from '../../utils';
import {SophonIconProps} from '../../icons/SophonIcon';

export interface ISophonToolBoxProps {
    style?: React.CSSProperties;
    className?: string;
    locale: Locales;
    onBackClicked?: () => {};
    icons: SophonToolBoxIconConfig[];
}

export interface SophonToolBoxIconConfig {
    icon: React.ComponentClass<SophonIconProps>;
    key: string | number;
    hint?: string;
    onClick: () => any;
    disabled: boolean;
}

export class SophonToolBox extends React.Component<ISophonToolBoxProps> {
    public render() {
        return (
            <div className={`sophon-tool-box ${this.props.className || ''}`}
                 style={this.props.style || {}}
            >
                {
                    this.props.onBackClicked &&
                    <div className='back-tick' onClick={this.props.onBackClicked}>
                        <span className='less-than'>&lt;</span>
                        {getTranslation(this.props.locale, 'Return')}
                    </div>
                }
                <div className='icons'>
                    {this.props.icons.map(iconConfig => {
                        const IconElement = iconConfig.icon;
                        return <IconElement
                            disabled={iconConfig.disabled}
                            key={iconConfig.key}
                            title={iconConfig.hint || ''}
                            onClick={iconConfig.onClick}
                        />;
                    })}
                </div>
            </div>
        );
    }
}
