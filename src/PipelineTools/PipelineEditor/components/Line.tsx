import * as React from 'react';
import {editCanvasInject} from '../EditCanvasUtils';
import classNames from 'classnames';
import uuidv1 from 'uuid/v1';
import {IdInfo} from './BezierLines';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from './EditModeCanvasComponent';
import {disableOsDefault, IPoint} from '../../../utils';

export interface ILabelConfig {
    label?: string;
}

export interface ILineProps extends IEditModeCanvasComponentProps {
    type: 1 | 2;
    labelConfig?: ILabelConfig;
    dInfo?: IdInfo;
    x1?: number;
    x2?: number;
    y1?: number;
    y2?: number;
    error?: boolean;
    selected?: boolean;
    markerId?: string; // Line默认会提供markerId，但是如果外部可以传入覆盖值
    highligtedMarkerId?: string; // Line默认会提供markerId，但是如果外部可以传入覆盖值
    controlPoint?: IPoint;
    style?: React.CSSProperties;
    onMouseDown?: (e: React.MouseEvent<any>) => void;
}

interface IRectLinkState {
    isOver: boolean;
}

// const xmlns = 'http://www.w3.org/2000/svg';
// const pathEle = document.createElementNS(xmlns, 'path');

@editCanvasInject
export default class Line extends EditModeCanvasComponent<ILineProps, IRectLinkState> {

    public id: string;

    constructor(props: ILineProps) {
        super(props);
        this.state = {
            isOver: false,
        };
        this.id = uuidv1();
    }

    private onContextMenu = (e: any) => {
        disableOsDefault(e);
    }

    private onMouseEnter = () => {
        this.setState({
            isOver: true,
        });
    }

    private onMouseLeave = () => {
        this.setState({
            isOver: false,
        });
    }

    private getMarkerId() {
        if (this.props.markerId) {
            return this.state.isOver || this.props.selected ? `url(#${this.props.highligtedMarkerId})` : `url(#${this.props.markerId})`;
        }
        if (this.props.type === 1) {
            return 'url(#arrow)';
        } else {
            return this.state.isOver || this.props.selected ? 'url(#arrow-linked-thick)' : 'url(#arrow-linked)';
        }
    }

    private drawLabel() {
        if (this.props.labelConfig && this.props.dInfo) {
            // pathEle.setAttribute('d', this.props.dInfo.d);
            // const arcLength = pathEle.getTotalLength();
            // const middlePoint = pathEle.getPointAtLength(arcLength / 2);
            const {label} = this.props.labelConfig;
            const href = this.props.dInfo.left2right ? '#' + this.id : '#' + this.id + '_reverse';
            return (
                <text className='pipeline-text relationship'>
                    <textPath xlinkHref={href} startOffset='50%'>
                        {label}
                    </textPath>
                </text>
            );
        }
        return null;
    }

    public render() {
        let path = null;

        if (this.props.dInfo) {
            path = this.props.dInfo.d;
        } else {
            const {x1, x2, y1, y2} = this.props;
            if (this.props.controlPoint) {
                const {x, y} = this.props.controlPoint;
                path = `M${x1} ${y1} Q${x} ${y} ${x2} ${y2}`;
            } else {
                path = `M${x1},${y1} L${x2},${y2}`;
            }
        }
        let reversePath = null;
        if (this.props.dInfo && !this.props.dInfo.left2right) {
            reversePath = <path
                style={{visibility: 'hidden'}}
                d={`${this.props.dInfo.dreverse}`}
                id={this.id + '_reverse'}
            />;
        }

        const markerId = this.getMarkerId();
        return (
            <g
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onMouseDown={(e: React.MouseEvent<any>) => {
                    if (this.props.onMouseDown) {
                        this.props.onMouseDown(e);
                    }
                }}
                onContextMenu={this.onContextMenu}
            >
                <path
                    onMouseDown={this.props.onMouseDown}
                    className={classNames('arc-line', {
                        'error': this.props.error,
                        'thick-line': this.state.isOver || this.props.selected,
                    })}
                    d={`${path}`}
                    id={this.id}
                    markerEnd={markerId}
                    style={this.props.style}
                />
                <path
                    onMouseDown={this.props.onMouseDown}
                    className={classNames('thick-invisible-line arc-line')}
                    d={`${path}`}
                    markerEnd={markerId}
                    style={this.props.style}
                />
                {reversePath}
                {this.drawLabel()}
            </g>
        );
    }
}
