import * as React from 'react';
import 'antd/es/icon/style';
import {ConnectDragPreview, ConnectDragSource, DragSource, DragSourceConnector, DragSourceMonitor} from 'react-dnd';
import {DragTypes} from '../Constants';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {WidgetModel} from '../../../models/WidgetModel';
import {editCanvasInject} from '../EditCanvasUtils';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {EditModeCanvasTabStore} from '../stores/EditModeCanvasTabStore';
import {NODE_NORMAL_SIZE} from '../../common/cytoscapeCommonStyle';
import _get from 'lodash/get';
import {TreeFile} from '../../../stores/TreeStore/TreeStoreModels';

export interface IWidgetDefMenuItemProps extends IEditModeCanvasComponentProps {
    dataset: TreeFile;
    connectDragSource?: ConnectDragSource;
    connectDragPreview?: ConnectDragPreview;
}

const WidgetDragSource = {
    beginDrag(props: IWidgetDefMenuItemProps) {
        return props;
    },
};

class DatasetMenuItem extends EditModeCanvasComponent<IWidgetDefMenuItemProps> {
    constructor(props: IWidgetDefMenuItemProps) {
        super(props);
        this.quickAddOp = this.quickAddOp.bind(this);
    }

    // 双击算子，快捷加入到流程图中
    private quickAddOp() {
        const s = this.currentActiveStore;
        if (!s) {
            return;
        }
        if (s.pipeline!.locked) {
            return;
        }
        const widget = new WidgetModel(s).fromDataset(this.props.dataset);
        let x: number, y: number;
        if (this.canvasConfig.renderType === 'svg') {
            const {scrollLeft, scrollTop} = EditModeCanvasTabStore.scrollDiffs();
            const translate = this.currentActiveStore!.pipeline!.viewBoxPosition;

            x = (50 + scrollLeft) * s.humanRatio + translate.x;
            y = (50 + scrollTop) * s.humanRatio + translate.y;

            if (s.isSnapped) {
                x = s.snappedValue(x);
                y = s.snappedValue(y);
            }
        } else {
            const cyExtent = this.mainStore.cy.extent();
            const ratio = this.currentActiveStore!.pipeline!.ratio;
            x = 50 / ratio + cyExtent.x1 + NODE_NORMAL_SIZE / 2;
            y = 50 / ratio + cyExtent.y1 + NODE_NORMAL_SIZE / 2;
        }
        widget.setX(x);
        widget.setY(y);

        if (_get(this.props, 'canvasConfig.events.beforeWidgetAdded')) {
            this.props.canvasConfig!.events!.beforeWidgetAdded!(widget);
        }
        s.addWidget(widget);
        if (_get(this, 'canvasConfig.events.onWidgetAdded')) {
            this.canvasConfig!.events!.onWidgetAdded!(widget);
        }
    }

    public componentDidMount() {
        this.props.connectDragPreview!(getEmptyImage() as any);
    }

    public render() {
        const {dataset, connectDragSource} = this.props;
        const isLocked = this.currentActiveStore!.pipeline!.locked;

        const body = (
            <div
                style={{
                    fontSize: 12,
                    cursor: isLocked ? 'not-allowed' : 'move',
                    width: '100%',
                }}
                onDoubleClick={this.quickAddOp}>
                {dataset.name}
            </div>
        );
        if (isLocked) {
            return body;
        }
        return connectDragSource && connectDragSource(body);
    }
}

export default editCanvasInject(DragSource(
    DragTypes.Widget,
    WidgetDragSource,
    (connect: DragSourceConnector, monitor: DragSourceMonitor) => (
        {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging(),
            connectDragPreview: connect.dragPreview(),
        }
    ),
)(editCanvasInject(DatasetMenuItem)));
