import * as React from 'react';
import WidgetRectangle from '../Rectangle/WidgetRectangle';
import {DragLayer, XYCoord} from 'react-dnd';
import {WidgetModel} from '../../../models/WidgetModel';
import {editCanvasInject} from '../EditCanvasUtils';
import WidgetCircle from '../Circle/WidgetCircle';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import './index.scss';

interface IWidgetDragLayerProps extends IEditModeCanvasComponentProps {
    item: any;
    clientOffset: XYCoord;
    itemType: string;
    isDragging: boolean;
}

const padding = 5;

class SvgDatasetDragLayer extends EditModeCanvasComponent<IWidgetDragLayerProps> {

    constructor(props: IWidgetDragLayerProps) {
        super(props);
    }

    private getStyle() {
        const {clientOffset} = this.props;
        if (!clientOffset) {
            return {display: 'none'};
        }
        const {x, y} = clientOffset;
        return {
            position: 'fixed',
            zIndex: 100,
            left: `${x}px`,
            top: `${y + 2}px`,
        };
    }

    public render() {
        const {isDragging, item} = this.props;
        if (!isDragging || !item.dataset) {
            return null;
        }
        if (!this.currentActiveStore) {
            return;
        }
        let op: WidgetModel | null = null;
        op = new WidgetModel(this.currentActiveStore).fromDataset(item.dataset);
        op.x += padding;
        op.y += padding;
        const style = this.getStyle() as any;

        return (
            <div style={style}>
                <EnhancedSvg op={op}/>
            </div>
        );
    }
}

@editCanvasInject
export class EnhancedSvg extends EditModeCanvasComponent<IEditModeCanvasComponentProps & { op: WidgetModel }> {

    private previewShape(op: WidgetModel) {
        if (this.drawRect) {
            return <WidgetRectangle preview={true} widget={op}/>;
        } else if (this.drawCircle) {
            return <WidgetCircle preview={true} widget={op}/>;
        }
        throw this.throwShapeNotSupported();
    }

    public render() {
        let svgWidth = this.drawCircle ? this.canvasConfig.circleConfig!.circleRadius * 2 : this.canvasConfig.rectConfig!.opWidth;
        svgWidth += padding * 2; // padding;
        let svgHeight = this.drawCircle ? this.canvasConfig.circleConfig!.circleRadius * 2 : this.canvasConfig.rectConfig!.opHeight;
        svgHeight += padding * 2;
        return (
            <svg width={svgWidth} height={svgHeight}>
                {this.previewShape(this.props.op)}
            </svg>
        );
    }
}

export default DragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    clientOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
}))(editCanvasInject(SvgDatasetDragLayer));
