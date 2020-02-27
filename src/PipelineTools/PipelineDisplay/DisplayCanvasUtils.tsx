import * as React from 'react';
import {
    DisplayModePipelineSchema,
    EdgeSchema,
    IDisplayModeContext,
    ISimpleDisplayModeContext,
    IUniversalDisplayModeContext,
    NodeSchema,
} from './interfaces';
import {
    conditionToAlgebra,
    getTranslation,
    identityFunc,
    Locales,
    supportedTypes,
    try2ConvertToNumber,
} from '../../utils';
import {observer} from 'mobx-react';
import {ArangodbAlgorithmKeyFields, CommonElementData, SparkAlgorithmKeyFields, VertexDataJson} from './kg-interface';
import {CyEdge, CyEdgeData} from './model/CyEdge';
import {CyNode, CyNodeData} from './model/CyNode';
import {CyState} from './model/CyState';
import {StatsAnalysisDataset} from '../../components/bi/StatsAnalysis/StatsAnalysisInterface';
import {NodeStyleConfig} from './model/NodeStyleConfig';
import {EdgeStyleConfig} from './model/EdgeStyleConfig';

export const complexCanvasConfig: React.Context<IDisplayModeContext> = React.createContext({
    mainStore: null,
    locale: Locales.zh,
    onTabCleared: () => {
    },
    displayModeConfig: {
        cytoData: '',
        pipelineSchema: {
            edges: [],
            vertices: [],
        },
    },
    fieldAlias: identityFunc,
} as any);

export const ComplexCanvasConfigProvider = complexCanvasConfig.Provider;
export const ComplexCanvasConfigConsumer = complexCanvasConfig.Consumer;

export function complexInjectCanvasConfig(DecoratedFunc: React.ComponentClass) {
    return class extends React.PureComponent {
        render() {
            return (
                <ComplexCanvasConfigConsumer>
                    {(config) => {
                        if ((this.props as any).forwardedRef) {
                            console.log((this.props as any).forwardedRef);
                        }
                        return <DecoratedFunc
                            ref={(this.props as any).forwardedRef} {...{canvasConfig: config}} {...this.props}/>;
                    }}
                </ComplexCanvasConfigConsumer>
            );
        }
    };
}

// 所有component都使用这个来注解
export function complexInject(comp: React.ComponentClass) {
    return complexInjectCanvasConfig(observer(comp as any)) as any;
}

const simpleDisplayCanvasConfig: React.Context<ISimpleDisplayModeContext> = React.createContext({
    mainStore: null,
    locale: Locales.zh,
} as any);

const universalDisplayCanvasConfig: React.Context<IUniversalDisplayModeContext> = React.createContext({
    mainStore: null,
    locale: Locales.zh,
} as any);

export const SimpleDisplayModeCanvasConfigProvider = simpleDisplayCanvasConfig.Provider;
export const SimpleDisplayModeCanvasConfigConsumer = simpleDisplayCanvasConfig.Consumer;

export function simpleDisplayModeInjectCanvasConfig(DecoratedFunc: React.ComponentClass) {
    return class extends React.PureComponent {
        render() {
            return (
                <SimpleDisplayModeCanvasConfigConsumer>
                    {(config) => {
                        if ((this.props as any).forwardedRef) {
                            console.log((this.props as any).forwardedRef);
                        }
                        return <DecoratedFunc
                            ref={(this.props as any).forwardedRef} {...{canvasConfig: config}} {...this.props}/>;
                    }}
                </SimpleDisplayModeCanvasConfigConsumer>
            );
        }
    };
}

export const UniversalDisplayModeCanvasConfigProvider = universalDisplayCanvasConfig.Provider;
export const UniversalDisplayModeCanvasConfigConsumer = universalDisplayCanvasConfig.Consumer;

