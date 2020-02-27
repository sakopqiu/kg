import * as React from 'react';
import './index.scss';
import InPorts from './InPort';
import OutPort from './OutPort';
import classNames from 'classnames';
import {WidgetModel, WidgetStatus} from '../../../models/WidgetModel';
import {editCanvasInject, shortName} from '../../PipelineEditor/EditCanvasUtils';
import {AbstractWidget, IAbstractWidgetProps} from '../../PipelineEditor/components/AbstractWidget';
import {observer} from 'mobx-react';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import {WidgetModelStatus} from '../interfaces';
import {CancelledIcon} from '../../../icons/CancelledIcon';
import {SkippedIcon} from '../../../icons/SkippedIcon';
import {PendingIcon} from '../../../icons/PendingIcon';

interface IWidgetRectangleProps extends IAbstractWidgetProps {
    widget: WidgetModel;
    preview: boolean;
    selected?: boolean;
}

@editCanvasInject
export default class WidgetRectangle extends AbstractWidget<IWidgetRectangleProps> {

    private get width() {
        return this.canvasConfig.rectConfig!.opWidth;
    }

    private get height() {
        return this.canvasConfig.rectConfig!.opHeight;
    }

    private get cornerRadius() {
        return this.canvasConfig.rectConfig!.cornerRadius;
    }

    private get portRadius() {
        return this.canvasConfig.portRadius!;
    }

    public render() {
        const s = this.currentActiveStore!;
        const widget = this.props.widget;
        const baseX = widget.x;
        const baseY = widget.y;
        return (
            <g transform={`translate(${baseX},${baseY})`}
               className='widget-rectangle-wrapper'
               onDoubleClick={this.onDblClick}
               onClick={this.onClick}
               onContextMenu={this.onContextMenu}
               onMouseEnter={this.onMouseEnter}
               onMouseLeave={this.onMouseLeave}
               onMouseDown={this.onMouseDown}>
                <WidgetRectangleFragment
                    width={this.width}
                    height={this.height}
                    preview={this.props.preview}
                    cornerRadius={this.cornerRadius}
                    portRadius={this.portRadius}
                    title={this.canvasConfig.rectConfig!.title}
                    hovered={this.isHovered}
                    selected={!!this.props.selected}
                    render={this.canvasConfig.rectConfig!.render}
                    label={this.canvasConfig.label}
                    widget={widget} candidate={s.isWidgetCandidate(this.props.widget)}/>
            </g>
        );
    }
}

interface IWidgetRectangleFragmentProps {
    widget: WidgetModel;
    candidate: boolean; // 是否可以成为被连接的对象
    selected: boolean;
    hovered: boolean;
    cornerRadius: number;
    portRadius: number;
    width: number;
    height: number;
    preview: boolean;
    label?: (widgetStatus: WidgetModelStatus) => [string, string]; // 显示提供算子名字的标签和对应的hint
    title?: (widgetStatus: WidgetModelStatus) => string;
    render?: (widgetStatus: WidgetModelStatus) => React.ReactNode; // 如果不传,默认显示widget的name
}

@observer
class WidgetRectangleFragment extends React.Component<IWidgetRectangleFragmentProps> {

    private renderInputs() {
        const widget = this.props.widget;

        return (
            <InPorts
                widget={widget} portRadius={this.props.portRadius}
                parentCornerRadius={this.props.cornerRadius} parentWidth={this.props.width}/>
        );
    }

    private renderOutput() {
        const widget = this.props.widget;
        // 只读模式下不需要定义widgetDef
        if (!widget.paramDefs) {
            return null;
        }

        return (
            <OutPort
                model={widget} portRadius={this.props.portRadius}
                parentHeight={this.props.height}
                parentCornerRadius={this.props.cornerRadius} parentWidth={this.props.width}/>
        );
    }

    private statusIcon(status: WidgetStatus) {
        const ICON_SIZE = 16;

        switch (status) {
            case WidgetStatus.CANCELLED:
                return <CancelledIcon style={{fontSize: ICON_SIZE}}/>;
            case WidgetStatus.SKIPPED:
                return <SkippedIcon style={{fontSize: ICON_SIZE}}/>;
            case WidgetStatus.PENDING:
                return <PendingIcon className={'pending-upside-down'} style={{fontSize: ICON_SIZE}}/>;
            case WidgetStatus.RUNNING:
                return <Icon type='sync' spin className={'running-icon'}
                             style={{fontSize: ICON_SIZE}}/>;
            case WidgetStatus.SUCCESS:
                return <Icon type='check-circle' theme='filled'
                             style={{color: 'rgb(141, 202, 53)', fontSize: ICON_SIZE}}/>;
            case WidgetStatus.FAILED:
                return <Icon type='close-circle' theme='filled' style={{color: 'red', fontSize: ICON_SIZE}}/>;
            default:
                throw new Error('Invalid status');
        }
    }

    private statusIconObject(status: WidgetStatus) {
        const height = this.props.height;
        if (status !== WidgetStatus.NONE) {

            const divAttrs = {
                xmlns: 'http://www.w3.org/1999/xhtml',
            };
            const divStyle = {
                background: 'white',
                borderRadius: '50%',
                fontSize: 0,
            };
            return (
                <foreignObject height='16' width='16' x='-8' y={(height - 16) / 2}>
                    <div {...divAttrs} style={divStyle}>
                        {this.statusIcon(status)}
                    </div>
                </foreignObject>
            );
        }
        return null;
    }

    render() {

        const {widget, label, candidate, selected, cornerRadius, width, height, preview, hovered} = this.props;
        const widgetModelStatus: WidgetModelStatus = {
            widget,
            width,
            height,
            selected,
            hovered,
        };
        const name = label ? label(widgetModelStatus)[0] : widget.name;
        const renderResult = this.props.render ? this.props.render(widgetModelStatus) : 'default';
        const body = renderResult !== 'default' ? renderResult :
            (
                <text x={width / 2} y={height / 2} className={`pipeline-text widget-intro ${classNames({selected})}`}>
                    {shortName(name)}
                </text>
            );

        const title = this.props.title ? this.props.title(widgetModelStatus) : name;
        return (
            <React.Fragment>
                <desc>{title}</desc>
                <title>{title}</title>
                <rect
                    className={classNames('widget-rectangle',
                        {
                            'candidate-widget': candidate,
                            selected,
                            'error': widget.checkFormFailed,
                        },
                    )}
                    x={0} y={0} rx={cornerRadius} ry={cornerRadius} width={width} height={height}/>
                >
                {body}
                {preview ? null :
                    <React.Fragment>
                        {this.renderInputs()}
                        {this.renderOutput()}
                    </React.Fragment>
                }
                {this.statusIconObject(widget.status)}
            </React.Fragment>
        );
    }
}
