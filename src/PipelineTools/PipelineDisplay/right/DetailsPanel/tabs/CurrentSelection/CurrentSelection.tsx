import * as React from 'react';
import {SelectedNodesStats} from '../stats/SelectedNodesStats';
import {CanvasInfoComponent} from '../CanvasInfoComponent';
import _get from 'lodash/get';
import './index.scss';
import ElementAttributeViewer from '../../tabs/ElementAttributeViewer';
import {computed} from 'mobx';
import {Separator} from '../Separator';
import _compact from 'lodash/compact';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {getTranslation} from '../../../../../../utils';

export interface CurrentSelectionProps extends ComplexModeCanvasComponentProps {
    mainStore: DisplayModeCanvasStore;
}

@complexInject
export class CurrentSelection extends ComplexModeCanvasComponent<CurrentSelectionProps> {

    get currentActiveStore() {
        return this.props.mainStore;
    }

    get viewerProps() {
        return {
            locale: this.locale,
            mainStore: this.currentActiveStore!,
            readonly: false,
            fieldAdded: _get(this.canvasConfig.displayModeConfig.callbacks, 'fieldAdded'),
            fieldChanged: _get(this.canvasConfig.displayModeConfig.callbacks, 'fieldChanged'),
            fieldDeleted: _get(this.canvasConfig.displayModeConfig.callbacks, 'fieldDeleted'),
            elementsDeleted: _get(this.canvasConfig.displayModeConfig.callbacks, 'elementsDeleted'),
        };
    }

    renderNodesPart() {
        const result = [];
        const currentNodesData = this.helperService.selectedCyNodesData;

        if (currentNodesData && currentNodesData.length === 1) {
            result.push(<ElementAttributeViewer
                {...this.viewerProps}
                key='single-node-stat' w={currentNodesData[0]}/>);
        } else if (currentNodesData && currentNodesData.length > 1) {
            result.push(
                <div className='stats-title' key='node-title'>
                    {getTranslation(this.locale, 'Selected Entities Stats')}
                </div>,
            );
            result.push(<SelectedNodesStats key='nodes-stat'
                                            mainStore={this.currentActiveStore}
                                            data={currentNodesData}/>);
        }
        return result;
    }

    renderEdgesPart() {
        const result = [];
        const currentEdgesData = this.helperService.selectedCyEdgesCommonData;
        if (currentEdgesData.length !== 1) {
            return null;
        }

        if (this.helperService.selectedCyNodesData.length > 0) {
            result.push(<Separator key='edge-diagrams-separator'/>);
            result.push(
                <div className='stats-title' key='edge-title'>
                    {getTranslation(this.locale, 'Selected Edges Stats')}
                </div>,
            );
        }
        result.push(<ElementAttributeViewer
            {...this.viewerProps}
            key='single-edge-stat' w={currentEdgesData[0]}/>);

        // 边统计在实体统计下面，如果有实体选中需要多加一个separator

        // if (this.cyState.mergeEdgesMode) {
        //     result.push(
        //         <EdgeDiagrams
        //             key={'edge-diagrams'}
        //             edges={currentEdgesData}
        //             cyState={this.cyState}
        //             locale={this.locale}
        //             selectionService={this.selectionService}
        //         />)
        // } else {
        //     result.push(<SelectedEdgesStats
        //         key='edges-stat'
        //         mainStore={this.currentActiveStore}
        //         data={currentEdgesData}/>);
        // }

        return result;
    }

    @computed
    get onlySingleEdgeSelected() {
        return this.helperService.selectedCyEdgesCommonData.length === 1 && this.helperService.selectedCyNodesData.length === 0;
    }

    @computed
    get onlySingleNodeSelected() {
        return this.helperService.selectedCyEdgesCommonData.length === 0 && this.helperService.selectedCyNodesData.length === 1;
    }

    render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        let final: React.ReactNode[] = [];

        final = final.concat(this.renderNodesPart());
        final = final.concat(this.renderEdgesPart());
        final = _compact(final);

        // 如果什么都没选中的话，显示全局统计数据
        if (final.length === 0) {
            final.push(<CanvasInfoComponent key='canvas-info' mainStore={this.currentActiveStore}/>);
        }

        return (
            <div className='current-seletion-container'>
                {final}
            </div>
        );
    }
}
