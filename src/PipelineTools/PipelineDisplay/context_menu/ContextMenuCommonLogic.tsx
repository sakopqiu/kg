import {getTranslation, Locales} from '../../../utils';
import {StatusService} from '../service/StatusService';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import * as React from 'react';
import {CyType} from '../model/CyElement';
import {runInAction} from 'mobx';
import {LayoutConfig, LayoutConfigs} from '../CanvasDrawUtils';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

export function addEdgeMergeOptions(results: React.ReactNode[], statusService: StatusService, locale: Locales) {
    const stateService = statusService.stateService;
    const cyState = stateService.cyState;

    if (statusService.showForSingleEdge && statusService.edgeClicked) {
        const edgeData = stateService.canvasContextMenuEdge!;
        if (edgeData.cyType === CyType.EDGEGROUP) {
            results.push(
                <MenuItem onClick={() => {
                    cyState.removeMergedEmi(edgeData.id);
                }} key={'expand-single-group'}>
                    <Tooltip title={getTranslation(locale, 'Expand edge hint')}>
                        {getTranslation(locale, 'Expand edge')}
                    </Tooltip>
                </MenuItem>,
            );
        } else if (edgeData.cyType === CyType.EDGE) {
            results.push(
                <MenuItem onClick={() => {
                    const source = edgeData.originalSrcId || edgeData.source;
                    const target = edgeData.originalTargetId || edgeData.target;
                    cyState.addMergedEmi(source, target, edgeData.name);
                }} key={'collapse-single-group'}>
                    <Tooltip title={getTranslation(locale, 'Merge edge hint')}>
                        {getTranslation(locale, 'Merge edge')}
                    </Tooltip>
                </MenuItem>,
            );
        } else {
            throw new Error('Unknown edgeData type ' + edgeData.cyType);
        }
    }
    return results;
}

export function addInspectFindPathResult(results: React.ReactNode[], statusService: StatusService, locale: Locales) {
    if (statusService.findPathEdgeClicked) {
        results.push(
            <MenuItem onClick={() => {
                statusService.stateService.closeAllContextMenu();
                statusService.stateService.setShowFindPathResultModal(true);
            }} key={'add-inspect-find-path-result'}>
                {getTranslation(locale, 'Inspect Result')}
            </MenuItem>,
        );
        results.push(
            <MenuItem onClick={() => {
                statusService.stateService.closeAllContextMenu();
                statusService.cyState.expandSelectedPathBeaconEdges();
            }} key={'expand-find-path-result'}>
                {getTranslation(locale, 'Expand Selected Path')}
            </MenuItem>,
        );
    }
    results.push(
        <MenuItem onClick={() => {
            statusService.stateService.closeAllContextMenu();
            statusService.cyState.expandAllPathBeaconEdges();
        }} key={'expand-all-path-result'}>
            {getTranslation(locale, 'Expand All Paths')}
        </MenuItem>,
    );
}

export function addExpandCollapseSingleCommunity(results: React.ReactNode[], statusService: StatusService, locale: Locales) {
    const cs = statusService.drawService.cyState;
    const stateService = statusService.stateService;
    if (
        statusService.communityClicked) {
        const community = cs.getCommunityById(stateService.canvasContextMenuNode!.id)!;

        if (!community.getCollapsed()) {
            results.push(
                (<MenuItem onClick={() => {
                    stateService.closeAllContextMenu();
                    const cid = stateService.canvasContextMenuNode!.id;
                    stateService.communityService.collapseCommunity(cid);
                }} key='collapse-single'>
                    {getTranslation(locale, 'Collapse')}
                </MenuItem>),
            );
        } else {
            results.push(
                (<MenuItem onClick={() => {
                    stateService.closeAllContextMenu();
                    const cid = stateService.canvasContextMenuNode!.id;
                    stateService.communityService.expandCommunity(cid, false);
                }} key='expand-single'>
                    {getTranslation(locale, 'Expand')}
                </MenuItem>),
            );

            results.push(
                (<MenuItem onClick={() => {
                    stateService.closeAllContextMenu();
                    const cid = stateService.canvasContextMenuNode!.id;
                    stateService.communityService.expandCommunity(cid, true);
                }} key='expand-single-recursive'>
                    {getTranslation(locale, 'Expand Recursively')}
                </MenuItem>),
            );
        }
    }
}

export function addExpandCollapseAllCommunities(results: React.ReactNode[], statusService: StatusService, locale: Locales) {
    const stateService = statusService.stateService;
    results.push(
        <MenuItem onClick={() => {
            stateService.closeAllContextMenu();
            stateService.communityService.collapseAllCommunities();
        }} key={'collapse all'}>
            {getTranslation(locale, 'Collapse All Communities')}
        </MenuItem>,
    );

    results.push(
        <MenuItem onClick={() => {
            stateService.closeAllContextMenu();
            stateService.communityService.expandAllCommunities();
        }} key={'expand all'}>
            {getTranslation(locale, 'Expand All Communities')}
        </MenuItem>,
    );
}

export function addAllEdgeMergeOptions(results: React.ReactNode[], statusService: StatusService, locale: Locales) {
    const cyState = statusService.cyState;
    if (statusService.menuOnlyForBgContext) {

        results.push(
            <MenuItem onClick={() => {
                runInAction(() => {
                    cyState.mergeAllEdges();
                    statusService.stateService.closeAllContextMenu();
                });
            }} key={'collapse-group'}>
                <Tooltip title={getTranslation(locale, 'Merge all edge hint')}>
                    {getTranslation(locale, 'Merge edge')}
                </Tooltip>
            </MenuItem>,
        );

        results.push(
            <MenuItem onClick={() => {
                runInAction(() => {
                    cyState.expandAllEdges();
                    statusService.stateService.closeAllContextMenu();
                });
            }} key={'expand-group'}>
                <Tooltip title={getTranslation(locale, 'Expand all edge hint')}>
                    {getTranslation(locale, 'Expand edge')}
                </Tooltip>
            </MenuItem>,
        );
    }
}

export function addLayoutSelected(results: React.ReactNode[], statusService: StatusService, locale: Locales) {
    if (statusService.menuShowForMultipleNodes || statusService.helperService.isCollapsedCommunityClicked) {
        results.push(
            <SubMenu
                className='canvas-context-submenu'
                title={getTranslation(locale, 'Layout Selected') + '...'}
                key={'Layout Selected'}>
                {LayoutConfigs.map((config: LayoutConfig) => {
                    return <MenuItem
                        onClick={() => {
                            statusService.stateService.closeAllContextMenu();
                            statusService.selectionService.layoutSelected(config.value);
                        }}
                        key={config.value}
                        title={config.name}>
                        {config.name}
                    </MenuItem>;
                })}
            </SubMenu>);
    }
}
