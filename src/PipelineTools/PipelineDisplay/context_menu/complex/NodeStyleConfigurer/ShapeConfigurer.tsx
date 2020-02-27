import * as React from 'react';
import {getTranslation, Locales} from '../../../../../utils';
import {SquareIcon} from '../../../../../icons/SquareIcon';
import {CircleIcon} from '../../../../../icons/CircleIcon';
import {OctagonIcon} from '../../../../../icons/OctagonIcon';
import classNames from 'classnames';
import {NodeShape} from '../../../interfaces';

export interface ShapeConfigurerProps {
    locale: Locales;
    shape: NodeShape;
    onChange: (shape: NodeShape) => any;
    style?: React.CSSProperties;
}

export class ShapeConfigurer extends React.Component<ShapeConfigurerProps> {

    get locale() {
        return this.props.locale;
    }

    public render() {
        return (
            <div className='configurer-area' style={this.props.style || {}}>
                <h4>{getTranslation(this.locale, 'Entity Shape')}</h4>
                <div className='shape-gallery'>
                    <SquareIcon
                        onClick={() => {
                            this.props.onChange('polygon');
                        }}
                        className={classNames('shape', {
                            selected: this.props.shape === 'polygon',
                        })}
                    />
                    <CircleIcon
                        onClick={() => {
                            this.props.onChange('ellipse');
                        }}
                        className={classNames('shape', {
                            selected: this.props.shape === 'ellipse',
                        })}
                    />
                    <OctagonIcon
                        key='hexagon'
                        onClick={() => {
                            this.props.onChange('octagon');
                        }}
                        className={classNames('shape', {
                            selected: this.props.shape === 'octagon',
                        })}
                    />
                </div>
            </div>
        );
    }
}
