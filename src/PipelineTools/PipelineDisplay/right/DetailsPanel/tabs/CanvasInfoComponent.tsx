import * as React from 'react';
import {StatsBar, StatsBarItem} from './stats/StatsBar';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import './index.scss';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../components/complex/ComplexModeCanvasComponent';
import {DisplayModeCanvasStore} from '../../../stores/DisplayModeCanvasStore';
import {complexInject} from '../../../DisplayCanvasUtils';
import {EdgeConfig} from '../../../model/EdgeConfig';
import {getTranslation} from '../../../../../utils';
import {NodeTypeConfig} from '../../../model/NodeTypeConfig';
import {SetupIcon} from '../../../../../icons/SetupIcon';
import {PathAlgos} from '../../../service/CanvasDrawService';

const MenuItem = Menu.Item;
const statsBarConfig = {
    maxBarSize: 180,
    barContainerWidth: 240,
};

const statsBarConfig2 = {
    maxBarSize: 150,
    barContainerWidth: 200,
};

export interface CanvasInfoComponentProps extends ComplexModeCanvasComponentProps {
    mainStore: DisplayModeCanvasStore;
}

@complexInject
export class CanvasInfoComponent extends ComplexModeCanvasComponent<CanvasInfoComponentProps> {

    get currentActiveStore() {
        return this.props.mainStore;
    }

    public renderEdgeTypeMenu(n: EdgeConfig) {
        return (
            <Menu>
                {n.show ?
                    <MenuItem onClick={() => {
                        this.visibilityService.setEdgeTypeVisibility(n, false);
                    }}>
                        {getTranslation(this.locale, 'Hide')}
                    </MenuItem>
                    :
                    <MenuItem onClick={() => {
                        this.visibilityService.setEdgeTypeVisibility(n, true);
                    }}>
                        {getTranslation(this.locale, 'Show')}
                    </MenuItem>
                }
            </Menu>
        );
    }

    public renderNodeTypeMenu(n: NodeTypeConfig) {
        return (
            <Menu>
                {n.show ?
                    <MenuItem onClick={() => {
                        this.service.visibilityService.setNodeTypeVisibility(n, false);
                    }}>
                        {getTranslation(this.locale, 'Hide')}
                    </MenuItem>
                    :
                    <MenuItem onClick={() => {
                        this.service.visibilityService.setNodeTypeVisibility(n, true);
                    }}>
                        {getTranslation(this.locale, 'Show')}
                    </MenuItem>
                }
            </Menu>
        );
    }

    public renderTypes() {
        const nodeCount = this.cyState.cyNodes.length;
        const edgeCount = this.cyState.cyEdges.length;
        const visibleNodeCount = this.cyState.visibleCyNodes.length;
        const visibleEdgeCount = this.cyState.visibleCyEdges.length;
        const items: StatsBarItem[] = [
            {
                name: getTranslation(this.locale, 'Entity'),
                size: nodeCount,
                translucent: visibleNodeCount === 0,
                statsBarItemOnclick: () => {
                    const visibleNodeCount = this.cyState.visibleCyNodes.length;
                    const ids = this.cyState.visibleCyNodes.map((n) => n.data.id);
                    if (visibleNodeCount > 0) {
                        this.selectionService.selectElementsByIds(ids);
                    }
                },
            },
            {
                name: getTranslation(this.locale, 'Relation'),
                size: edgeCount,
                translucent: visibleEdgeCount === 0,
                statsBarItemOnclick: () => {
                    const visibleEdges = this.cyState.cyEdges.filter((e) => !e.isHidden());
                    if (visibleEdges.length > 0) {
                        const ids = visibleEdges.map((e) => e.data.id);
                        this.selectionService.selectElementsByIds(ids);
                    }
                },
            },
        ];

        return (
            <div className='stats-bar-area' style={{marginTop: 17}} key={'types'}>
                <div className='stats-bar-area-title'>{getTranslation(this.locale, 'Type')}</div>
                <StatsBar
                    {...statsBarConfig}
                    items={items}
                />
            </div>
        );
    }

