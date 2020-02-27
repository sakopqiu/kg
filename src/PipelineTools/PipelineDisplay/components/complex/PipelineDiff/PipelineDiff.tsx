import * as React from 'react';
import './index.scss';
import {Period, VersionDiff, VersionDiffResult} from '../../../kg-interface';
import {CyDiffNode} from './model/CyDiffNode';
import {CyDiffEdge} from './model/CyDiffEdge';
import {cytoDiffStyle} from './diff-style';
import {
    CYTO_FIT_PADDING,
    CYTO_MAX_ZOOM,
    CYTO_MIN_ZOOM, debug,
    getTranslation,
    LAYOUT_ELEMENT_PADDING,
} from '../../../../../utils';
import DiffDetailsPanel from './DiffDetailsPanel/DiffDetailsPanel';
import {complexInject} from '../../../DisplayCanvasUtils';
import {CloseIcon} from '../../../../../icons/CloseIcon';
import dagre from 'cytoscape-dagre';
import cola from 'cytoscape-cola';
import springy from 'cytoscape-springy';
import klay from 'cytoscape-klay';
import spread from 'cytoscape-spread';
import coseBilkent from 'cytoscape-cose-bilkent';
import {DiffDetailsModal} from './DiffDetailsModal/DiffDetailsModal';
import {PipelineDiffEventManager} from './PipelineDiffEventManager';
import {DiffFilterRadioGroup} from './DiffFilterRadioGroup/DiffFilterRadioGroup';
import {action, autorun, computed, IReactionDisposer, observable} from 'mobx';
import {HorizontalTimeline} from '../../../../../components/HorizontalTimeline';
import moment, {Moment} from 'moment';
import {ISophonOption, SophonSelect} from '../../../../../components/SophonSelect';
import _get from 'lodash/get';
import {DiffLegend} from './DiffLegend/DiffLegend';
import {ComplexModeCanvasComponent, ComplexModeCanvasComponentProps} from '../ComplexModeCanvasComponent';

const myCytoscape = require('../../../../cytoscape.cjs');
myCytoscape.use(dagre);
myCytoscape.use(klay); // https://github.com/cytoscape/cytoscape.js-klay
myCytoscape.use(spread); // https://github.com/cytoscape/cytoscape.js-klay
myCytoscape.use(cola); // https://github.com/cytoscape/cytoscape.js-cola
myCytoscape.use(coseBilkent);
myCytoscape.use(springy);

export interface PipelineDiffProps extends ComplexModeCanvasComponentProps {
    diffResult: VersionDiff;
    onClose: () => any;
}

@complexInject
export class PipelineDiff extends ComplexModeCanvasComponent<PipelineDiffProps> {
    @observable private currentTime = this.initialCurrentTime;
    @observable private index: number = -1;
    @observable private currentPeriod: Period = this.initialPeriod;
    @observable private currentDiffResult: VersionDiffResult;

    private autoRunDisposer: IReactionDisposer;
    private diffCy: any;
    private eventManager: PipelineDiffEventManager = new PipelineDiffEventManager(this.service);

    componentWillUnmount() {
        this.destroyOldDiffCy();
        if (this.autoRunDisposer) {
            this.autoRunDisposer();
        }
        // 如果tab被关掉，那么this.currentActiveStore可能是null
        if (this.currentActiveStore && this.diffService) {
            this.diffService.setShowAll(false);
            this.diffService.setDiffCy(null);
        }
    }

    private destroyOldDiffCy() {
        if (this.diffCy) {
            this.diffCy.destroy();
            this.diffCy = null;
            debug('diff cy destroyed');
        }
    }

    @action
    public setCurrentDiffResult(val: VersionDiffResult) {
        this.currentDiffResult = val;
    }

    @computed
    private get calculatedVisibleElements() {
        // this method observes only 2 elements, the first one is "currentDiffResult", another one is diffService.showAll
        const {vertices, edges} = this.currentDiffResult.inner;

        if (this.diffService.showAll) {
            return {
                nodes: vertices.map((v) => new CyDiffNode(v).cytoFormat()),
                edges: edges.map((e) => new CyDiffEdge(e).cytoFormat()),
            };
        } else {
            // mutationName存在的边需要被放进来
            const toBeAddedNodeIds = new Set<string>();
            const candidateEdges = edges
                .filter(e => {
                    // 如果一条边被加进来，那么他的起始节点和终点节点也要放进来，即使它的mutationName为空
                    if (!!e.mutationName) {
                        toBeAddedNodeIds.add(e.srcId);
                        toBeAddedNodeIds.add(e.dstId);
                        return true;
                    }
                    return false;
                })
                .map((e) => new CyDiffEdge(e).cytoFormat());

            const candidateNodes = vertices
                .filter((n) => !!n.mutationName || toBeAddedNodeIds.has(n.id))
                .map((v) => new CyDiffNode(v).cytoFormat());
            return {
                edges: candidateEdges,
                nodes: candidateNodes,
            };
        }
    }