export function universalDisplayModeInjectCanvasConfig(DecoratedFunc: React.ComponentClass) {
    return class extends React.PureComponent {
        render() {
            return (
                <UniversalDisplayModeCanvasConfigConsumer>
                    {(config) => {
                        if ((this.props as any).forwardedRef) {
                            console.log((this.props as any).forwardedRef);
                        }
                        return <DecoratedFunc
                            ref={(this.props as any).forwardedRef} {...{canvasConfig: config}} {...this.props}/>;
                    }}
                </UniversalDisplayModeCanvasConfigConsumer>
            );
        }
    };
}

// 所有simple component都使用这个来注解
export function simpleInject(comp: React.ComponentClass) {
    return simpleDisplayModeInjectCanvasConfig(observer(comp as any)) as any;
}

export function universalInject(comp: React.ComponentClass) {
    return universalDisplayModeInjectCanvasConfig(observer(comp as any)) as any;
}

export function elementAttr(json: CommonElementData, attr: string, defaultVal: any) {
    const field = json.fieldsMap['__' + attr];
    if (!field) {
        return defaultVal;
    }
    return field.fieldValue || defaultVal;
}

export function vertexName(json: VertexDataJson) {
    return elementAttr(json, 'name', 'N/A');
}

function convertVertexOrEdge(locale: Locales, isNodeSchema: boolean, schema: EdgeSchema | NodeSchema, data: Array<CyEdge | CyNode>) {
    const columnDefinitions = schema.fields.map(f => {
        return {
            name: f.fieldName,
            type: f.fieldType as supportedTypes,
            skipAnalysis: f.fieldName === 'id',
        };
    });

    const rows = data
        .filter(e => {
            if (e instanceof CyNode) {
                return e.data.nodeType === schema.labelName;
            } else if (e instanceof CyEdge) {
                return e.data.name === schema.labelName;
            }
            return false;
        })
        .map(e => {
            const row: any[] = [];
            for (const c of columnDefinitions) {
                if (c.name === 'id') {
                    row.push(e.data.id);
                } else {
                    row.push(e.getValue(c.name));
                }
            }
            return row;
        });

    return {
        name: schema.labelName,
        type: getTranslation(locale, isNodeSchema ? 'Entity Type' : 'Relation Type'),
        rows,
        columnDefinitions,
    };
}

// 将当前图上状态转换成StatsAnalysis需要的格式
export function convertCurrentStateToDataset(locale: Locales, schema: DisplayModePipelineSchema, cyState: CyState): StatsAnalysisDataset[] {
    const result: StatsAnalysisDataset[] = [];
    for (const edgeSchema of schema.edges) {
        result.push(convertVertexOrEdge(locale, false, edgeSchema, cyState.cyEdges));
    }

    for (const nodeSchema of schema.vertices) {
        result.push(convertVertexOrEdge(locale, true, nodeSchema, cyState.cyNodes));
    }

    return result;
}

/**
 * 传入一个kg的某个元素的某个field的名字，如果是属于特殊属性的，给与特殊的翻译
 * @param {string} field
 * @param {Locales} locale
 * @returns {any}
 */
