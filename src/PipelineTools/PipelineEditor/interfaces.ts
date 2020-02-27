import {Locales} from '../../utils';
import {Terminus, WidgetModel} from '../../models/WidgetModel';
import {PipelineLink, TerminusLink} from '../../models/LinkModel';
import {EditModePipelineModel} from '../../models/EditModePipelineModel';
import {ICanvasContextCommon, IParamsContainer} from '../common/interfaces';
import {EditModeCanvasTabStore} from './stores/EditModeCanvasTabStore';
import {DDPState} from './cyto/DDP';
import {EditModeCanvasStore} from './stores/EditModeCanvasStore';
import * as React from 'react';
import {ITreeFileBase} from '../../stores/TreeStore/interface';
import {TreeFolder} from '../../stores/TreeStore/TreeStoreModels';
import {TreeFile} from '../../stores/TreeStore/TreeStoreModels';

export enum DrawWhat {
    'DRAW_CIRCLE' = 'circle',
    'DRAW_RECT' = 'rect',
}

export interface WidgetModelStatus {
    widget: WidgetModel;
    selected: boolean;
    hovered: boolean;
    width: number;
    height: number;
}

export interface IRectConfig {
    opWidth: number;
    opHeight: number;
    cornerRadius: number;
    title?: (widgeModeltStatus: WidgetModelStatus) => string;
    render?: (widgeModeltStatus: WidgetModelStatus) => React.ReactNode | 'default'; // 如果不传,默认显示widget的name
    // 如果返回值是default，或者不传入此参数，则已默认方式显示
}

export interface ICircleConfig {
    circleRadius: number; // 圆的半径
    outerRingWidth?: number;
}

export const USE_DEFAULT_BEHAVIOR = 'USE_DEFAULT_BEHAVIOR';

// 用于IPipeline的specialKey属性
export enum SPECIAL_BLUEPRINT_KEY {
    'TEMPLATE' = 'TEMPLATE',
    'NORMAL' = 'NORMAL',
}

export interface WidgetContextMenuConfig {
    render: (w: WidgetModel) => React.ReactNode;
    onClick: (w: WidgetModel) => any;
    key: string;
}

export interface LinkContextMenuConfig {
    render: (l: PipelineLink) => React.ReactNode;
    onClick: (l: PipelineLink) => boolean; // 返回true关闭菜单，false不关闭
    key: string;
}

export interface IEditModeContext<T extends EditModeCanvasStore = EditModeCanvasStore> extends ICanvasContextCommon {
    id: string; // 必须设置id
    mainStore: EditModeCanvasTabStore<T>;
    renderType: 'svg' | 'cyto';
    ignoreLinkValidation?: boolean; // 默认情况下连接也需要被验证，但在部分场合下连接不需要验证
    terminusEnabled?: boolean; // 是否启用输出节点
    hideDatasetPanel?: boolean;  // 是否隐藏左侧的选择框，默认不隐藏
    hideDetailsPanel?: boolean; // 隐藏右侧详细框
    panningType: 'scroll' | 'drag'; // 当renderType为svg时，移动viewport通过拖动滚动条亦或是拖动svg本身，scroll是默认值，因为iot在使用
    tabConfig?: {
        hideTab?: boolean;
        tabNonSwitchable?: boolean; // tab是否不可以切换，默认为可切换
    };
    uiConfig?: {
        leftPanelWidth?: number; // 左侧数据集树的宽度
        rightPanelWidth?: number; // 右侧详情Panel的宽度

        // 用户可以传入folderIcon和fileIcon，不然会使用默认值
        folderIcon?: (w: TreeFolder) => React.ReactNode;
        fileIcon?: (w: TreeFile) => React.ReactNode;
    };
    // 当widget对应的nodeType找不到时（可能被用户删除了）,对应的节点以及相关边，这个对象是用于警告的语句
    elementTruncateWarningMsg?: string;
    events?: {
        beforeSave?: (pipeline: EditModePipelineModel) => boolean;
        // 当左侧包含算子的文件夹被点击时用户可以采取的行为
        onTreeFolderClicked?: (folder: TreeFolder) => Promise<any>;
        onWidgetClick?: (widget: WidgetModel, e: React.MouseEvent<any>) => any;
        onWidgetDblClick?: (widget: WidgetModel, e: React.MouseEvent<any>) => any;
        beforeWidgetAdded?: (widget: WidgetModel) => any;
        onWidgetAdded?: (widget: WidgetModel) => any;
        onWidgetsCopied?: (newWidgets: WidgetModel[]) => any;
        onTabSwitched?: (oldPipeline: EditModePipelineModel, newPipeline: EditModePipelineModel) => void;
        // pipeline第一次被打开时调用
        onPipelineFirstTimeRendered?: (pipeline: EditModePipelineModel) => void;
        onTabCleared?: () => void;
        onNodeTypeChanged?: (widget: WidgetModel, oldVal: string, newVal: string) => any;
    };
    contextMenuConfigs?: {
        // 除了删除和复制之外用户额外传入的menuItem选项
        widgetContextMenuItems?: (widget: WidgetModel) => WidgetContextMenuConfig[];
        linkContextMenuItems?: (link: PipelineLink) => LinkContextMenuConfig[];
    };
    allowDuplication?: boolean; // TODO, 需要配合isCandidate的修改，两个节点间是否能有多条路径，默认为false
    portRadius?: number; // 端口的半径
    // 如果显示矩形的话，就定义这个
    rectConfig?: IRectConfig;
    // 如果要显示圆形的话，就定义这个，当前只有圆形算子支持多入口出口
    circleConfig?: ICircleConfig;
    locale: Locales;
    skipValidation?: boolean; // 如果是true，保存前不进行空检测
    singleton?: boolean; // true的话，所有同名的算子属性统一
    hideWidgetType?: boolean; // 是否隐藏widget的类型
    disableWidgetType?: boolean; // 是否禁止更改widget的类型
    typeName?: [string, string]; // 类型的名字和对应的hint
    hideLabel?: boolean; // 是否隐藏算子名字
    label?: (widgeModeltStatus: WidgetModelStatus) => [string, string]; // 显示提供算子名字的标签和对应的hint
    linkDescValue?: (link: PipelineLink) => [string, string]; // 显示提供连接名字的标签和hint
    widgetPanelTitle?: ((p: IPipeline) => React.ReactNode) | React.ReactNode; // 算子选择栏的名字,编辑模式下需要