    private startMonitoring() {
        this.setCurrentDiffResult(this.props.diffResult.result);
        this.autoRunDisposer = autorun(() => {
            const {nodes, edges} = this.calculatedVisibleElements;
            const diffCy = myCytoscape({
                container: document.getElementById('pipeline-diff'),
                elements: [...nodes, ...edges],
                style: cytoDiffStyle,
                wheelSensitivity: .3,
                minZoom: CYTO_MIN_ZOOM,
                maxZoom: CYTO_MAX_ZOOM,
                layout: {
                    name: 'breadthfirst',
                    avoidOverlapPadding: LAYOUT_ELEMENT_PADDING,
                    fit: true,
                    padding: CYTO_FIT_PADDING,
                },
            });
            // (window as any).dcy = diffCy;
            this.destroyOldDiffCy();
            this.diffCy = diffCy;
            this.diffService.setDiffCy(diffCy);
            this.registerEvents();
        });
    }

    componentDidMount() {
        this.startMonitoring();
    }

    componentWillReceiveProps(props: PipelineDiffProps) {
        this.setCurrentDiffResult(props.diffResult.result);
    }

    private registerEvents() {
        this.diffCy.on('tap', this.eventManager.onBackgroundClicked);
        this.diffCy.on('tap', 'node,edge', this.eventManager.onTapped);
        this.diffCy.on('drag', 'node', this.eventManager.hideDiffModal);
        this.diffCy.on('viewport', this.eventManager.hideDiffModal);
    }

    get initialPeriod() {
        return _get(this.props, 'diffResult.timeDiff.defaultPeriod') || 'months';
    }

    get initialCurrentTime() {
        const initial = _get(this.props, 'diffResult.timeDiff.initialCurrentDateTime');
        return initial ? initial.clone() : moment();
    }

    get initialEarliest() {
        return _get(this.props, 'diffResult.timeDiff.earliestDateTime') || moment('2016-01-01');
    }

    get periodOptions(): ISophonOption[] {
        return [
            {
                title: getTranslation(this.locale, 'Week'),
                value: 'weeks',
                disabled: true,
            },
            {
                title: getTranslation(this.locale, 'Month'),
                value: 'months',
            },
            {
                title: getTranslation(this.locale, 'Year'),
                value: 'years',
                disabled: true,
            }];
    }

    @computed
    get timestamps() {
        let iterator = this.currentTime.clone().subtract(1, this.currentPeriod);
        const result: Moment[] = [];
        while (iterator.isAfter(this.initialEarliest)) {
            result.unshift(iterator.clone());
            iterator = iterator.subtract(1, this.currentPeriod);
        }
        return result;
    }

    public render() {
        const {obj1, obj2, timeDiff} = this.props.diffResult;
        const timelineColor = '#EEF2F8';
        return (
            <div className='pipeline-diff-wrapper'>
                <div className='pipeline-diff-left'>
                    <div className='pipeline-diff-left-description'>
                        <div className='pipeline-diff-left-description-title'>
                            <span
                                className='pipeline-diff-left-description-title-highlight'>{getTranslation(this.locale, timeDiff ? 'Current' : 'Current Version') + ':'}</span>
                            <span>{obj1}</span>
                            <span style={{marginLeft: 10, marginRight: 10}}>VS</span>
                            <span
                                className='pipeline-diff-left-description-title-highlight'>{getTranslation(this.locale, timeDiff ? 'Base' : 'Diff Base') + ':'}</span>
                            <span>{obj2}</span>
                        </div>
                        <div onClick={this.props.onClose}
                             className='pipeline-diff-left-description-close'>
                            <CloseIcon className='close-x'/>
                            <span className='close-hint'>{getTranslation(this.locale, 'Stop Diff')}</span>
                        </div>
                    </div>
                    <DiffFilterRadioGroup/>
                    <div id='pipeline-diff'>
                        {/* cytoscape渲染区域，不要放置任何元素 */}
                    </div>
                    <DiffLegend/>
                    <DiffDetailsModal/>
                    {timeDiff &&
                    <React.Fragment>
                        <div className='diff-timeline-wrapper'>
                            <HorizontalTimeline
                                index={this.index >= 0 ? this.index : this.timestamps.length - 1}
                                values={this.timestamps.map((value) => value.get(this.currentPeriod))}
                                onClick={this.handleTimelineClick}
                                labelPosition='bottom'
                                labelWidth={130}
                                styles={{background: timelineColor, foreground: timelineColor, outline: timelineColor}}
                                getLabel={this.getLabel}
                                maxEventPadding={20}
                            />
                        </div>
                        <SophonSelect value={this.currentPeriod} options={this.periodOptions}
                                      onChange={this.handlePeriodChange}/>
                    </React.Fragment>}
                </div>
                <DiffDetailsPanel/>
            </div>
        );
    }

    @action
    private handlePeriodChange = (value: Period) => {
        const {timeDiff} = this.props.diffResult;
        this.currentPeriod = value;
        // always activate the past period
        const currentTime = moment();
        if (timeDiff!.onTimelineClicked) {
            const closestPastTime = currentTime.subtract(1, value);
            timeDiff!.onTimelineClicked(closestPastTime.clone());
        }
    }

    private getLabel = (value: number, index: number) => {
        return this.timestamps[index].format('YYYY-MM-DD HH:mm');
    }

    @action
    private handleTimelineClick = (value: number, index: number) => {
        const {timeDiff} = this.props.diffResult;
        this.index = index;
        if (timeDiff!.onTimelineClicked) {
            timeDiff!.onTimelineClicked(this.timestamps[index].clone());
        }
    }
}
