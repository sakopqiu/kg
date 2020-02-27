import * as React from 'react';
import {getTranslation, Locales} from '../../../../../utils';
import classNames from 'classnames';
import {NodeBorderColors} from '../../../interfaces';

export interface LineColorConfigurerProps {
    locale: Locales;
    color: string;
    onChange: (color: string) => any;
    style?: React.CSSProperties;
}

export class BorderColorConfigurer extends React.Component<LineColorConfigurerProps> {

    get locale() {
        return this.props.locale;
    }

    public render() {
        return (
            <div className='configurer-area' style={this.props.style || {}}>
                <h4>{getTranslation(this.locale, 'Border Color')}</h4>
                {NodeBorderColors.map((color: string) => {
                    const borderStyle = color === 'white' ? {
                        border: '1px solid #EAEEF5',
                    } : {};
                    return (
                        <span key={color}
                              onClick={() => {
                                  this.props.onChange(color);
                              }}
                              style={{
                                  background: color,
                                  cursor: 'pointer',
                                  ...borderStyle,
                              }}
                              className={classNames('color-tube', {selected: this.props.color === color})}
                        />
                    );
                })}
            </div>
        );
    }
}