    callbacks: {
        loadPipeline: (pipelineId: string) => Promise<IPipeline>;
        // 左侧的数据集定义支持树状结构，该方法需要返回改善第一层目录（包含目录和文件）
        // 第一个参数是pipeline，因此这个方法在loadPipeline之后，使用loadPipeline的返回值作为参数被调用
        loadInitialDatasets?: (pipeline: IPipeline) => Promise<ITreeFileBase[]>;

        // 自定义详细信息，如果返回USE_DEFAULT_BEHAVIOR还是使用的Panel
        customDetailPanel?(store: EditModeCanvasStore, ele: WidgetModel | PipelineLink | Terminus | TerminusLink | null):
            React.ReactNode;

        // 以下两个属性只在renderType为'cyto'时有效，DDPState生成cytoConfig对象
        // 修改下一次渲染的reconcile之后的state
        enhanceDDPState?: (store: EditModeCanvasStore, ddpState: DDPState) => DDPState;
        // 修改下一次渲染的cytoConfig,
        enhanceCytoConfig?: (store: EditModeCanvasStore, configObj: object) => any;
        // 如果提供了自定义的pipeline验证函数，就跳过框架本身提供的验证方法, 如果返回USE_DEFAULT_BEHAVIOR还是使用默认行为
        validatePipeline?: (self: EditModeCanvasStore) => boolean | 'USE_DEFAULT_BEHAVIOR';

        getWidgetParamDefs?: (store: EditModeCanvasStore, widget: WidgetModel) => IWidgetParamDef[];
        getLinkParamDefs?: (store: EditModeCanvasStore, link: PipelineLink) => ILinkParamDef[];
        // define whether showing the input circle or not
        // if not provided, the value is always true
        canBecomeInput?: (input: WidgetModel, output: WidgetModel) => boolean;
        hideWidgetOutput?: (widget: WidgetModel) => boolean;
        savePipeline?: (json: IPipeline) => void;
    };
}

export enum ValueStyle {
    'INPUT' = 'input',
    'TEXTAREA' = 'textarea',
    'SELECT' = 'selector',
    'MULTI_SELECT' = 'multi_selector',
    'FUNC' = 'func',
    'HIDDEN' = 'hidden',
}

export interface IPipeline {
    pipeline_name: string;
    params: IParamsContainer;
    pipeline_id: string;
    pipeline_nodes: IWidget[];
    pipeline_links: IPipelineLink[];
    pipeline_terminus_array?: IPipelineTerminus[];
    pipeline_terminus_links?: IPipelineTerminusLink[];
    create_time?: string | number;
    update_time?: string | number;
    readonly?: boolean;
    showWidgetContextMenu?: boolean;  // 显示菜单栏
    specialKey?: string;
    pipeline_ui: string; // 所有和流程相关的ui配置
}

export interface IPipelineLink {
    from_node_id: string;
    to_node_id: string;
    link_id: string;
    name: string;
    create_time: number;
    params: IParamsContainer;
}

export const TERMINUS_RADIUS = 7;
export const HOVERED_TERMINUS_RADIUS = 12;

export interface IPipelineTerminus {
    id: string;
    name: string;
    params: IParamsContainer;
}

export interface IPipelineTerminusLink {
    id: string;
    from_node_id: string;
    to_terminus_id: string;
    params: IParamsContainer;
}

export interface IWidgetLocation {
    location_x: number;
    location_y: number;
}

export interface IWidget {
    node_id: string;
    node_name: string;
    node_props: IParamsContainer;
    node_type: string;
    node_ui: IWidgetLocation;
}

// 以下是接口定义，用于连接外部系统
// 算子参数的定义
export interface IParamCommonDef {
    name?: string; // param的名字，no_label为true时不需要指定
    desc?: string; // param显示在界面上的字，no_label为true时不需要指定
    hint?: string; // 位于name右侧，用户悬浮上去可以看到提示信息
    key: string; // 全局唯一，用于react优化性能
    required?: boolean; // required会显示一个*,并且表达验证时会检查该field是否存在
    value_default?: any; // 默认值
    value_range?: string; // 值的范围
    value_style: ValueStyle; // 渲染成input，select，textarea还是自定义
    no_label?: boolean; // 当valueStyle为renderFunc时，renderFunc函数可以自己绘制label，此时需要设置这个属性为true，不然会绘制两遍label
    placeholder?: string; // input类型时的提示符
    renderFunc?: () => React.ReactNode;
}

export interface IWidgetParamDef extends IParamCommonDef {
    validateFunc?: () => boolean; // 如果不提供validateFunc，将使用组件自身的验证逻辑，即多每个required为true的ParamDef进行空值比较
}

export interface ILinkParamDef extends IParamCommonDef {
}