    public renderNodeTypes() {
        const widgetSchemas = this.service.canvasStore.displayModePipelineSchema.vertices;
        const items: StatsBarItem[] = [];

        for (const schema of widgetSchemas) {
            const nodeTypeConfig = this.cyState.nodeTypeConfigs.get(schema.labelName)!;

            // 初始化时可能还不存在
            if (nodeTypeConfig) {
                const nodes = this.cyState.cyNodes.filter((n) => n.data.nodeType === schema.labelName);
                const item = {
                    name: schema.labelName,
                    title: schema.labelName,
                    size: nodes.length,
                    elements: nodes,
                    noTooltip: true,
                    translucent: !nodeTypeConfig.show,
                    rightNode: (
                        <Popover overlayClassName='node-type-menu' trigger='click'
                                 placement={'bottomLeft'}
                                 content={this.renderNodeTypeMenu(nodeTypeConfig)}
                        >
                            <SetupIcon className='info-setting-icon'/>
                        </Popover>
                    ),
                    statsBarItemOnclick: () => {
                        const nodes = this.cyState.cyNodes.filter((n) => n.data.nodeType === schema.labelName);
                        if (nodes.length > 0 && nodeTypeConfig.show) {
                            this.selectionService.selectNodeType(schema.labelName);
                        }
                    },
                };
                items.push(item);
            }
        }

        return (
            <div className='stats-bar-area' key={'nodetypes'}>
                <div className='stats-bar-area-title'>
                    {getTranslation(this.locale, 'Concept Label')}
                </div>
                <StatsBar
                    {...statsBarConfig2}
                    items={items}
                />
            </div>
        );
    }

    renderEdgeTypes() {
        const items: StatsBarItem[] = [];
        const edgeSchemas = this.service.canvasStore.displayModePipelineSchema.edges;

        for (const schema of edgeSchemas) {
            const edgeConfig = this.cyState.edgeConfigs.get(schema.labelName)!;
            // 初始化时可能还不存在
            if (edgeConfig) {
                const edges = this.cyState.cyEdges.filter((e) => e.data.name === schema.labelName);
                items.push({
                    name: schema.labelName,
                    title: schema.labelName,
                    size: edges.length,
                    translucent: !edgeConfig.show,
                    rightNode: (
                        <Popover overlayClassName='node-type-menu' trigger='click'
                                 placement={'bottomLeft'}
                                 content={this.renderEdgeTypeMenu(edgeConfig)}
                        >
                            <SetupIcon className='info-setting-icon'/>
                        </Popover>
                    ),
                    statsBarItemOnclick: () => {
                        this.selectionService.selectEdgesByLabel(schema.labelName);
                    },
                });
            }
        }

        return (
            <div className='stats-bar-area' key={'edgetypes'}>
                <div className='stats-bar-area-title'>
                    {getTranslation(this.locale, 'Edge Type')}
                </div>
                <StatsBar
                    {...statsBarConfig2}
                    items={items}
                />
            </div>
        );
    }

    renderTags() {
        const tagsStats: Map<string, number> = new Map<string, number>();
        const cyNodes = this.cyState.visibleCyNodes;
        for (const cyNode of cyNodes) {
            for (const tag of cyNode.data.tags) {
                tagsStats.set(tag, (tagsStats.get(tag) || 0) + 1);
            }
        }

        if (tagsStats.size === 0) {
            return null;
        }
        const items: StatsBarItem[] = [];
        for (const tag of tagsStats.keys()) {
            items.push({
                name: tag,
                title: tag,
                size: tagsStats.get(tag)!,
            });
        }

        return (
            <div className='stats-bar-area' key={'tags'}>
                <div className='stats-bar-area-title'>
                    {getTranslation(this.locale, 'Tags')}
                </div>
                <StatsBar
                    {...statsBarConfig}
                    items={items}
                    onClick={(item: StatsBarItem) => {
                        this.selectionService.selectNodesByTag(item.name);
                    }}
                />
            </div>
        );
    }

    render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        const service = s.canvasDrawService;
        const algoService = service.algoService;

        const currentPathLength = algoService.pathAlgo === PathAlgos.ASTAR || algoService.pathAlgo === PathAlgos.DIJKSTRA ?
            <div className='stats-bar-area' key={'path length'}>
                <div className='value-label-name'>
                    <b>{getTranslation(this.locale, 'Current Path Length')}</b>: {algoService.currentPathLength}
                </div>
            </div> : null;

        return [this.renderTypes(), currentPathLength, this.renderNodeTypes(), this.renderEdgeTypes(), this.renderTags()];
    }
}
