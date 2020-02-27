import * as React from 'react';
import {complexInject} from '../../DisplayCanvasUtils';
import './index.scss';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import Checkbox, {CheckboxChangeEvent} from 'antd/es/checkbox';
import 'antd/es/checkbox/style';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style';
import _remove from 'lodash/remove';
import {PositionHandler} from '../../context_menu/PositionHandler';
import {ComplexModeCanvasComponentProps} from '../complex/ComplexModeCanvasComponent';
import {EdgeDirection, EdgeFieldsFilterConfig, EdgeSchema, NodeSchema} from '../../interfaces';
import {CyNodeData} from '../../model/CyNode';
import {getTranslation} from '../../../../utils';
import {TagLabels} from '../complex/TagLabels';
import {SophonSearch} from '../../../../components/SophonSearch';
import EdgeDirectionSelect from '../../neighbor/EdgeDirectionSelect';

interface FindNeighborFilterState {
    interface: 'main' | 'entities' | 'relations';
    entitySearch: string;
    selectedEntities: string[];
    tempSelectedEntities: string[];
    selectedRelations: string[];
    relationSearch: string;
    tempSelectedRelations: string[];
    maxStep: number;
    bothDirection: boolean;
    edgeDirection: EdgeDirection;
    error: boolean;
    onlyShortest: boolean;
    commonNeighborsOnly: boolean;
}

export type FindNeighborFilterType = 'NEIGHBOR' | 'PATH';

export interface FindNeighborFilterProps extends ComplexModeCanvasComponentProps {
    type: FindNeighborFilterType;
    minStep?: number;
    maxStep?: number;
}

@complexInject
export class FindNeighborFilter extends PositionHandler<FindNeighborFilterProps, FindNeighborFilterState> {
    state: FindNeighborFilterState = {
        interface: 'main',
        selectedEntities: this.allEntitySchemaNames,
        entitySearch: '',
        tempSelectedEntities: this.allEntitySchemaNames,
        selectedRelations: this.allEdgeSchemaNames,
        relationSearch: '',
        tempSelectedRelations: this.allEdgeSchemaNames,
        maxStep: 2,
        error: false,
        bothDirection: false,
        edgeDirection: 'both',
        onlyShortest: false,
        commonNeighborsOnly: false,
    };

    constructor(props: any) {
        super(props);
        this.cancel = this.cancel.bind(this);
        this.confirm = this.confirm.bind(this);
    }

    private cancel() {
        if (this.state.interface === 'main') {
            this.stateService.setShowNeighborFilterModal(false);
            this.stateService.setShowPathDiscoveryModal(false);
        } else {
            this.setState({
                interface: 'main',
            });
        }
    }

    private confirm() {
        if (this.state.interface === 'main') {
            if (this.state.selectedRelations.length === 0
                && this.state.selectedEntities.length === 0) {
                this.setState({
                    error: true,
                });
            } else {
                const callbacks = this.canvasConfig!.displayModeConfig!.callbacks;
                if (this.props.type === 'NEIGHBOR' && callbacks && callbacks.onNeighborConfirm) {
                    const cyNodeDataIds: Set<string> = new Set<string>();
                    if (this.stateService.canvasContextMenuNode) {
                        cyNodeDataIds.add(this.stateService.canvasContextMenuNode.id);
                    }

                    const ids = this.helperService
                        .selectedCyNodesData.map((data: CyNodeData) => data.id);
                    ids.forEach((id: string) => cyNodeDataIds.add(id));

                    const selectedRelations = this.state.selectedRelations.reduce(
                        (result: EdgeFieldsFilterConfig, relationName: string) => {
                            result[relationName] = [];
                            return result;
                        }, {});

                    callbacks.onNeighborConfirm({
                        vertexIDs: Array.from(cyNodeDataIds),
                        nodeTypes: this.state.selectedEntities,
                        edgesFieldsLimitMap: selectedRelations,
                        direction: this.state.edgeDirection,
                        commonOnly: this.state.commonNeighborsOnly,
                    });

                } else if (this.props.type === 'PATH' && callbacks && callbacks.onFindPathConfirm) {
                    const eleService = this.stateService.elementService;
                    callbacks.onFindPathConfirm(
                        {
                            fromId: eleService.pathStart!, toId: eleService.pathEnd!,
                            nodeTypes: this.state.selectedEntities,
                            edgeTypes: this.state.selectedRelations,
                            step: this.state.maxStep,
                            bothDirection: this.state.bothDirection,
                            onlyShortest: false,
                            // onlyShortest: this.state.onlyShortest,
                        },
                    );
                }

                this.stateService.setShowNeighborFilterModal(false);
                this.stateService.setShowPathDiscoveryModal(false);
            }

        } else if (this.state.interface === 'entities') {
            this.setState({
                selectedEntities: this.state.tempSelectedEntities,
                interface: 'main',
                error: false,
            });
        } else if (this.state.interface === 'relations') {
            this.setState({
                selectedRelations: this.state.tempSelectedRelations,
                interface: 'main',
                error: false,
            });
        }
    }

