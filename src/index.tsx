import React from 'react';
import ReactDom from 'react-dom';
import {SuperSimpleDisplayCanvas} from './PipelineTools/PipelineDisplay/components/common/SuperSimpleDisplayCanvas/SuperSimpleDisplayCanvas';
import {EdgeSchema, NodeSchema} from './PipelineTools/PipelineDisplay/interfaces';
import {CyNode} from './PipelineTools/PipelineDisplay/model/CyNode';
import {AddMixtureType, CyState} from './PipelineTools/PipelineDisplay/model/CyState';
import uuidv1 from 'uuid/v1';
import {DisplayModeCanvasStore} from './PipelineTools/PipelineDisplay/stores/DisplayModeCanvasStore';
import {CyEdge} from './PipelineTools/PipelineDisplay/model/CyEdge';

const relation: EdgeSchema = {
    labelName: '关系',
    fields: [],
};

const company: NodeSchema = {
    labelName: '公司',
    fields: [],
};

const managerType: NodeSchema = {
    labelName: '管理层类型',
    fields: [],
};

const manager: NodeSchema = {
    labelName: '管理层',
    fields: [],
};

const branchType: NodeSchema = {
    labelName: '分支机构类型',
    fields: [],
};

const branch: NodeSchema = {
    labelName: '分支机构',
    fields: [],
};

const juridicalType: NodeSchema = {
    labelName: '历史法人类型',
    fields: [],
};

const juridical: NodeSchema = {
    labelName: '历史法人',
    fields: [],
};

const schema = {
    edges: [relation],
    vertices: [
        company,
        juridicalType,
        juridical,
        managerType,
        manager,
        branchType,
        branch,
    ],
};

function createCyNode(cyState: CyState, type: string, label: string) {
    const node = new CyNode(cyState);
    node.data.id = uuidv1();
    node.data.name = label;
    node.data.nodeType = type;
    node.data.note = '';
    node.data.tags = [];
    return node;
}

function createCyEdge(cyState: CyState, type: string, src: string, target: string) {
    const edge = new CyEdge(cyState);
    edge.data.id = uuidv1();
    edge.data.name = type;
    edge.data.source = src;
    edge.data.target = target;
    return edge;
}

function afterRendering(mainStore: DisplayModeCanvasStore, isFirstName: boolean) {
    const cyState = mainStore.canvasDrawService.cyState;
    if (isFirstName) {
        const 南方中金 = createCyNode(cyState, '公司', '南方中金');
        const 分支机构 = createCyNode(cyState, '分支机构类型', '分支机构');
        const 历史法人 = createCyNode(cyState, '历史法人类型', '历史法人');

        const 南方中金长沙分公司 = createCyNode(cyState, '分支机构', '南方中金长沙分公司');
        const 南方中金北京分公司 = createCyNode(cyState, '分支机构', '南方中金北京分公司');

        const 高管 = createCyNode(cyState, '管理层类型', '高管');
        const 总经理 = createCyNode(cyState, '管理层类型', '总经理');
        const 董事 = createCyNode(cyState, '管理层类型', '董事');
        const 监事 = createCyNode(cyState, '管理层类型', '监事');

        const 郭韶山 = createCyNode(cyState, '管理层', '郭绍山');
        const 刘盼 = createCyNode(cyState, '管理层', '刘盼');
        const 赵秀芳 = createCyNode(cyState, '管理层', '赵秀芳');
        const 沈琴伟 = createCyNode(cyState, '管理层', '沈庆伟');
        const 沈孟辉 = createCyNode(cyState, '管理层', '沈梦辉');
        const 白凤龙 = createCyNode(cyState, '管理层', '白凤龙');
        const 姚辉 = createCyNode(cyState, '管理层', '姚辉');
        const 张绍萍 = createCyNode(cyState, '管理层', '张绍平');
        const 沈金浩 = createCyNode(cyState, '管理层', '沈金浩');

        const testNodeData: CyNode[] = [
            南方中金,
            分支机构,
            南方中金长沙分公司,
            南方中金北京分公司,
            高管,
            总经理,
            董事,
            监事,
            郭韶山,
            刘盼,
            赵秀芳,
            沈琴伟,
            沈孟辉,
            白凤龙,
            姚辉,
            张绍萍,
            沈金浩,
        ];
        const testEdgeData: CyEdge[] = [
            createCyEdge(cyState, '关系', 南方中金.data.id, 分支机构.data.id),
            createCyEdge(cyState, '关系', 分支机构.data.id, 南方中金长沙分公司.data.id),
            createCyEdge(cyState, '关系', 分支机构.data.id, 南方中金北京分公司.data.id),
            createCyEdge(cyState, '关系', 南方中金.data.id, 高管.data.id),
            createCyEdge(cyState, '关系', 高管.data.id, 总经理.data.id),
            createCyEdge(cyState, '关系', 高管.data.id, 董事.data.id),
            createCyEdge(cyState, '关系', 高管.data.id, 监事.data.id),

            createCyEdge(cyState, '关系', 总经理.data.id, 郭韶山.data.id),

            createCyEdge(cyState, '关系', 监事.data.id, 刘盼.data.id),
            createCyEdge(cyState, '关系', 监事.data.id, 赵秀芳.data.id),

            createCyEdge(cyState, '关系', 董事.data.id, 沈琴伟.data.id),
            createCyEdge(cyState, '关系', 董事.data.id, 沈孟辉.data.id),
            createCyEdge(cyState, '关系', 董事.data.id, 白凤龙.data.id),
            createCyEdge(cyState, '关系', 董事.data.id, 姚辉.data.id),
            createCyEdge(cyState, '关系', 董事.data.id, 张绍萍.data.id),

            createCyEdge(cyState, '关系', 南方中金.data.id, 历史法人.data.id),
            createCyEdge(cyState, '关系', 历史法人.data.id, 沈金浩.data.id),
            createCyEdge(cyState, '关系', 历史法人.data.id, 沈琴伟.data.id),

        ];
        cyState.addNormalNodesEdges({
            type: AddMixtureType.NORMAL,
            nodes: testNodeData,
            edges: testEdgeData,
            paths: [],
        });
    }
}

const style = {height: '100%', width: '100%'};

function App() {
    return (
        <SuperSimpleDisplayCanvas
            style={style}
            useCaseName={'123'}
            afterRendering={afterRendering}
            schema={schema}/>
    );
}

ReactDom.render(<App/>, document.getElementById('root'));
