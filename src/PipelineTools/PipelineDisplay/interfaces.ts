import {PathAlgos} from './service/CanvasDrawService';
import {ExtraHoverButtonConfig} from './components/complex/HoverButtons/HoverButtons';
import {FieldConfig} from './model/FieldConfig';
import {ICanvasContextCommon} from '../common/interfaces';
import {DisplayModeCanvasTabStore} from './stores/DisplayModeCanvasTabStore';
import {DisplayModePipelineModel} from '../../models/DisplayModePipelineModel';
import {SophonIconProps} from '../../icons/SophonIcon';
import * as React from 'react';
import {CyType} from './model/CyElement';
import {DisplayModeCanvasStore} from './stores/DisplayModeCanvasStore';
import {Locales} from '../../utils';
import {CyNodeData} from 'PipelineTools/PipelineDisplay/model/CyNode';
import {CyEdgeCommonData} from './model/CyEdgeCommonData';
import {CyEdgeData} from 'PipelineTools/PipelineDisplay/model/CyEdge';
import {CanvasStore} from '../common/CanvasStore';
import * as moment from 'moment';

export type AttributeConditionConstant = 'all' | '1M' | '3M' | '6M' | '1w' | '1y';
export const TimeFormat = 'YYYY-MM-DD HH:mm:ss';
export const SimpleTimeFormat = 'YYYY-MM-DD';

export interface SelectedTimeAttribute {
    relation: string;
    attribute: string;
    condition: AttributeConditionConstant | FromToPair;
}

export interface FromToPair {
    from: moment.Moment | null;
    to: moment.Moment | null;
}

// selection，unselection相关事件的debounce
export const SELECTION_DEBOUNCE = 10;

export interface ContextMenuOptions {
    desc: string;
    onClick: () => void;
}

export interface FieldSchema {
    fieldName: string;
    fieldType: string;
    editable?: boolean;
}

export interface CommonSchema {
    type: string;
    fields: FieldSchema[];
}

export interface EdgeSchema extends CommonSchema {
}

export interface NodeSchema extends CommonSchema {
    // icon: IconType;
}

export type IconType = 'default' | 'person' | 'account' | 'company' | ''
    | 'default-light' | 'person-light' | 'account-light' | 'company-light' | 'organization'
    | 'document' | 'industry' | 'location';

export interface IconConfig {
    category: IconType;
    icon: string; // 对应的image/kg/路径下icon的文件名
}

// 规定存在graph meta里的icon string format 是 IconType@@Icon, 第一个值是IconType，第二个值是image folders下icon的文件名, 不包含后缀
// icon文件名默认规定是数据放在category对应的folder下面
export const DEFAULT_ICON_CONFIG = {category: 'default', icon: '0'};

export type NodeShape = 'ellipse' | 'rectangle' | 'round-rectangle' | 'hexagon' | 'star' | 'octagon' | 'polygon';

export const NodeBorderColors: string[] = ['#35DC57', '#1A8879', '#EC991F', '#D3D3D3', 'white', '#E15959'];

export interface DisplayModePipelineSchema {
    edges: EdgeSchema[];
    vertices: NodeSchema[];
}

export interface FindNeighborQueryJsonBase {
    vertexIDs: string[];
    nodeTypes: string[];
    edgesFieldsLimitMap: EdgeFieldsFilterConfig;
    direction: EdgeDirection;
    commonOnly: boolean;
}

export interface FindPathQueryJsonBase {
    fromId: string;
    toId: string;
    nodeTypes: string[];
    edgeTypes: string[];
    step: number;
    bothDirection: boolean;
    onlyShortest: boolean;
}

export interface EdgeFieldsFilterConfig { [key: string]: FieldLimit[]; }

export interface SimpleFindNeighborQueryJsonBase {
    vertexIDs: string[];
    nodeTypes: string[];
    edgesFieldsLimitMap: EdgeFieldsFilterConfig;
    commonOnly: boolean;
    direction: EdgeDirection;
}

export type OnSimpleFindPathFunc = (fromId: string, toId: string) => void;

export type OnSimpleFindNeighborFunc = (config: SimpleFindNeighborQueryJsonBase) => void;

export interface FieldLimit {
    fieldName: string;
    from?: number | null;
    to?: number | null;
    openAt: AttributeConditionConstant | '';
}

