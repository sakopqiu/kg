import * as React from 'react';
import './index.scss';
import {DiffEntity} from './DiffEntity/DiffEntity';
import {DiffEdge} from './DiffEdge/DiffEdge';
import {showDiffDetailsModal} from '../../PipelineDiffUtils';
import {ComplexModeCanvasComponent, ComplexModeCanvasComponentProps} from '../../../ComplexModeCanvasComponent';
import {complexInject} from '../../../../../DisplayCanvasUtils';
import {filterCommonId, getTranslation} from '../../../../../../../utils';
import {ISophonCollapseItem, SophonCollapse} from '../../../../../../../components/SophonCollapse';
import {CommonElementData, EdgeDataJson, MutationNameType, SimpleGraphDataJson} from '../../../../../kg-interface';

export interface DiffDetailsTabProps extends ComplexModeCanvasComponentProps {
    data: SimpleGraphDataJson;
}

@complexInject
export class DiffDetailsTab extends ComplexModeCanvasComponent<DiffDetailsTabProps> {

    private onElementSelect = (data: CommonElementData) => {
        // 目前只考虑发生变化的实体或者边
        const diffCy = this.diffService.diffCy;
        const ele = diffCy.filter(filterCommonId(data.id));
        showDiffDetailsModal(ele, this.service);
    }

    private part(mutationName: MutationNameType, isVertex: boolean, title: string) {
        const data = isVertex
            ? this.props.data.vertices.filter((v) => v.mutationName === mutationName)
            : this.props.data.edges.filter((v) => v.mutationName === mutationName);

        const id = mutationName === 'Edit' ? ('Edit' + (isVertex ? 'Vertex' : 'Edge')) : mutationName;
        return {
            title: (
                <div>
                    <span className='update-title'>{title}</span>
                    ({data.length})
                </div>
            ),
            id,
            panelContent: (
                <div className='part-div'>
                    {data.map(e => isVertex ? <DiffEntity
                            onClick={this.onElementSelect}
                            key={e.id} entity={e}/>
                        : <DiffEdge
                            key={e.id}
                            onClick={this.onElementSelect}
                            edge={e as EdgeDataJson} allData={this.props.data}/>)}
                </div>
            ),

        } as ISophonCollapseItem;
    }

    public render() {
        return (
            <div className='diff-details-wrapper'>
                <SophonCollapse
                    className='diff-sophon-collapse'
                    data={[
                        this.part('Edit', true, getTranslation(this.locale, 'Entity Attr Change')),
                        this.part('DeleteVertex', true, getTranslation(this.locale, 'Deleted Entities')),
                        this.part('AddVertex', true, getTranslation(this.locale, 'New Entities')),
                        this.part('Edit', false, getTranslation(this.locale, 'Edge Attr Change')),
                        this.part('DeleteEdge', false, getTranslation(this.locale, 'Deleted Edges')),
                        this.part('AddEdge', false, getTranslation(this.locale, 'New Edges')),
                    ]}
                    accordion
                />
            </div>
        );
    }
}
