import * as React from 'react';
import './contextMenu.scss';
import {simpleInject} from '../DisplayCanvasUtils';
import {disableOsDefault, getTranslation} from '../../../utils';
import 'antd/es/input/style';
import Menu from 'antd/es/menu';
import {fineTunePopupPosition} from '../CanvasDrawUtils';
import {DisplayModeCanvasStore} from '../stores/DisplayModeCanvasStore';
import {
    addAllEdgeMergeOptions,
    addEdgeMergeOptions,
    addInspectFindPathResult,
    addLayoutSelected,
} from './ContextMenuCommonLogic';
import {
    ISimpleDisplayModeCanvasComponentProps,
    SimpleDisplayModeCanvasComponent,
} from '../search/special_search/simple/SimpleDisplayModeCanvasComponent';

const MenuItem = Menu.Item;

export interface ISimpleCanvasContextMenuProps extends ISimpleDisplayModeCanvasComponentProps {
    mainStore: DisplayModeCanvasStore;
}

@simpleInject
export default class SimpleCanvasContextMenu extends SimpleDisplayModeCanvasComponent<ISimpleCanvasContextMenuProps> {

    constructor(props: ISimpleCanvasContextMenuProps) {
        super(props);
        this.deleteSelected = this.deleteSelected.bind(this);
        this.setPathDiscoveryStart = this.setPathDiscoveryStart.bind(this);
    }

    ref = React.createRef<HTMLDivElement>();

    public componentDidUpdate() {
        fineTunePopupPosition(this.service, this.ref, 10);
    }

    public componentDidMount() {
        fineTunePopupPosition(this.service, this.ref, 10);
    }

    get mainStore() {
        return this.props.mainStore as any;
    }

    get service() {
        return this.mainStore.canvasDrawService;
    }

    get stateService() {
        return this.service.stateService;
    }

    get elementService() {
        return this.service.elementService;
    }

    private deleteSelected() {
        this.stateService.closeAllContextMenu();
        this.elementService.deleteSelected();
    }

    private setPathDiscoveryStart() {
        this.stateService.closeAllContextMenu();
        this.elementService.setPathDiscoveryStart(this.stateService.canvasContextMenuNode!.id);
        this.elementService.setPathDiscoveryType('ONLINE_PATH');
    }

    private onAddNeighbors = () => {
        this.stateService.closeAllContextMenu();
        if (this.canvasConfig.callbacks && this.canvasConfig.callbacks.onNeighborConfirm) {
            const nodeIds = this.helperService.selectedCyNodesData.map((n) => n.id);
            this.canvasConfig.callbacks.onNeighborConfirm({
                vertexIDs: nodeIds,
                nodeTypes: [],
                edgesFieldsLimitMap: this.cyState.edgesFilterConfig,
                direction: 'both',
                commonOnly: false,
            });
        }
    }

    // 包括添加关联实体，路径查找，
    private part1() {
        const results: React.ReactNode[] = [];
        if (this.statusService.menuShowForSingleNode ||
            this.statusService.menuShowForMultipleNodes) {
            results.push(
                (<MenuItem key='add-related' onClick={this.onAddNeighbors}>
                    {getTranslation(this.locale, 'Neighbor')}
                </MenuItem>),
            );
        }
        if (this.statusService.menuShowForSingleNode) {
            results.push((
                <MenuItem key='path-discovery' onClick={this.setPathDiscoveryStart}>
                    {getTranslation(this.locale, 'Path Discovery')}
                </MenuItem>
            ));
        }

        if (this.statusService.menuShowDeleteSelected) {
            results.push(
                <MenuItem onClick={this.deleteSelected}>
                    {getTranslation(this.locale, 'Remove')}
                </MenuItem>,
            );
        }
        addEdgeMergeOptions(results, this.statusService, this.locale);
        addAllEdgeMergeOptions(results, this.statusService, this.locale);
        addInspectFindPathResult(results, this.statusService, this.locale);
        addLayoutSelected(results, this.statusService, this.locale);
        return results;
    }

    public render() {
        const s = this.mainStore;
        if (!s) {
            return null;
        }

        if (this.stateService.showCanvasContextMenu) {
            const temp = [];
            const part1 = this.part1();
            if (part1.length > 0) {
                temp.push(part1);
            }

            const parts = [];
            for (let i = 0; i < temp.length; i++) {
                parts.push(temp[i]);
                if (i !== temp.length - 1) {
                    parts.push(<MenuItem className='horizontal-separator-line' key={'sline' + i}/>);
                }
            }
            if (parts.length === 0) {
                return null;
            }

            return (
                <div ref={this.ref} className='canvas-context-menu-wrapper'
                     style={{
                         left: this.stateService.canvasContextMenuX,
                         top: this.stateService.canvasContextMenuY,
                     }}
                     onContextMenu={disableOsDefault}
                >
                    <Menu className='canvas-context-menu'>
                        {parts}
                    </Menu>
                </div>
            );
        }
        return null;
    }
}