export interface DisplayModeConfig {
    afterRendering?: (store: DisplayModeCanvasStore, firstTime: boolean) => void;
    wordTabConfigs?: (defaultConfigs: CategoryConfig[]) => CategoryConfig[];
    callbacks?: {
        noteChanged?: (nodeId: string, nodeType: string, noteValue: string) => Promise<void>;
        tagUpdated?: (nodes: Array<{ nodeId: string, nodeType: string }>, tags: string[]) => Promise<void>;
        onNeighborConfirm?: (config: FindNeighborQueryJsonBase) => void;
        onFindPathConfirm?: (config: FindPathQueryJsonBase) => void;
        onFindShortestPathConfirm?: (fromId: string, toId: string, algorithm: PathAlgos, weightConfig: Map<string, string | null>) => void;
        fieldChanged?: (id: string, elementType: string, field: FieldConfig) => void;
        fieldDeleted?: (id: string, elementType: string, field: FieldConfig) => void;
        fieldAdded?: (id: string, elementType: string, field: FieldConfig) => void;
        nodesMerged?: (targetId: string, nodeIds: string[]) => void;
        elementsDeleted?: (elements: Array<{ id: string, type: CyType }>) => void;
    };
    // 位于上方的hoverButtons
    hoverButtons?: ExtraHoverButtonConfig[];
    // 位于下方的hoverButtons
    lowerHoverButtons?: ExtraHoverButtonConfig[];
    canvasContextMenuOptions?: ContextMenuOptions[]; // 如果renderAsCanvas为true，可以传入此参数，右击时执行任务
    cytoData: string; // 如果renderAsCanvas为true，使用cytoscape格式的string展示图,这个string通过JSON.parse可以还原成cytoscape内部的表现格式
    pipelineSchema: DisplayModePipelineSchema; // 展现模式时，提供一个数据的schema， 无论是pipeline格式的数据还是cytoData，都需要这个
    hideTabTooltip?: boolean;
}

export interface IDisplayModeContext extends ICanvasContextCommon {
    onTabCleared: () => void;
    onBackClicked?: () => any;
    displayModeConfig: DisplayModeConfig;
    mainStore: DisplayModeCanvasTabStore;
    onTabSwitched?: (oldPipeline: DisplayModePipelineModel, newPipeline: DisplayModePipelineModel) => void;
    style?: React.CSSProperties;
    className?: string;
    devMode?: boolean;
}

export const EMPHASIS_POINT_SIZE = 120;

export interface ISpecialDisplayModeContext {
    locale: Locales;
    afterRendering?: (store: DisplayModeCanvasStore, isFirstTime: boolean) => void;
    pipelineSchema: DisplayModePipelineSchema; // 展现模式时，提供一个数据的schema， 无论是pipeline格式的数据还是cytoData，都需要这个
    mainStore: DisplayModeCanvasStore;
    style?: React.CSSProperties;
    className?: string;
    // 位于画布中央的额外的loading效果
    extraLoading?: React.ReactNode;
    extraContent?: React.ReactNode;
    // 顶部工具栏位于左侧的自定义组件
    statusArea?: (activeStore: CanvasStore | null) => React.ReactNode;
    // 顶部工具栏位于右侧的自定义组件
    topToolBarRightExtra?: RightExtraConfig[];
}

export interface IUniversalDisplayModeContext extends ISpecialDisplayModeContext {
}

export interface ISimpleDisplayModeContext extends ISpecialDisplayModeContext {
    callbacks?: {
        onNeighborConfirm?: OnSimpleFindNeighborFunc;
        onFindPathConfirm?: OnSimpleFindPathFunc;
    };
}

interface RightExtraConfig {
    icon: React.ComponentClass<SophonIconProps>;
    label: string;
    onClick: () => void;
}

export enum TimeFilterType {
    'HIDE' = 'HIDE', // 隐藏不符合要求的元素
    'TRANSPARENTIZE' = 'TRANSPARENTIZE', // 半透明化不符合要求的元素
}

// 当页面上元素大于1000个时，开始优化
export const PERFORMANCE_THRESHOLD = 1000;

