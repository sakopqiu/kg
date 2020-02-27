import {WidgetModel} from '../../models/WidgetModel';
import {DrawWhat, IEditModeContext, IPipeline, IPipelineLink, IWidget, SPECIAL_BLUEPRINT_KEY} from './interfaces';
import * as React from 'react';
import {observer} from 'mobx-react';
import {getTranslation, IPoint, Locales} from '../../utils';
import {
    BlueprintEdgeSchemaJson, BlueprintFieldSchemaJson,
    BlueprintJson,
    BlueprintType,
    BlueprintVertexSchemaJson,
    EdgeMap, KeyedBlueprintFieldSchemaJson,
    VertexMap,
} from '../common/interfaces';
import {EditModeCanvasStore} from './stores/EditModeCanvasStore';
import {PipelineLink} from '../../models/LinkModel';
import _get from 'lodash/get';

export function dmEntityTableCacheKey(entityId: string) {
    return 'DatamartEntityTable_' + entityId;
}

export function shortName(name: string) {
    if (name.length > 8) {
        return name.substring(0, 7) + '..';
    } else {
        return name;
    }
}

export function svgInputRelativeY() {
    return 0;
}

export function svgInputY(input: WidgetModel) {
    const baseY = input.y;
    return baseY + svgInputRelativeY();
}

export function svgOutputRelativeX(parentWidth: number) {
    return parentWidth / 2;
}

export function svgOutputRelativeY(parentHeight: number) {
    return parentHeight;
}

export function svgOutputY(parentHeight: number, output: WidgetModel) {
    return output.y + svgOutputRelativeY(parentHeight);
}

export function svgOutputX(parentWidth: number, output: WidgetModel) {
    return output.x + svgOutputRelativeX(parentWidth);
}

export function drawWhat(config: IEditModeContext) {
    if (config.circleConfig) {
        return DrawWhat.DRAW_CIRCLE;
    } else if (config.rectConfig) {
        return DrawWhat.DRAW_RECT;
    } else {
        throw new Error('No drawable type is found');
    }
}