    get showLayoutOption() {
        return this.props.type === 'PATH';
    }

    get showDirectionOption2() {
        return this.props.type === 'NEIGHBOR';
    }

    get showDirectionOption() {
        return this.props.type === 'PATH';
    }

    get showStepsOption() {
        return this.props.type === 'PATH';
    }

    renderMainInterface() {
        const marks: any = {};
        const minStep = this.props.minStep || 1, maxStep = this.props.maxStep || 4;
        for (let i = minStep; i <= maxStep; i++) {
            marks[i] = i;
        }
        return (
            <React.Fragment>
                <div className='neighbor-header'>
                    <b>{getTranslation(this.locale, 'Entity Type')}</b>
                    <span className='tool-btn' onClick={() => {
                        this.setState({
                            interface: 'entities',
                        });
                    }}>
                        {getTranslation(this.locale, 'Select Entities')}
                    </span>
                </div>
                <div className='neighbor-body'>
                    {this.state.selectedEntities.length === 0 && getTranslation(this.locale, 'Entity Hint')}
                    {this.state.selectedEntities.length !== 0 && <TagLabels labels={this.state.selectedEntities}/>}
                </div>

                <div className='neighbor-header' style={{marginTop: 25}}>
                    <b>{getTranslation(this.locale, 'Relation Type')}</b>
                    <span className='tool-btn' onClick={() => {
                        this.setState({
                            interface: 'relations',
                        });
                    }}>
                        {getTranslation(this.locale, 'Select Relations')}
                    </span>
                </div>
                <div className='neighbor-body'>
                    {this.state.selectedRelations.length === 0 && getTranslation(this.locale, 'Relation Hint')}
                    {this.state.selectedRelations.length !== 0 && <TagLabels labels={this.state.selectedRelations}/>}
                </div>

                {/* {this.showDirectionOption &&
                <React.Fragment>
                    <div className='neighbor-header' style={{marginTop: 25}}>
                        <div>
                            <b style={{marginRight: 8}}>{getTranslation(this.locale, 'Direction')}</b>
                        </div>
                    </div>
                    <div className='neighbor-body'>
                        <RadioGroup value={this.state.bothDirection} onChange={() => {
                            this.setState({
                                bothDirection: !this.state.bothDirection,
                            })
                        }}>
                            <Radio value={false}>{getTranslation(this.locale, 'One Way')}</Radio>
                            <Radio value={true}>{getTranslation(this.locale, 'Bidirectional')}</Radio>
                        </RadioGroup>
                    </div>
                </React.Fragment>
                } */}

                {this.showDirectionOption2 &&
                <React.Fragment>
                    <div className='neighbor-header' style={{marginTop: 25}}>
                        <div>
                            <b style={{marginRight: 8}}>{getTranslation(this.locale, 'Direction')}</b>
                        </div>
                    </div>
                    <div className='neighbor-body'>
                        <EdgeDirectionSelect
                            locale={this.locale}
                            value={this.state.edgeDirection}
                            onChange={this.handleEdgeDirectionChange} />
                    </div>
                    {this.helperService.selectedCyNodesData.length > 1 &&
                    <div className='neighbor-body'>
                        <Checkbox
                            value={this.state.commonNeighborsOnly}
                            onChange={this.handleCommonOnly}
                        >
                            {getTranslation(this.locale, 'Common Neighbors Only')}
                        </Checkbox>
                    </div>}
                    <div className='neighbor-body'>
                        <span>{getTranslation(this.locale, 'ShowRelatedEntitiesTips')}</span>
                    </div>
                </React.Fragment>
                }

                {
                    this.showStepsOption &&
                    <React.Fragment>
                        <div className='neighbor-header' style={{marginTop: 25}}>
                            <div>
                                <b style={{marginRight: 8}}>{getTranslation(this.locale, 'Max Hops')}</b>
                            </div>
                        </div>
                        <div className='neighbor-body'>
                            <Slider min={minStep} max={maxStep}
                                    marks={marks}
                                    value={this.state.maxStep} onChange={(value: number) => {
                                this.setState({
                                    maxStep: value,
                                });
                            }}/>
                        </div>
                        {/*<div className='neighbor-header shortest-header'>*/}
                            {/*<div>*/}
                                {/*<b style={{marginRight: 8}}>{getTranslation(this.locale, 'shortest path only?')}</b>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className='neighbor-body'>*/}
                        {/*<RadioGroup value={this.state.onlyShortest} onChange={this.onOnlyShortestChange}>*/}
                        {/*<Radio value={false}>{getTranslation(this.locale, 'No')}</Radio>*/}
                        {/*<Radio value={true}>{getTranslation(this.locale, 'Yes')}</Radio>*/}
                        {/*</RadioGroup>*/}
                        {/*</div>*/}
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }

    get allEntitySchemaNames() {
        const entitySchemas = this.service.canvasStore.displayModePipelineSchema.vertices;
        return entitySchemas.map((s: NodeSchema) => s.labelName);
    }

    get allEdgeSchemaNames() {
        const edgeSchemas = this.service.canvasStore.displayModePipelineSchema.edges;
        return edgeSchemas.map((s: EdgeSchema) => s.labelName);
    }

    // private onOnlyShortestChange = (event: RadioChangeEvent) => {
    //     this.setState({onlyShortest: event.target.value});
    // }

    private handleCommonOnly = (event: CheckboxChangeEvent) => {
        this.setState({commonNeighborsOnly: event.target.checked});
    }

    private handleEdgeDirectionChange = (value: EdgeDirection) => {
        this.setState({
            edgeDirection: value,
        });
    }

    renderEntitiesInterface() {
        const allSchemaNames = this.allEntitySchemaNames;
        return (
            <div className='entities-content'>
                <div className='neighbor-header'>
                    <span>
                        <Checkbox
                            checked={this.state.tempSelectedEntities.length === allSchemaNames.length}
                            onChange={this.handleEntitiesCheckAll}
                        />
                        <label className='item-label'>
                            {getTranslation(this.locale, 'Items', {
                                count: this.state.tempSelectedEntities.length,
                            })}
                        </label>
                    </span>
                    <label>
                        {getTranslation(this.locale, 'Entity Label')}
                    </label>
                </div>
                <SophonSearch
                    placeholder={getTranslation(this.locale, 'Search', {title: getTranslation(this.locale, 'Entities')})}
                    onChange={(value: string) => {
                        this.setState({
                            entitySearch: value,
                        });
                    }}
                />
                {allSchemaNames
                    .filter((name: string) => {
                        return name.includes(this.state.entitySearch.trim());
                    })
                    .map((name: string) => {
                        return (
                            <div key={name} className='options'>
                                <Checkbox
                                    key={'entity' + name}
                                    onChange={(e: any) => {
                                        if (e.target.checked) {
                                            this.state.tempSelectedEntities.push(name);
                                        } else {
                                            _remove(this.state.tempSelectedEntities, (e: string) => e === name);
                                        }
                                        this.setState({
                                            selectedEntities: this.state.tempSelectedEntities,
                                        });
                                    }}
                                    checked={this.state.tempSelectedEntities.indexOf(name) !== -1}/>
                                <label className='item-label' htmlFor={'entity' + name}>
                                    {name}
                                </label>
                            </div>
                        );
                    })}

            </div>);
    }

    private handleEntitiesCheckAll = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            this.setState({
                tempSelectedEntities: this.allEntitySchemaNames,
            });
        } else {
            this.setState({
                tempSelectedEntities: [],
            });
        }
    }