export interface IIconConfig {
    title: string;
    hint?: string;
    icon: React.ComponentClass<SophonIconProps>;
    hideTriangle?: boolean;
    popover?: React.ReactNode;
    popoverOverlayClassName?: string;
    onClick: (e: any) => any;
    enabledFunc: () => boolean;
    id?: string;
}

export interface CategoryConfig {
    key: CategoryKey;
    title: string;
    sections: SectionConfig[];
}

export enum CategoryKey {
    style,
    analyze,
    home,
    selection,
    edit,
    inspect,
    layout,
    discovery,
    extraCategory1, // 预留两个作为扩充
    extraCategory2,
}

// extra留给扩充使用
export enum SectionKey {
    homeSection1,
    homeSection2,
    homeSection3,
    homeSectionExtra1,
    homeSectionExtra2,
    homeSectionExtra3,
    homeSectionExtra4,
    styleSection1,
    styleSection2,
    styleSection3,
    styleSection4,
    styleSectionExtra1,
    styleSectionExtra2,
    styleSectionExtra3,
    styleSectionExtra4,
    analysisSection1,
    analysisSection2,
    analysisSection3,
    analysisSectionExtra1,
    analysisSectionExtra2,
    analysisSectionExtra3,
    analysisSectionExtra4,
    selectionSection1,
    selectionSection2,
    selectionSection3,
    selectionSectionExtra1,
    selectionSectionExtra2,
    discoverySection1,
    discoverySectionSectionExtra1,
    discoverySectionSectionExtra2,
    editSection1,
    editSection2,
    editSectionExtra1,
    editSectionExtra2,
    inspectSection1,
    inspectSection2,
    inspectSection3,
    inspectSection4,
    inspectSectionExtra1,
    inspectSectionExtra2,
    layoutSection1,
    layoutSection2,
    layoutSection3,
    layoutSectionExtra1,
    layoutSectionExtra2,
}

export interface SectionConfig {
    key: SectionKey;
    title?: string;
    children: SectionChild[];
}

export enum SectionChildType {
    MINI,
    LARGE,
    CUSTOM,
}

export interface SectionChild {
    id?: string;
    type: SectionChildType;
    title?: string;
    hint?: string;
    hideTriangle?: boolean;
    popover?: React.ReactNode;
    popoverOverlayClassName?: string;
    enabledFunc?: () => boolean;
    icon?: React.ComponentClass<SophonIconProps>;
    onClick?: (e: any) => any;
    render?: () => React.ReactNode;
}

export type EdgeDirection = 'in' | 'out' | 'both';
export type FILTER_ID = string;

export interface ElementAttributeViewerProps {
    w: CyNodeData | CyEdgeCommonData;
    mainStore: DisplayModeCanvasStore;
    readonly: boolean;
    locale: Locales;
    fieldChanged?: (id: string, elementType: string, field: FieldConfig) => void;
    fieldDeleted?: (id: string, elementType: string, field: FieldConfig) => void;
    fieldAdded?: (id: string, elementType: string, field: FieldConfig) => void;
    elementsDeleted?: (elements: Array<{ id: string, type: CyType }>) => void;
    className?: string;
}

export interface ElementParamsBaseProps extends Pick<ElementAttributeViewerProps, Exclude<keyof ElementAttributeViewerProps, 'w' | 'elementsDeleted'>> {
}

export interface AddAttributeToolProps extends Pick<ElementAttributeViewerProps, Exclude<keyof ElementAttributeViewerProps, 'w' | 'fieldChanged' | 'fieldDeleted' | 'elementsDeleted'>> {
    elementData: CyNodeData | CyEdgeData;
    elementType: ElementType;
}

// todo!!! 把其他类的defaultClass也整合进来
export enum CyElementDefaultClass {
    FIND_PATH_BEACON = 'find_path_beacon',
    ADD_PATH_MOVER = 'add-path-mover',
    SELF_LOOP = 'self-loop',
    NORMAL_NODE = 'normal',
    NORMAL_EDGE = 'normal-edge',
    MERGED_EDGE = 'merged-edge',
    COLLAPSED_COMMUNITY = 'collapsed-community',
}

export enum ContainerId {
    'complex' = 'complex-cyto-container',
    'simple' = 'simple-cyto-container',
    'universal' = 'universal-cyto-container',
}

export type ElementType = 'vertex' | 'edge';