export function circleCenter(d: IPoint, radius: number): IPoint {
    return {x: d.x + radius, y: d.y + radius};
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function isFieldEmpty(obj: any) {
    if (!obj) {
        return true;
    } else if (Array.isArray(obj) && obj.length === 0) {
        return true;
    } else if (obj instanceof String && obj.trim() === '') {
        return true;
    }
    return false;
}

const editCanvasConfig: React.Context<IEditModeContext> = React.createContext({
    portRadius: 3,
    locale: Locales.zh,
    renderType: 'svg',
    callbacks: {
        loadPipeline: async () => {
            throw new Error('not implemented');
        },
    },
    onTabCleared: () => {
    },
} as any);

export const EditModeCanvasConfigProvider = editCanvasConfig.Provider;
export const EditModeCanvasConfigConsumer = editCanvasConfig.Consumer;

export function editModeInjectCanvasConfig(DecoratedFunc: React.ComponentClass) {
    return class extends React.PureComponent {
        render() {
            return (
                <EditModeCanvasConfigConsumer>
                    {(config) => {
                        if ((this.props as any).forwardedRef) {
                            console.log((this.props as any).forwardedRef);
                        }
                        return <DecoratedFunc
                            ref={(this.props as any).forwardedRef} {...{canvasConfig: config}} {...this.props}/>;
                    }}
                </EditModeCanvasConfigConsumer>
            );
        }
    };
}

// 所有component都使用这个来注解
export function editCanvasInject(comp: React.ComponentClass) {
    return editModeInjectCanvasConfig(observer(comp as any)) as any;
}

/*
    注意！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
    为了帮助理解代码，这里对数据结构背景做一些介绍
    最早设计PipelineEditor组件时，设计了:
    IWidget=>WidgetModel
    IPipelineLink=>PipelineLink
    IPipeline=>EditModePipelineModel
    其中左侧I开头的都是接口，比如IWidget是一个普通的接口，用于定义React组件的参数。

    为了让接口更加面向对象（比如增加方法，增加mobx相关属性），设计了右侧的对应的实现类，如WidgetModel
    因此接口只有在数据序列化反序列化（数据被喂入和数据写出）时才使用，内部的逻辑基本都是依托于类的。

    后来Kg构建模块也需要使用这套工具，但是Kg定义了自己的api参数结构，下方以Json结尾的接口是KG API要求的结构。
    BlueprintJson, BlueprintVertexSchemaJson, BlueprintEdgeSchemaJson

    总结来说，以下的方法在做这样一件事，以IPipeline为例:
    // IOT,API到react组件之间不需要做任何改变，直接扔进去就行了
    IPipeline(kg端API接口）<-(通过API read from/update)-> IPipeline(PipelineEditor组件要求的接口）<-(转换为内部模型/输出成外部接口)-> EditModePipeline

    // KG构建，kg的API返回的数据需要经过转换，才能变成React组件需要的IPipeline
    BlueprintJson(kg端API接口）<-(通过API read from/update)-> IPipeline(PipelineEditor组件要求的接口）<-(转换为内部模型/输出成外部接口)-> EditModePipeline

    其他:
    除了kg外，，iot也是PipelineEditor的使用者，iot的api端为了减少复杂性，采用了PipelineEditor组件高度相似的接口设计。

 */

/*
 为了理解这些工具函数，确保阅读了注意！！！！！！！！！！中的文字，
 下方的代码是从sophonweb蓝图转换为PipelineEditor的数据结构IPipeline的工具函数
*/
export function blueprintToPipeLine(blueprint: BlueprintJson): IPipeline {
    return {
        pipeline_name: blueprint.name,
        params: {},
        pipeline_id: blueprint.id,
        pipeline_nodes: Object.values(blueprint.vertexMap || {}).map((v) => {
            return vertexToWidget(v);
        }),
        pipeline_links: Object.values(blueprint.edgeMap || {}).map((e) => edgeToLink(e, blueprint.vertexMap || {})),
        pipeline_ui: blueprint.pipelineUI,
        specialKey: blueprint.isTemplate ? SPECIAL_BLUEPRINT_KEY.TEMPLATE : SPECIAL_BLUEPRINT_KEY.NORMAL,
    };
}

export function readonlyBlueprintToPipeLine(blueprint: BlueprintJson, locale: Locales, isStellarDB: boolean): IPipeline {
    return {
        pipeline_name: blueprint.name,
        params: {},
        pipeline_id: blueprint.id,
        pipeline_nodes: Object.values(blueprint.vertexMap || {}).map((v) => readonlyVertexToWidget(v, locale, isStellarDB)),
        pipeline_links: Object.values(blueprint.edgeMap || {}).map(e => readonlyEdgeToLink(e, blueprint.vertexMap || {}, locale, isStellarDB)),
        pipeline_ui: blueprint.pipelineUI,
    };
}

export function vertexToWidget(vertex: BlueprintVertexSchemaJson): IWidget {
    const result: IWidget = {
        node_id: vertex.id,
        node_name: vertex.label,
        node_props: {
            idField: vertex.idField,
            nameField: vertex.nameField,
            fields: Object.values(vertex.fields),
            icon: vertex.icon,
            fromTemplate: vertex.fromTemplate,
            bpType: vertex.bpType || '',
            enableLocation: !!vertex.enableLocation, // 新加入的字段，为了兼容性，使用!!转化成bool
        },
        node_type: vertex.sourceId!,
        node_ui: {
            location_x: vertex.x,
            location_y: vertex.y,
        },
    };
    if (vertex.enableLocation) {
        if (!vertex.latField || !vertex.lngField) {
            throw new Error(`Vertex ${vertex.id} enabled geo location, but either lng or lat is missing`);
        }
        result.node_props.lngField = vertex.lngField;
        result.node_props.latField = vertex.latField;
    }
    return result;
}

// stellar db的只读配置
export function readonlyVertexToWidget(vertex: BlueprintVertexSchemaJson, locale: Locales, isStellarDB: boolean): IWidget {
    const result = vertexToWidget(vertex);
    if (!isStellarDB) {
        const idField = vertex.idField;
        const nameField = vertex.nameField;
        Object.assign(result.node_props, {
            [getTranslation(locale, 'Attribute Id Column')]: idField,
            [getTranslation(locale, 'Attribute Name Field')]: nameField,
        });
    }
    return result;
}

function getVertexIdFromName(name: string, vertexMap: VertexMap) {
    for (const [key, value] of Object.entries(vertexMap)) {
        if (key === name) {
            return value.id;
        }
    }
    throw new Error('vertex ' + name + ' is not found');
}

export function edgeToLink(edge: BlueprintEdgeSchemaJson, vertexMap: VertexMap): IPipelineLink {
    return {
        from_node_id: getVertexIdFromName(edge.srcVertexLabel, vertexMap),
        to_node_id: getVertexIdFromName(edge.dstVertexLabel, vertexMap),
        name: edge.label,
        link_id: edge.id,
        create_time: 0,
        params: {
            sourceId: edge.sourceId,
            srcIdField: edge.srcIdField,
            dstIdField: edge.dstIdField,
            fields: Object.values(edge.fields),
            fromTemplate: edge.fromTemplate,
            entityId: edge.metaData ? edge.metaData.entityId : '',
        },
    };
}

// stellar db的只读配置
export function readonlyEdgeToLink(edge: BlueprintEdgeSchemaJson, vertexMap: VertexMap, locale: Locales, isStellarDB: boolean): IPipelineLink {
    const result = edgeToLink(edge, vertexMap);
    if (!isStellarDB) {
        Object.assign(result.params, {
            srcIdField: edge.srcIdField.fieldNameInDF,
            dstIdField: edge.dstIdField.fieldNameInDF,
        });
    }
    return result;
}

/*
 为了理解这些工具函数，确保阅读了注意！！！！！！！！！！中的文字，
 下方的代码是从PipelineEditor的参数转换为sophonweb蓝图构建的工具函数
*/

// 下方是IPipeline到API

function toBlueprintFields(fields: BlueprintFieldSchemaJson[]) {
    const result: KeyedBlueprintFieldSchemaJson = {};
    fields.forEach(f => {
        result[f.fieldName] = f;
    });
    return result;
}

export function widgetToVertex(store: EditModeCanvasStore, node: IWidget): BlueprintVertexSchemaJson {
    const paramsMap = node.node_props;
    const icon = paramsMap['icon'];
    const nodeType = node.node_type;
    const result: BlueprintVertexSchemaJson = {
        id: node.node_id,
        label: node.node_name,
        sourceId: nodeType,
        nameField: paramsMap['nameField'],
        idField: paramsMap['idField'],
        fields: toBlueprintFields(paramsMap['fields'] || []),
        indexedFields: {},
        x: node.node_ui.location_x,
        y: node.node_ui.location_y,
        icon,
        bpType: paramsMap['bpType'],
        fromTemplate: !!paramsMap.fromTemplate,
        enableLocation: !!paramsMap.enableLocation,
        metaData: {
            unit: paramsMap['unit'] || [],
        },
    };
    if (paramsMap.enableLocation) {
        result.lngField = paramsMap['lngField'];
        result.latField = paramsMap['latField'];
    }
    return result;
}

export function linkToEdge(store: EditModeCanvasStore, link: IPipelineLink, srcVertexLabel: string, dstVertexLabel: string): BlueprintEdgeSchemaJson {
    const paramsMap = link.params;
    const sourceId = paramsMap['sourceId'];
    return {
        id: link.link_id,
        label: link.name,
        fields: toBlueprintFields(paramsMap['fields'] || []),
        srcVertexLabel,
        dstVertexLabel,
        indexedFields: {},
        sourceId,
        srcIdField: paramsMap['srcIdField'],
        dstIdField: paramsMap['dstIdField'],
        fromTemplate: !!link.params.fromTemplate,
        // 当前默认hardcode
        bpType: BlueprintType.DATASET,
        metaData: {
            entityId: paramsMap['entityId'] || '',
        },
    };
}

function getVertexNameById(id: string, vertexMap: VertexMap) {
    for (const [key, value] of Object.entries(vertexMap)) {
        if (value.id === id) {
            return key;
        }
    }
    throw new Error('Vertex not found for id ' + id);
}

export function pipelineToBlueprint(store: EditModeCanvasStore, pipeline: IPipeline): BlueprintJson {
    const blueprint = {
        id: pipeline.pipeline_id,
        name: pipeline.pipeline_name,
    } as BlueprintJson;
    const vertexMap: VertexMap = {};
    pipeline.pipeline_nodes.forEach(n => {
        vertexMap[n.node_name] = widgetToVertex(store, n);
    });

    const edgeMap: EdgeMap = {};
    pipeline.pipeline_links.forEach(e => {
        const srcName = getVertexNameById(e.from_node_id, vertexMap);
        const targetName = getVertexNameById(e.to_node_id, vertexMap);
        edgeMap[e.name] = linkToEdge(store, e, srcName, targetName);
    });

    blueprint.vertexMap = vertexMap;
    blueprint.edgeMap = edgeMap;
    blueprint.pipelineUI = pipeline.pipeline_ui;
    blueprint.isTemplate = pipeline.specialKey === SPECIAL_BLUEPRINT_KEY.TEMPLATE;
    return blueprint;
}

export function isNormalPipeline(pipeline: IPipeline) {
    return pipeline.specialKey === SPECIAL_BLUEPRINT_KEY.NORMAL;
}

export function isPipelineTemplate(pipeline: IPipeline) {
    return pipeline.specialKey === SPECIAL_BLUEPRINT_KEY.TEMPLATE;
}

export function leftPanelWidth(canvasConfig: IEditModeContext) {
    return (canvasConfig.uiConfig && canvasConfig.uiConfig.leftPanelWidth) || 200;
}

export function rightPanelWidth(canvasConfig: IEditModeContext) {
    return (canvasConfig.uiConfig && canvasConfig.uiConfig.rightPanelWidth) || 250;
}

export function leftPanelCollapsedWidth() {
    return 43;
}

export function rightCollapsedWidth() {
    return 18;
}

export function emptyFieldValue() {
    return {
        fieldName: '',
        fieldNameInDF: '',
        fieldType: '',
        isCustom: false,
        necessary: true,
        metaData: {},
    };
}

export function isDatamartObj(obj: WidgetModel | PipelineLink) {
    return obj.getValue('bpType') === BlueprintType.DATAMART;
}
