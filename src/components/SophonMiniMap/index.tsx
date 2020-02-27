import React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from 'mobx';
import './index.scss';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style';

import {PlusCircleIcon} from '../../icons/PlusCircleIcon';
import {MinusCircleIcon} from '../../icons/MinusCircleIcon';
import {SwitchIcon} from '../../icons/SwitchIcon';
import {IPoint} from '../../utils';

interface ISophonMiniMapProps {
    miniMapClassName?: string;
    miniMapWidth?: number;
    miniMapHeight?: number;
    zoomStep?: number;
    minZoom?: number;
    maxZoom?: number;
    rectMeta?: IRectMeta; // controlled component if defined
    onChange?: (rect: IRectMeta, old: IRectMeta, mapWidth: number, mapHeight: number) => void; // includes onMouseMove, onMouseUp and zoom change
    afterChange?: (rect: IRectMeta, old: IRectMeta, mapWidth: number, mapHeight: number) => void; // includes onMouseUp and zoom change
    onClose?: () => void;
}

export interface IRectMeta {
    x: number;
    y: number;
    w: number;
    h: number;
}

@observer
export class SophonMiniMap extends React.Component<ISophonMiniMapProps> {
    // only usable if controlled component is defined
    @observable innerRectMeta: IRectMeta = {x: 0, y: 0, w: 0, h: 0};
    private svgRef: any;
    private startPoint: IPoint;

    get width() {
        return this.props.miniMapWidth || 499;
    }

    get height() {
        return this.props.miniMapHeight || 250;
    }

    get zoomStep() {
        return this.props.zoomStep || (this.maxZoom - this.minZoom) / 100;
    }

    get minZoom() {
        return this.props.minZoom || 0.2;
    }

    get maxZoom() {
        return this.props.maxZoom || 1;
    }

    get rectMeta() {
        return this.props.rectMeta || this.innerRectMeta;
    }

    get zoomValue() {
        return this.rectMeta.w / this.width;
    }

    get shadowArea() {
        const leftTopPoint = `${this.rectMeta.x},${this.rectMeta.y}`;
        const rightTopPoint = `${this.rectMeta.x + this.rectMeta.w},${this.rectMeta.y}`;
        const rightBottomPoint = `${this.rectMeta.x + this.rectMeta.w},${this.rectMeta.y + this.rectMeta.h}`;
        const leftBottomPoint = `${this.rectMeta.x},${this.rectMeta.y + this.rectMeta.h}`;
        return `M0,0 L${this.width},0 L${this.width},${this.height} L0,${this.height} Z M${leftTopPoint} L${rightTopPoint} L${rightBottomPoint} L${leftBottomPoint} Z`;
    }

    public render() {
        return (
            <div className='sophon-minimap-wrapper' style={{width: this.width}}>
                <div className='sophon-minimap-area' style={{height: this.height}}>
                    <div className={`sophon-minimap ${this.props.miniMapClassName}`}>
                        {this.props.children}
                    </div>
                    <svg className='sophon-minimap-window' ref={this.handleSvgRef} onMouseDown={this.handleSvgMouseDown}>
                        <path
                            d={this.shadowArea}
                            fillOpacity={0.2}
                            fillRule='evenodd'
                        />
                        <rect
                            className='minimap-active-area'
                            onMouseDown={this.handleOnMouseDown}
                            x={this.rectMeta.x}
                            y={this.rectMeta.y}
                            width={this.rectMeta.w}
                            height={this.rectMeta.h}
                            fill={'transparent'}
                        />
                    </svg>
                </div>
                <div className='zoom-tool'>
                    <MinusCircleIcon onClick={this.handleMinus} />
                    <Slider
                        step={this.zoomStep}
                        value={this.zoomValue}
                        min={this.minZoom}
                        max={this.maxZoom}
                        onChange={this.handleZoomChange}
                        tipFormatter={null}
                    />
                    <PlusCircleIcon onClick={this.handlePlus} />
                    <SwitchIcon onClick={this.props.onClose} />
                </div>
            </div>
        );
    }

