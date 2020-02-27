import * as React from 'react';
import * as ReactDom from 'react-dom';
import {SketchPicker, ColorResult} from 'react-color';
import './index.scss';

export interface IColorSquareProps {
    color: string;
    onSelected?: (color: string) => void;
    xOffset?: number;
    yOffset?: number;
    style?: React.CSSProperties;
    nonClickable?: boolean;
}

export class ColorSquare extends React.Component<IColorSquareProps> {

    private spanRef = React.createRef<HTMLDivElement>();
    private x: number;
    private y: number;
    private currentColor: string;
    private initColor: string;
    state = {
        displayPalette: false,
    };

    constructor(props: IColorSquareProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.close = this.close.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    componentDidMount() {
        this.currentColor = this.props.color;
        this.initColor = this.props.color;
    }

    componentDidUpdate() {
        this.currentColor = this.props.color;
        this.initColor = this.props.color;
    }

    private changeColor(color: ColorResult) {
        // const rgba = color.rgb;
        // this.currentColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
        this.currentColor = color.hex;
    }

    private confirm() {
        this.close();
        if (this.initColor !== this.currentColor) {
            this.props.onSelected!(this.currentColor);
        }
    }

    private toggle() {
        if (this.props.nonClickable) {
            return;
        }
        const invisibleToVisible = !this.state.displayPalette;
        const span = ReactDom.findDOMNode(this.spanRef.current!) as HTMLDivElement;
        if (invisibleToVisible && span) {
            const boundingRect = span.getBoundingClientRect();
            const bodyBoundingRect = document.body.getBoundingClientRect();
            this.x = boundingRect.left;
            this.y = boundingRect.top;
            // 350是这个控件的高度,但是要多留出一点
            if (this.y + 400 > bodyBoundingRect.bottom) {
                this.y = bodyBoundingRect.bottom - 400;
            }
            if (this.x + 240 > bodyBoundingRect.right) {
                this.x = bodyBoundingRect.right - 240;
            }
        }
        this.setState({
            displayPalette: !this.state.displayPalette,
        });
    }

    private close() {
        this.setState({
            displayPalette: false,
        });
    }

    get xOffset() {
        return this.props.xOffset || 5;
    }

    get yOffset() {
        return this.props.yOffset || 20;
    }

    public render() {
        return (
            <div ref={this.spanRef}
                 style={{display: 'inline-block', position: 'relative', ...(this.props.style || {})}}
                 className='color-square-wrapper'
            >
                <span className='color-square'
                      onClick={this.toggle}
                      style={{backgroundColor: this.props.color}}/>
                {
                    this.state.displayPalette ?
                        <div style={{
                            position: 'fixed',
                            zIndex: 2000,
                            left: this.x + this.xOffset,
                            top: this.y + this.yOffset,
                        }}>
                            <span onClick={this.close} className='close-color-picker'>+</span>
                            <SketchPicker
                                disableAlpha
                                onChangeComplete={this.changeColor}
                                color={this.props.color}>
                            </SketchPicker>
                            <span
                                onClick={this.confirm}
                                style={{
                                    position: 'relative',
                                    top: -29,
                                    left: 89,
                                    height: 22,
                                    cursor: 'pointer',
                                    border: '1px solid #d9d9d9',
                                    display: 'inline-block',
                                    padding: '0 10px',
                                }}>ok</span>
                        </div>
                        : null
                }
            </div>
        );
    }
}
