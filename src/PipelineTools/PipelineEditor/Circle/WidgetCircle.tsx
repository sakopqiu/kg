import * as React from 'react';
import './index.scss';
import classNames from 'classnames';
import {WidgetModel} from '../../../models/WidgetModel';
import {editCanvasInject, shortName} from '../EditCanvasUtils';
import {AbstractWidget, IAbstractWidgetProps} from '../components/AbstractWidget';
import {computed} from 'mobx';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';

interface IWidgetCircleProps extends IAbstractWidgetProps {
    widget: WidgetModel;
    preview: boolean;
    selected?: boolean;
    outerRingWidth?: number;
}

// 有多个插拔口的圆形模块
@editCanvasInject
export default class WidgetCircle extends AbstractWidget<IWidgetCircleProps> {

    constructor(props: IWidgetCircleProps) {
        super(props);
    }

    get circleRadius() {
        return this.canvasConfig.circleConfig!.circleRadius;
    }

    get circleConfig() {
        return this.canvasConfig.circleConfig!;
    }

    public render() {
        const s = this.currentActiveStore!;
        const widget = this.props.widget;
        const baseX = widget.x;
        const baseY = widget.y;
        const selected = this.props.selected;
        const circleRadius = this.circleRadius;
        const outerRingWidth = this.circleConfig.outerRingWidth ? this.circleConfig.outerRingWidth : 7;
        return (
            <g transform={`translate(${baseX},${baseY})`}
               className={'widget-circle'}
               onContextMenu={this.onContextMenu}
               onMouseDown={this.onMouseDown}
               onMouseEnter={() => {
                   s.setCurrentHoveredInPort(widget);
               }}
               onMouseLeave={() => {
                   s.setCurrentHoveredInPort(null);
               }}
            >
                <WidgetCircleFragment selected={!!selected} widget={widget} circleRadius={circleRadius}
                                      outerRingWidth={outerRingWidth}/>
            </g>
        );
    }
}

interface IWidgetCircleFragmentProps extends IEditModeCanvasComponentProps {
    widget: WidgetModel;
    circleRadius: number;
    outerRingWidth: number;
    selected: boolean;
}

@editCanvasInject
class WidgetCircleFragment extends EditModeCanvasComponent<IWidgetCircleFragmentProps> {

    public constructor(props: IWidgetCircleFragmentProps) {
        super(props);
        this.onStartLinking = this.onStartLinking.bind(this);
        this.linking = this.linking.bind(this);
        this.stopLinking = this.stopLinking.bind(this);
    }

    @computed
    get absX() {
        return this.props.widget.x + this.props.circleRadius;
    }

    @computed
    get absY() {
        return this.props.widget.y + this.props.circleRadius;
    }

    private onStartLinking(e: React.MouseEvent<any>) {
        e.stopPropagation();
        if (this.currentActiveStore!.isPipelineReadOnly) {
            return;
        }
        const s = this.currentActiveStore!;
        if (s.currentSelectedOutPortWidget) { // 如果已经有当前被拖动的output
            return;
        }
        s.clearAllSelections();
        s.setTempLineStart({
            x: this.absX,
            y: this.absY,
        });
        s.setCurrentSelectedOutPort(this.props.widget);
        document.addEventListener('mousemove', this.linking as any, true);
        document.addEventListener('mouseup', this.stopLinking as any, true);
    }

    private linking(e: React.MouseEvent<any>) {
        e.stopPropagation();
        const s = this.currentActiveStore!;
        const target = s.currentSelectedOutPortWidget;
        if (!target || !Object.is(target!, this.props.widget)) {
            document.removeEventListener('mousemove', this.linking as any, true);
            return;
        }
        const temp = s.clientToSvg({x: e.clientX, y: e.clientY});
        s.setTempLineEnd({x: temp.x, y: temp.y});
    }

    private stopLinking(e: React.MouseEvent<any>) {
        e.stopPropagation();
        const s = this.currentActiveStore!;
        if (s.canCreateLink()) {
            s.addLink(s.currentHoveredInPort!, s.currentSelectedOutPortWidget!);
        }
        s.resetLinkStatus();
        document.removeEventListener('mousemove', this.linking as any, true);
        document.removeEventListener('mouseup', this.stopLinking as any, true);
    }

    public render() {
        const {widget, circleRadius, outerRingWidth, selected} = this.props;
        const name = widget.name || widget.dataset!.name;
        return (
            <React.Fragment>
                <title>{name}</title>
                <desc>{name}</desc>
                <circle
                    className='circle-outer-ring'
                    cx={circleRadius} cy={circleRadius} r={circleRadius + outerRingWidth}
                    onMouseDown={this.onStartLinking}
                />
                <circle
                    className={classNames(
                        'inner-circle', {
                            selected,
                            error: widget.checkFormFailed,
                        },
                    )}
                    cx={circleRadius} cy={circleRadius} r={circleRadius}/>
                <text x={circleRadius} y={circleRadius}
                      className={`pipeline-text widget-intro ${classNames({selected})}`}
                >{shortName(name)}</text>

            </React.Fragment>
        );
    }
}
