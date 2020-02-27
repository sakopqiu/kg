import * as React from 'react';
import '../canvas.scss';
import {complexInject} from '../../DisplayCanvasUtils';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';
import cola from 'cytoscape-cola';
import spread from 'cytoscape-spread';
import coseBilkent from 'cytoscape-cose-bilkent';
import springy from 'cytoscape-springy';
import {FindNeighborFilter} from '../../components/neighbor/FindNeighborFilter';
import {CytoHoverButtons} from '../../components/complex/HoverButtons/CytoHoverButtons';
import {CommunityPanel} from '../../components/complex/HoverButtons/CommunityPanel';
import {CustomizedCommunityMenu} from '../../context_menu/complex/CustomizedCommunityMenu';
import {NodeStyleConfigurer} from '../../context_menu/complex/NodeStyleConfigurer/NodeStyleConfigurer';
import {SearchModal} from '../../components/common/SearchModal/index';
import {TimeFilter} from '../../components/complex/TimeFilter/TimeFilter';
import {CytoMiniMap} from '../../components/common/CytoMiniMap/index';
import {ComplexModeCanvasComponent} from '../../components/complex/ComplexModeCanvasComponent';
import {PathFindHint} from '../../components/complex/PathFindHint/PathFindHint';
import {DescriptionTextEditor} from '../../components/complex/DescriptionTextEditor/DescriptionTextEditor';
import {FindPathResultModal} from '../../components/common/FindPathResultModal/FindPathResultModal';
import MergeEntitiesModal from '../../components/complex/MergeEntitiesModal/index';
import {TagSelect} from '../../components/complex/TagSelect/index';
import {CyNodeNote} from '../../components/complex/CyNodeNote/index';
import {ShortestPathConfig} from '../../components/complex/ShortestPathConfig/index';
import ComplexCanvasContextMenu from '../../context_menu/complex/ComplexCanvasContextMenu/ComplexCanvasContextMenu';
import {debug, getTranslation} from '../../../../utils';
import {TargetedLoading} from '../../../../components/TargetedLoading';
import {ContainerId} from '../../interfaces';
import {LoadingTargets} from '../../../../stores/LoadableStoreImpl';

cytoscape.use(dagre);
cytoscape.use(klay); // https://github.com/cytoscape/cytoscape.js-klay
cytoscape.use(spread); // https://github.com/cytoscape/cytoscape.js-klay
cytoscape.use(cola); // https://github.com/cytoscape/cytoscape.js-cola
cytoscape.use(coseBilkent);
cytoscape.use(springy);

@complexInject
export class CanvasBackground extends ComplexModeCanvasComponent {
    componentWillUnmount() {
        // 如果canvasbackground被关闭，比如路由发生了改变
        if (this.currentActiveStore) {
            this.service.destroyOldCy();
            this.service.stateService.closeAllContextMenu();
            debug('ComplexPipelineDisplay is destroyed because of route change');
        }
        this.mainStore.setCurrentSelectedPipelineId(null);
        document.removeEventListener('keydown', this.keyDown, true);
        document.removeEventListener('contextmenu', this.banContextMenu, true);
        document.removeEventListener('mousemove', this.updateBlazerPosition, true);

        // 删除节点，释放内存
        const container = document.getElementById(ContainerId.complex);
        if (container) {
            container.remove();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyDown, true);
        document.addEventListener('contextmenu', this.banContextMenu, true);
        document.addEventListener('mousemove', this.updateBlazerPosition, true);
    }

    private updateBlazerPosition = (e: any) => {
        if (this.currentActiveStore) {
            const eleService = this.currentActiveStore.canvasDrawService.elementService;
            if (eleService.showBlazer) {
                eleService.setBlazerPosition({
                    x: e.clientX,
                    y: e.clientY,
                });
            }
        }
    }

    // patch for windows
    private banContextMenu = (e: any) => {
        if (e.target && e.target.classList.contains('canvas-context-menu')) {
            e.preventDefault();
            return false;
        }
        return true;
    }

    private keyDown = (e: any) => {
        if (this.currentActiveStore) {
            this.currentActiveStore.canvasDrawService.eventService.keyDown(e);
        }
    }

    public render() {
        const activeStore = this.currentActiveStore;

        return (
            <div className='canvas-background pipeline-background'>
                <CytoHoverButtons/>
                {activeStore &&
                <React.Fragment>
                    <CommunityPanel/>
                    {/*{<CanvasSettingPanel/>}*/}
                </React.Fragment>
                }
                <ComplexCanvasContextMenu/>
                {activeStore && this.timeFilterService.showTimeFilter
                && <TimeFilter/>
                }

                {activeStore && this.stateService.showSearchBox &&
                <SearchModal locale={this.locale} currentActiveStore={activeStore}/>}

                {
                    activeStore && this.stateService.elementService.showBlazer
                    && <PathFindHint/>
                }
                {activeStore && this.stateService.showDescriptionTextEditor
                && <DescriptionTextEditor/>
                }
                {
                    activeStore && this.stateService.showCustomizedCommunityMenu
                    &&
                    <CustomizedCommunityMenu/>}
                {
                    activeStore && this.stateService.showFindPathResultModal
                    &&
                    <FindPathResultModal
                        parentCyState={this.cyState}
                        schema={activeStore.displayModePipelineSchema}
                        locale={this.locale}/>}
                {
                    activeStore && this.stateService.showNodeStyleConfigurer
                    &&
                    <NodeStyleConfigurer/>}
                {
                    activeStore && this.stateService.showNeighborFilterModal
                    &&
                    <FindNeighborFilter type='NEIGHBOR'/>}
                {
                    activeStore && this.stateService.showPathDiscoveryModal
                    &&
                    <FindNeighborFilter type='PATH'/>}
                {
                    activeStore && this.stateService.showShortestPathConfigModal
                    &&
                    <ShortestPathConfig/>}
                {
                    activeStore && this.stateService.showCanvasTagSelectionModal
                    &&
                    <TagSelect/>}
                {
                    activeStore && this.stateService.showCanvasMergeEntitiesModal
                    &&
                    <MergeEntitiesModal/>}
                <CyNodeNote/>
                <CanvasContainer/>
                {activeStore && <CytoMiniMap locale={this.locale} currentActiveStore={activeStore}/>}
                <TargetedLoading
                    noBackground
                    message={getTranslation(this.locale, 'Layouting Canvas')}
                    loadingTarget={LoadingTargets.CANVAS_LAYOUT} store={this.currentActiveStore!}/>
            </div>
        );
    }

}

function CanvasContainer() {
    return (
        <div id={ContainerId.complex}>
        </div>
    );
}
