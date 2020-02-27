import * as React from 'react';
import '../../contextMenu.scss';
import {complexInject} from '../../../DisplayCanvasUtils';
import {disableOsDefault, getTranslation} from '../../../../../utils';
// import {PathAlgos} from "../service/CanvasDrawService";
import {ContextMenuOptions} from '../../../interfaces';
import {PositionHandler} from '../../PositionHandler';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import _get from 'lodash/get';
import {
    addEdgeMergeOptions, addExpandCollapseAllCommunities,
    addExpandCollapseSingleCommunity,
    addInspectFindPathResult,
    addLayoutSelected,
} from '../../ContextMenuCommonLogic';
import {ComplexModeCanvasComponentProps} from '../../../components/complex/ComplexModeCanvasComponent';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

@complexInject
export default class ComplexCanvasContextMenu extends PositionHandler {

    constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
        this.showRelationModal = this.showRelationModal.bind(this);
        this.showNodeStyleConfigurer = this.showNodeStyleConfigurer.bind(this);
        this.showCustomizedCommunityMenu = this.showCustomizedCommunityMenu.bind(this);
        this.deleteSelected = this.deleteSelected.bind(this);
        this.setPathDiscoveryStart = this.setPathDiscoveryStart.bind(this);
        this.setOfflinePathStart = this.setOfflinePathStart.bind(this);
        this.clearAll = this.clearAll.bind(this);
        this.invertSelection = this.invertSelection.bind(this);
        this.clearSelectedEdgesLineColor = this.clearSelectedEdgesLineColor.bind(this);
        this.clearCommunities = this.clearCommunities.bind(this);
    }

    private deleteSelected() {
        this.stateService.closeAllContextMenu();
        this.stateService.elementService.deleteSelected();
    }

    private invertSelection() {
        this.stateService.closeAllContextMenu();
        this.selectionService.invertSelection();
    }

    private selectNeighboringNodes = () => {
        this.stateService.closeAllContextMenu();
        this.selectionService.selectNeighboringNodes();
    }

    private selectNeighboringEdges = () => {
        this.stateService.closeAllContextMenu();
        this.selectionService.selectNeighboringEdges();
    }

    private selectAllNeighbors = () => {
        this.stateService.closeAllContextMenu();
        this.selectionService.selectAllNeighbors();
    }

    private setPathDiscoveryStart() {
        this.stateService.elementService.setFindPathDiscover(this.stateService.canvasContextMenuNode!.id);
    }

    private setOfflinePathStart() {
        this.stateService.elementService.setShortestPathDiscover(this.stateService.canvasContextMenuNode!.id);
    }

    private editNote = () => {
        this.stateService.closeAllContextMenu();
        this.stateService.setShowNodeNote(true);
    }

    private clearSelectedEdgesLineColor() {
        this.stateService.elementService.restoreSelectedEdgesLineColor();
        this.stateService.closeAllContextMenu();
    }

    private clearCommunities() {
        this.stateService.communityService.clearCommunities();
        this.stateService.closeAllContextMenu();
    }

    private tagHandler = (e: any) => {
        this.stateService.closeAllContextMenu();
        this.stateService.setShowCanvasTag(true);
    }

    private selectAll = () => {
        this.selectionService.selectAll();
        this.stateService.closeAllContextMenu();
    }

    private clearAll() {
        this.stateService.elementService.clearAll();
    }

    private showRelationModal() {
        this.stateService.closeAllContextMenu();
        this.stateService.setShowNeighborFilterModal(true);
    }

    private showCustomizedCommunityMenu() {
        this.stateService.closeAllContextMenu();
        this.stateService.setShowCustomizedCommunityMenu(true);
    }

    private showNodeStyleConfigurer() {
        this.stateService.closeAllContextMenu();
        this.stateService.setShowNodeStyleConfigurer(true);
    }

    private mergeEntities = () => {
        // TODO figure out a way to validate the selected nodes are actually 'the same'
        this.stateService.closeAllContextMenu();
        this.stateService.setShowMergeEntitiesModal(true);
    }

    private part0() {
        const nodesMergeCallback = _get(this, 'canvasConfig.displayModeConfig.callbacks.nodesMerged');
        const results: React.ReactNode[] = [];

        if (this.statusService.menuShowForSingleNode || this.statusService.menuShowForMultipleNodes) {
            results.push(
                (<MenuItem onClick={this.showRelationModal} key='add-related'>
                    {getTranslation(this.locale, 'Add Related')}...
                </MenuItem>),
            );
        }
        if (this.statusService.menuShowForSingleNode) {
            results.push((
                <SubMenu title={getTranslation(this.locale, 'Path Search') + '...'}
                         key={'path-search'}
                         popupClassName='canvas-context-submenu'>
                    <MenuItem onClick={this.setPathDiscoveryStart}>
                        {getTranslation(this.locale, 'Path Discovery')}
                    </MenuItem>
                    <MenuItem
                        onClick={this.setOfflinePathStart}>
                        {getTranslation(this.locale, 'Find Shortest Path')}
                    </MenuItem>
                </SubMenu>
            ));
        }

        if (this.statusService.menuShowForMultipleNodes && !!nodesMergeCallback) {
            results.push(
                <MenuItem onClick={this.mergeEntities} key={'merge entities'}>
                    {getTranslation(this.locale, 'Merge Entities')}...
                </MenuItem>,
            );
        }

        return results;
    }

    // 包括添加关联实体，路径查找，自定义社群，合并实体
    private part1() {
        const results: React.ReactNode[] = [];
        if (this.statusService.menuShowForSingleNode
            || this.statusService.menuShowForMultipleNodes
            || this.helperService.cyMovableCommunities().length > 0
        ) {
            results.push(
                <MenuItem onClick={this.showCustomizedCommunityMenu} key={'community'}>
                    {getTranslation(this.locale, 'Customized Community')}...
                </MenuItem>,
            );
        }

        addExpandCollapseSingleCommunity(results, this.statusService, this.locale);
        addExpandCollapseAllCommunities(results, this.statusService, this.locale);
        return results;
    }

    private part2() {
        const results: React.ReactNode[] = [];

        if (this.statusService.menuShowForSingleNode) {
            results.push(
                <SubMenu title={getTranslation(this.locale, 'Entity Annotation') + '...'}
                         popupClassName='canvas-context-submenu'
                         key={'entity annotation'}
                >
                    <MenuItem onClick={this.tagHandler}>
                        {getTranslation(this.locale, 'Tags')}
                    </MenuItem>
                    <MenuItem onClick={this.editNote}>
                        {getTranslation(this.locale, 'Note')}
                    </MenuItem>
                </SubMenu>,
            );
        }
        if (this.statusService.menuShowForSingleNode || this.statusService.menuShowForMultipleNodes) {
            results.push(
                <MenuItem onClick={this.showNodeStyleConfigurer} key={'configure-style'}>
                    {getTranslation(this.locale, 'Configure Style')}...
                </MenuItem>,
            );
        }
        if (this.statusService.menuShowForMultipleNodes) {
            results.push(
                <MenuItem onClick={this.tagHandler} key={'batch-tags-addition'}>
                    {getTranslation(this.locale, 'Add Tags')}
                </MenuItem>,
            );
        }

        return results;
    }

    private part3() {
        const results: React.ReactNode[] = [];
        if (this.statusService.menuOnlyForBgContext) {
            results.push(
                <MenuItem onClick={this.selectAll} key={'select-all'}>
                    {getTranslation(this.locale, 'Select All')}
                </MenuItem>,
            );
        }

        if (this.statusService.showForSingleNode || this.statusService.showForMultipleNodes) {
            results.push(
                <SubMenu popupClassName='canvas-context-submenu'
                         title={getTranslation(this.locale, 'Select') + '...'}
                         key={'select-connected'}>
                    <MenuItem onClick={this.selectNeighboringNodes} key={'select-connected-nodes'}>
                        {getTranslation(this.locale, 'Select Neighboring Nodes')}
                    </MenuItem>
                    <MenuItem onClick={this.selectNeighboringEdges} key={'select-connected-edges'}>
                        {getTranslation(this.locale, 'Select Neighboring Edges')}
                    </MenuItem>
                    <MenuItem onClick={this.selectAllNeighbors} key={'select-connected-all'}>
                        {getTranslation(this.locale, 'Select All Neighbors')}
                    </MenuItem>
                </SubMenu>,
            );
        } else if (this.helperService.selectedCyEdgesCommonData.length > 0) {
            results.push(
                <SubMenu popupClassName='canvas-context-submenu'
                         title={getTranslation(this.locale, 'Select') + '...'}
                         key={'select-connected'}>
                    <MenuItem onClick={this.selectNeighboringNodes} key={'select-connected-nodes'}>
                        {getTranslation(this.locale, 'Select Neighboring Nodes')}
                    </MenuItem>
                </SubMenu>,
            );
        }

        addEdgeMergeOptions(results, this.statusService, this.locale);
        addLayoutSelected(results, this.statusService, this.locale);
        addInspectFindPathResult(results, this.statusService, this.locale);

        if (this.statusService.edgeClicked || this.statusService.normalNodeClicked) {
            results.push(
                <MenuItem onClick={this.invertSelection} key={'invert selection'}>
                    {getTranslation(this.locale, 'Invert Selection')}
                </MenuItem>,
            );
        }

        return results;
    }

    private part4() {
        const result = [];
        if (this.statusService.menuShowDeleteSelected) {
            result.push(
                <MenuItem onClick={this.deleteSelected} className='with-description'>
                    {getTranslation(this.locale, 'Remove')}
                    <br/>
                    <span className='menu-item-description'>{getTranslation(this.locale, 'Remove Hint')}</span>
                </MenuItem>,
            );
        }

        if (this.statusService.bgClicked) {
            result.push(
                <SubMenu title={getTranslation(this.locale, 'Clear') + '...'}
                         popupClassName='canvas-context-submenu'>
                    <MenuItem onClick={this.clearAll}>
                        {getTranslation(this.locale, 'Clear Canvas')}
                    </MenuItem>

                    <MenuItem onClick={this.clearCommunities}>
                        {getTranslation(this.locale, 'Clear Communities')}
                    </MenuItem>
                </SubMenu>,
            );
            result.push(
                <SubMenu title={getTranslation(this.locale, 'Reset') + '...'}
                         popupClassName='canvas-context-submenu'>
                    <MenuItem onClick={() => {
                        this.elementService.clearNodesStyle();
                        this.stateService.closeAllContextMenu();
                    }} key={'clear-entity-style'}>
                        {getTranslation(this.locale, 'Entity Style')}
                    </MenuItem>

                    <MenuItem onClick={() => {
                        this.elementService.clearEdgesStyle();
                        this.stateService.closeAllContextMenu();
                    }} key={'clear-edge-style'}>
                        {getTranslation(this.locale, 'Edge Style')}
                    </MenuItem>
                </SubMenu>,
            );

        }

        return result;
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }

        if (this.stateService.showCanvasContextMenu) {
            const temp = [];

            const part0 = this.part0();
            if (part0.length > 0) {
                temp.push(part0);
            }

            const part1 = this.part1();
            if (part1.length > 0) {
                temp.push(part1);
            }

            const part2 = this.part2();
            if (part2.length > 0) {
                temp.push(part2);
            }

            const part3 = this.part3();
            if (part3.length > 0) {
                temp.push(part3);
            }

            const part4 = this.part4();
            if (part4.length > 0) {
                temp.push(part4);
            }

            const parts = [];
            for (let i = 0; i < temp.length; i++) {
                parts.push(temp[i]);
                if (i !== temp.length - 1) {
                    parts.push(<MenuItem className='horizontal-separator-line' key={'sline' + i}/>);
                }
            }

            const extraOptions = this.canvasConfig.displayModeConfig!.canvasContextMenuOptions || [];
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
                        {extraOptions.map((option: ContextMenuOptions) => {
                            return <div
                                key={option.desc}
                                onClick={() => {
                                    try {
                                        option.onClick();
                                    } finally {
                                        this.stateService.setShowCanvasContextMenu(false);
                                    }
                                }}>
                                {option.desc}
                            </div>;
                        })}
                    </Menu>
                </div>
            );
        }
        return null;
    }
}
