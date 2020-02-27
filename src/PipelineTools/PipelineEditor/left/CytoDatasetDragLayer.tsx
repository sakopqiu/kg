import * as React from 'react';
import {DragLayer, XYCoord} from 'react-dnd';
// import {ObjectIcon} from "../../../icons/ObjectIcon";
import ObjectImage from '../../../images/kg/theme0/default/1.png';
import './index.scss';

interface ICytoWidgetDragLayerProps {
    item: any;
    clientOffset: XYCoord;
    itemType: string;
    isDragging: boolean;
}

class CytoDatasetDragLayer extends React.Component<ICytoWidgetDragLayerProps> {

    constructor(props: ICytoWidgetDragLayerProps) {
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

        const style = this.getStyle() as any;

        return (
            <div style={style}>
                <img src={ObjectImage} className={'object-drag'}/>
                {/*<ObjectIcon className='object-drag'/>*/}
            </div>
        );
    }
}

export default DragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    clientOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
}))(CytoDatasetDragLayer);