export function getKgFieldName(field: string, locale: Locales) {
    if (field.startsWith('tag_')) {
        return field.slice('tag_'.length) + ':' + getTranslation(locale, 'Tag');
    }
    if (field.startsWith('metric_')) {
        return field.slice('metric_'.length) + ':' + getTranslation(locale, 'Metric');
    }

    switch (field) {
        case '_id':
            return getTranslation(locale, 'System Id');
        case '__name':
            return getTranslation(locale, 'System Name');
        case ArangodbAlgorithmKeyFields.__algo_pr:
            return getTranslation(locale, 'Page Rank');
        case ArangodbAlgorithmKeyFields.__algo_wcc:
            return getTranslation(locale, 'Weakly Connected Components');
        case ArangodbAlgorithmKeyFields.__algo_scc:
            return getTranslation(locale, 'Strongly Connected Components');
        case ArangodbAlgorithmKeyFields.__algo_hits:
            return getTranslation(locale, 'Hyperlink-Induced Topic Search');
        case ArangodbAlgorithmKeyFields.__algo_ec:
            return getTranslation(locale, 'Closeness Centrality');
        case ArangodbAlgorithmKeyFields.__algo_lr:
            return getTranslation(locale, 'LineRank Betweenness Centrality');
        case ArangodbAlgorithmKeyFields.__algo_lpa:
            return getTranslation(locale, 'Label Propagation');
        case ArangodbAlgorithmKeyFields.__algo_slpa:
            return getTranslation(locale, 'Speaker-Listener Label Propagation');
        case SparkAlgorithmKeyFields.__spark_scc:
            return getTranslation(locale, 'Strongly Connected Components');
        case SparkAlgorithmKeyFields.__spark_sn:
            return getTranslation(locale, 'Star Net');
        case SparkAlgorithmKeyFields.__spark_pr:
            return getTranslation(locale, 'Page Rank');
        case SparkAlgorithmKeyFields.__spark_lpa:
            return getTranslation(locale, 'Label Propagation Algorithm');
        case SparkAlgorithmKeyFields.__spark_kcore:
            return getTranslation(locale, 'K Core');
        case SparkAlgorithmKeyFields.__spark_he:
            return getTranslation(locale, 'Heavy Edge Detection');
        case SparkAlgorithmKeyFields.__sophon_fr:
            return getTranslation(locale, 'Fraud Rank (Transwarp)');
        case SparkAlgorithmKeyFields.__spark_cc:
            return getTranslation(locale, 'Closeness Centrality');
        case SparkAlgorithmKeyFields.__spark_ic:
            return getTranslation(locale, 'Indegree Centrality');
        case SparkAlgorithmKeyFields.__spark_odc:
            return getTranslation(locale, 'Outdegree Centrality');
        case SparkAlgorithmKeyFields.__spark_dc:
            return getTranslation(locale, 'Degree Centrality');
        case SparkAlgorithmKeyFields.__spark_bowtie_in_degrees:
            return getTranslation(locale, 'Bowtie Indegrees');
        case SparkAlgorithmKeyFields.__spark_bowtie_out_degrees:
            return getTranslation(locale, 'Bowtie Outdegrees');
        default:
            if (/^__spark_bowtie_(in|out)_/.test(field)) {
                const suffix = field.substring(field.lastIndexOf('_'));
                if (field.startsWith('__spark_bowtie_in_')) {
                    return getTranslation(locale, 'Bowtie Incoming', {suffix});
                } else {
                    return getTranslation(locale, 'Bowtie Outgoing', {suffix});
                }
            }
            return field;
    }
}

type StyleConfig = NodeStyleConfig | EdgeStyleConfig;

// 是否能匹配任何用户设置的条件，如果是的话，返回该条件，不然返回null
export function canApplyAnyStyleRule(
    configs: StyleConfig[],
    data: CyEdgeData | CyNodeData) {

    // 倒叙过滤，最后一个设置优先胜出
    configs = [...configs].reverse();

    for (const styleConfig of  configs) {
        if (!styleConfig.label) {// 可能是空规则
            continue;
        }
        const label = styleConfig.label;
        const name = data instanceof CyEdgeData ? data.name : data.nodeType;
        if (label === name) {
            const attr = styleConfig.rule.attribute;
            const condition = conditionToAlgebra(styleConfig.rule.condition);
            let value = try2ConvertToNumber(styleConfig.rule.value);
            // 实际边上的属性
            let realValue = try2ConvertToNumber(data.getValue(attr));
            if (typeof value === 'string') {
                value = value.trim().toLowerCase();
            }
            if (typeof realValue === 'string') {
                realValue = realValue.trim().toLowerCase();
            }

            const evalExpression = `${JSON.stringify(realValue)} ${condition} ${JSON.stringify(value)}`;
            let result = false;
            try {
                result = eval(evalExpression);
            } catch (e) {
                console.error('eval出错,' + evalExpression);
                result = false;
            }
            if (result) {
                return styleConfig;
            }
        }
    }
    return null;
}