    renderRelationsInterface() {
        const edgeSchemaNames = this.allEdgeSchemaNames;
        return (
            <div className='relationships-content'>
                <div className='neighbor-header'>
                    <span>
                        <Checkbox
                            checked={this.state.tempSelectedRelations.length === edgeSchemaNames.length}
                            onChange={this.onCheckAllChange}
                        />
                        <label className='item-label'>
                            {getTranslation(this.locale, 'Items', {
                                count: this.state.tempSelectedRelations.length,
                            })}
                        </label>
                    </span>
                    <span>
                        {getTranslation(this.locale, 'Relationship')}
                    </span>
                </div>
                <SophonSearch
                    placeholder={getTranslation(this.locale, 'Search', {title: getTranslation(this.locale, 'Relationship')})}
                    onChange={(value: string) => {
                        this.setState({
                            relationSearch: value,
                        });
                    }}
                />
                {edgeSchemaNames
                    .filter((name: string) => {
                        return name.includes(this.state.relationSearch.trim());
                    })
                    .map((name: string) => {
                        return (
                            <div key={name} className='options'>
                                <Checkbox
                                    key={'entity' + name}
                                    onChange={(e: any) => {
                                        if (e.target.checked) {
                                            this.state.tempSelectedRelations.push(name);
                                        } else {
                                            _remove(this.state.tempSelectedRelations, (e: string) => e === name);
                                        }
                                        this.setState({
                                            selectedRelations: this.state.tempSelectedRelations,
                                        });
                                    }}
                                    checked={this.state.tempSelectedRelations.indexOf(name) !== -1}/>
                                <label className='item-label' htmlFor={'entity' + name}>
                                    {name}
                                </label>
                            </div>
                        );
                    })}
            </div>);
    }

    private onCheckAllChange = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            this.setState({
                tempSelectedRelations: this.allEdgeSchemaNames,
            });
        } else {
            this.setState({
                tempSelectedRelations: [],
            });
        }
    }

    public render() {
        return (
            <div className={this.state.interface === 'main' ? 'find-neighbor-filter' : 'config-wrapper'}
                 ref={this.ref}
                 style={{left: this.stateService.canvasContextMenuX, top: this.stateService.canvasContextMenuY}}
            >
                {this.state.interface === 'main' && this.renderMainInterface()}
                {this.state.interface === 'entities' && this.renderEntitiesInterface()}
                {this.state.interface === 'relations' && this.renderRelationsInterface()}
                {this.state.interface === 'main' && this.state.error
                && <div className='neighbor-filter-error'>
                    {getTranslation(this.locale, 'Neighbor Error Hint')}
                </div>}

                {this.state.interface !== 'main' && <Divider className='divider'/>}
                <div className='buttons'>
                    <Button size={'small'} onClick={this.cancel}>{getTranslation(this.locale, 'Cancel')}</Button>
                    <Button size={'small'} onClick={this.confirm}
                            type='primary'>{getTranslation(this.locale, 'Confirm')}</Button>
                </div>
            </div>
        );
    }
}