    @action
    private handleSvgMouseDown = (event: React.MouseEvent) => {
        const center = this.getPointCoordinatesInSvg(event.clientX, event.clientY);
        const newRect = {
            x: center.x - this.rectMeta.w / 2,
            y: center.y - this.rectMeta.h / 2,
            w: this.rectMeta.w,
            h: this.rectMeta.h,
        };
        this.handleChange(newRect, {...this.rectMeta});
        this.innerRectMeta = newRect;
    }

    private handleOnMouseDown = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        this.startPoint = this.getPointCoordinatesInSvg(event.clientX, event.clientY);
        document.addEventListener('mousemove', this.handleMouseMove, true);
        document.addEventListener('mouseup', this.handleMouseUp, true);
    }

    private handleSvgRef = (ref: any) => {
        this.svgRef = ref;
    }

    @action
    private handleMouseMove = (event: any) => {
        const temporaryPoint = this.getPointCoordinatesInSvg(event.clientX, event.clientY);
        const newRect = this.calculateMovingRect(temporaryPoint, this.startPoint);
        this.startPoint = temporaryPoint;
        if (this.props.onChange) {
            this.props.onChange(newRect, {...this.rectMeta}, this.width, this.height);
        }
        this.innerRectMeta = newRect;
    }

    @action
    private handleMouseUp = (event: any) => {
        const endPoint = this.getPointCoordinatesInSvg(event.clientX, event.clientY);
        const newRect = this.calculateMovingRect(endPoint, this.startPoint);
        document.removeEventListener('mousemove', this.handleMouseMove, true);
        document.removeEventListener('mouseup', this.handleMouseUp, true);
        this.handleChange(newRect, {...this.rectMeta});
        this.innerRectMeta = newRect;
    }

    @action
    private calculateMovingRect(endPoint: SVGPoint, startPoint: IPoint) {
        return {
            x: this.rectMeta.x + endPoint.x - startPoint.x,
            y: this.rectMeta.y + endPoint.y - startPoint.y,
            w: this.rectMeta.w,
            h: this.rectMeta.h,
        };
    }

    private getPointCoordinatesInSvg(x: number, y: number) {
        const point = this.svgRef.createSVGPoint();
        point.x = x;
        point.y = y;
        // Translate into svg coordinates
        return point.matrixTransform(this.svgRef.getScreenCTM().inverse());
    }

    @action
    private handleZoomChange = (value: number) => {
        this.handleRectChange(value);
    }

    @action
    private handleMinus = () => {
        let candidate = this.zoomValue - this.zoomStep;
        candidate = candidate >= this.minZoom ? candidate : this.minZoom;
        this.handleRectChange(candidate);
    }

    private handlePlus = () => {
        let candidate = this.zoomValue + this.zoomStep;
        candidate = candidate <= this.maxZoom ? candidate : this.maxZoom;
        this.handleRectChange(candidate);
    }

    @action
    private handleRectChange(zoom: number) {
        const rectCenter = {x: this.rectMeta.x + this.rectMeta.w / 2, y: this.rectMeta.y + this.rectMeta.h / 2};
        const newWidth = zoom * this.width;
        const newHeight = zoom * this.height;
        const newRect = {
            w: newWidth,
            h: newHeight,
            x: rectCenter.x - newWidth / 2,
            y: rectCenter.y - newHeight / 2,
        };
        this.handleChange(newRect, {...this.rectMeta});
        this.innerRectMeta = newRect;
    }

    private handleChange(rect: IRectMeta, old: IRectMeta) {
        if (this.props.onChange) {
            this.props.onChange(rect, old, this.width, this.height);
        }
        if (this.props.afterChange) {
            this.props.afterChange(rect, old, this.width, this.height);
        }
    }
}
