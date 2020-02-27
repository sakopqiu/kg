import * as React from 'react';
import {action, computed, observable} from 'mobx';
import {WidgetModel} from '../../../models/WidgetModel';
import {editCanvasInject, svgOutputRelativeX, svgOutputRelativeY, svgOutputX, svgOutputY} from '../EditCanvasUtils';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';

interface IOutPortProps extends IEditModeCanvasComponentProps {
    model: WidgetModel;
    parentWidth: number;
    parentHeight: number;
    parentCornerRadius: number;
    portRadius: number;
}

@editCanvasInject
export default class OutPort extends EditModeCanvasComponent<IOutPortProps> {

    private mouseDownX: number;
    private mouseDownY: number;
    @observable private showBig: boolean = false;

    constructor(props: IOutPortProps) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    @action
    private setShowBig(val: boolean) {
        this.showBig = val;
    }

    @computed
    get model() {
        return this.props.model;
    }

    @computed
    get absX() {
        return svgOutputX(this.props.parentWidth, this.props.model);
    }

    @computed
    get absY() {
        return svgOutputY(this.props.parentHeight, this.props.model);
    }

    private onMouseDown(e: React.MouseEvent<any>) {
        e.stopPropagation();
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }

        this.setShowBig(false);
        if (s.currentSelectedOutPortWidget) { // 如果已经有当前被拖动的output
            return;
        }
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
        s.setTempLineStart({
            x: this.absX,
            y: this.absY,
        });
        s.setCurrentSelectedOutPort(this.model);
        s.clearAllSelections();
        document.addEventListener('mousemove', this.onMouseMove as any, true);
        document.addEventListener('mouseup', this.onMouseUp as any, true);
    }

    private onMouseMove(e: React.MouseEvent<any>) {
        e.stopPropagation();
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }

        const target = s.currentSelectedOutPortWidget;
        if (!target || !Object.is(target!, this.props.model)) {
            document.removeEventListener('mousemove', this.onMouseMove as any, true);
            return;
        }
        const ratio = s.humanRatio;
        const dx = this.absX + (e.clientX - this.mouseDownX) * ratio;
        const dy = this.absY + (e.clientY - this.mouseDownY) * ratio;
        s.setTempLineEnd({x: dx, y: dy});
    }

    private onMouseUp(e: React.MouseEvent<any>) {
        e.stopPropagation();
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        if (s.canCreateLink()) {
            s.addLink(s.currentHoveredInPort!, s.currentSelectedOutPortWidget!);
        }
        if (s.canCreateTerminusLink()) {
            s.addTerminusLink(s.currentHoveredTerminus!);
        }

        s.resetLinkStatus();
        document.removeEventListener('mousemove', this.onMouseMove as any, true);
        document.removeEventListener('mouseup', this.onMouseUp as any, true);
    }

    // 为了增大相应区域，加上一块透明的长方形
    private helperSquare() {
        const hiddenAreaLength = 30;

        return (
            <rect
                fill={'transparent'}
                x={0}
                height={hiddenAreaLength}
                y={svgOutputRelativeY(this.props.parentHeight) - hiddenAreaLength / 2} width={this.props.parentWidth}
            />
        );
    }

    public render() {
        const {
            portRadius,
        } = this.props;
        const radius = this.showBig ? portRadius + 6 : portRadius;

        if (!!this.canvasConfig.callbacks.hideWidgetOutput && this.canvasConfig.callbacks.hideWidgetOutput(this.model)) {
            return null;
        }

        return (
            <g
                onMouseEnter={() => {
                    this.setShowBig(true);
                }}
                onMouseLeave={() => {
                    this.setShowBig(false);
                }}>
                {this.helperSquare()}
                <circle
                    onMouseDown={this.onMouseDown}
                    className={'outport'} cx={svgOutputRelativeX(this.props.parentWidth)}
                    cy={svgOutputRelativeY(this.props.parentHeight)}
                    r={radius}/>
            </g>
        );
    }
}
