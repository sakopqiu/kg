import * as React from 'react';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import _shuffle from 'lodash/shuffle';
import {CyNode, CyNodeData} from '../model/CyNode';
import {CyEdge} from '../model/CyEdge';
import {normalizeTimeString} from '../../../utils';
import {CyDescriptionContainerShape} from '../model/CyDescriptionContainer';
import _times from 'lodash/times';
// import uuid from 'uuid';
import {AddMixtureType, AddSinglePath} from '../model/CyState';
import {CanvasDrawService} from '../service/CanvasDrawService';
import {FindPathInnerPath} from '../kg-interface';

let eId = 1;
let cId = 1;

export interface IDevButtonsProps {
    service: CanvasDrawService;
}

const schools = ['FDU', 'SJTU', 'CMU', 'HKU', 'PKU'];
const ipPrefix = ['192.168.0', '172.168.1', '192.161.0', '192.252.3'];

export class DevButtons extends React.Component<IDevButtonsProps> {

    constructor(props: any) {
        super(props);
        this.addPerson = this.addPerson.bind(this);
        this.addPeople = this.addPeople.bind(this);
        this.addCompany = this.addCompany.bind(this);
        this.addEdge = this.addEdge.bind(this);
        this.addEdge2 = this.addEdge2.bind(this);
        this.addEdgeAround = this.addEdgeAround.bind(this);
        this.addDescriptionContainer = this.addDescriptionContainer.bind(this);
        this.addText = this.addText.bind(this);
        this.addLoopEdge = this.addLoopEdge.bind(this);
        this.addLoopEdge2 = this.addLoopEdge2.bind(this);
        // (window as any).ge = this.testAddEdge.bind(this);
    }

    get service() {
        return this.props.service;
    }

    get cyState() {
        return this.service.cyState;
    }

    get selectionService() {
        return this.service.selectionService;
    }

    testAddEdge(name: string, source: string, target: string) {
        const edge = new CyEdge(this.cyState);
        edge.data.source = source;
        edge.data.target = target;
        edge.data.name = name;
        edge.data.setValue('时间', this.mockTime());
        edge.data.genTestId();
        this.cyState.addNormalNodesEdges({
            nodes: [],
            edges: [edge],
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    get eleService() {
        return this.service!.elementService;
    }

    get helperService() {
        return this.service!.helperService;
    }

    get cy() {
        return this.service.cy;
    }

    private genPerson(givenId?: string) {
        const id = 'p' + (givenId || (eId++ % 80));
        if (this.cyState.cyNode(id)) {
            return this.cyState.cyNode(id)!;
        }
        const age = Math.round(Math.random() * 50 + 10);
        const personNode = new CyNode(this.cyState);
        personNode.data.id = id;
        personNode.data.name = id;
        personNode.data.nodeType = 'person';
        personNode.data.labelType = 'person';
        personNode.data.setValue('入学时间', this.mockDate());
        personNode.data.setValue('学校', schools[Math.floor(Math.random() * schools.length)]);
        const subnetAddress = Math.floor(Math.random() * 256);
        const ip = ipPrefix[Math.floor(Math.random() * ipPrefix.length)] + '.' + subnetAddress;
        // 为了测试社群分组的前缀功能
        personNode.data.setValue('ip', ip);
        const r = Math.floor(Math.random() * 2);
        personNode.data.setValue('sex', r === 0 ? 'Male' : 'Female');
        personNode.data.setValue('age', age);
        personNode.data.rank = CyNodeData.RANK_DEFAULT;
        return personNode;
    }

    private genCompany() {
        const id = cId++;
        const companyNode = new CyNode(this.cyState);
        companyNode.data.id = 'company' + id;
        companyNode.data.name = 'company' + id;
        companyNode.data.nodeType = 'company';
        companyNode.data.labelType = 'company';
        companyNode.data.setValue('type', 'international');
        companyNode.data.rank = CyNodeData.RANK_DEFAULT;
        return companyNode;
    }

    private async addPerson() {
        const personNode = this.genPerson();
        await this.cyState.addNormalNodesEdges({
            nodes: [personNode],
            edges: [],
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    private addDescriptionContainer() {
        const r = Math.floor(Math.random() * 3);
        let shape: CyDescriptionContainerShape = 'rectangle';
        if (r === 0) {
            shape = 'rectangle';
        } else if (r === 1) {
            shape = 'ellipse';
        } else {
            shape = 'diamond';
        }
        this.cyState.addDescriptionContainer(shape);
    }

    private addText() {
        this.cyState.addText();
    }

    private async addPeople() {
        const nodes = [];
        for (let i = 0; i < 20; i++) {
            nodes.push(this.genPerson());
        }
        this.cyState.addNormalNodesEdges({
            nodes,
            edges: [],
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    private async addCompany() {
        this.cyState.addNormalNodesEdges({
            nodes: [this.genCompany()],
            edges: [],
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    private mockTime() {
        const now = new Date();
        const beforeOrAfter = Math.floor((Math.random() * 2)) === 0 ? -1 : 1;
        const days = Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000;
        return +now + (beforeOrAfter * days);
    }

    private mockDate() {
        const now = new Date();
        const beforeOrAfter = Math.floor((Math.random() * 2)) === 0 ? -1 : 1;
        const days = Math.floor(Math.random() * 200) * 24 * 60 * 60 * 1000;
        const mockedTime = +now + (beforeOrAfter * days);
        return normalizeTimeString(mockedTime, 'days');
    }

    private async addLoopEdge() {
        const currentNodesData = this.helperService.selectedCyNodesData;
        if (currentNodesData && currentNodesData![0].nodeType === 'person') {
            const data = currentNodesData![0];
            const edge: CyEdge = new CyEdge(this.cyState);
            edge.data.source = data.id;
            edge.data.target = data.id;
            edge.data.name = '转账';

            edge.data.setValue('金额', (Math.random() * 1000).toFixed(2));
            edge.data.setValue('时间', this.mockTime());
            edge.data.genTestId();
            this.cyState.addNormalNodesEdges({
                nodes: [],
                edges: [edge],
                type: AddMixtureType.NORMAL,
                paths: [],
            });
        }
    }

    private async addLoopEdge2() {
        const currentNodesData = this.helperService.selectedCyNodesData;
        if (currentNodesData && currentNodesData![0].nodeType === 'person') {
            const data = currentNodesData![0];
            const edge: CyEdge = new CyEdge(this.cyState);
            edge.data.source = data.id;
            edge.data.target = data.id;
            edge.data.name = '存钱';

            edge.data.setValue('金额', (Math.random() * 10000).toFixed(2));
            edge.data.setValue('时间', this.mockTime());
            edge.data.setValue('location', ['shanghai', 'beijing', 'xiamen', 'quanzhou'][Math.floor(Math.random() * 4)]);
            edge.data.setValue('currency', ['dollar', 'rmb', 'pound'][Math.floor(Math.random() * 3)]);
            edge.data.genTestId();
            this.cyState.addNormalNodesEdges({
                nodes: [],
                edges: [edge],
                type: AddMixtureType.NORMAL,
                paths: [],
            });
        }
    }

    private addLoopEdge3 = () => {
        const currentNodesData = this.helperService.selectedCyNodesData;
        if (currentNodesData && currentNodesData![0].nodeType === 'person') {
            const data = currentNodesData![0];
            const edge: CyEdge = new CyEdge(this.cyState);
            edge.data.source = data.id;
            edge.data.target = data.id;
            edge.data.name = '服务';
            edge.data.genTestId();
            this.cyState.addNormalNodesEdges({
                nodes: [],
                edges: [edge],
                type: AddMixtureType.NORMAL,
                paths: [],
            });
        }
    }

    private async addEdge() {
        const node1 = this.genPerson();
        const node2 = this.genCompany();
        const edges = this.genEdges(node1.data.id, node2.data.id, '服务', Math.floor(Math.random() * 3) + 1);
        const edges2 = this.genEdges(node1.data.id, node2.data.id, '贡献', Math.floor(Math.random() * 3) + 1);
        this.cyState.addNormalNodesEdges({
            nodes: [node1, node2],
            edges: [...edges, ...edges2],
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    private async addEdge2() {
        const nodeList = [];
        let edgeList: CyEdge[] = [];
        for (let i = 0; i < 10; i++) {
            const node1 = this.genPerson();
            const node2 = this.genPerson();
            nodeList.push(node1);
            nodeList.push(node2);
            const edges = this.genEdges(node1.data.id, node2.data.id, '转账', Math.floor(Math.random() * 3) + 1);
            edgeList = edgeList.concat(edges);
        }
        this.cyState.addNormalNodesEdges({
            nodes: nodeList,
            edges: edgeList,
            type: AddMixtureType.NORMAL,
            paths: [],
        });
    }

    private genEdges(source: string, target: string, name: string, count: number = 1, swap = false) {
        return _times(count, (index: number) => {
            const edge: CyEdge = new CyEdge(this.cyState);
            if (!swap) {
                edge.data.source = source;
                edge.data.target = target;
            } else {
                edge.data.source = target;
                edge.data.target = source;
            }
            edge.data.name = name;
            if (name === '转账') {
                edge.data.setValue('金额', (Math.random() * 1000).toFixed(1));
            }

            edge.data.setValue('数值类型1', (Math.random() * 10).toFixed(1));
            edge.data.setValue('数值类型2', (Math.random() * 100).toFixed(1));
            edge.data.setValue('数值类型3', (Math.random() * 10000).toFixed(2));
            edge.data.setValue('时间', this.mockTime());
            edge.data.setValue('location', ['shanghai', 'beijing', 'xiamen', 'quanzhou'][Math.floor(Math.random() * 4)]);
            edge.data.genTestId();
            return edge;
        });
    }

    private genPath(firstNode: CyNode, secondNode: CyNode, pathCount: number, innerCount: number): AddSinglePath {
        const innerPaths: FindPathInnerPath[] = [];
        for (let i = 0; i < pathCount; i++) {
            // 当前这轮已经随机出来的中间节点，为了避免重复
            let tryCount = 0;
            const currentLoopIdSet: Set<string> = new Set<string>();
            const nodes: CyNode[] = [];
            const edges: CyEdge[] = [];
            while (nodes.length < innerCount) {
                const person = this.genPerson();
                const pid = person.data.id;
                if (currentLoopIdSet.has(pid) || firstNode.data.id === pid || secondNode.data.id === pid) {
                    tryCount++;
                    if (tryCount === 10) {
                        throw new Error('请提高genPerson的id分配数量');
                    }
                    continue;
                } else {
                    nodes.push(person);
                    currentLoopIdSet.add(pid);
                }
            }
            nodes.unshift(firstNode);
            nodes.push(secondNode);
            // 当前这条路径的多个节点已经生成，开始加入边
            for (let i = 0; i < nodes.length - 1; i++) {
                const swap = !!(Math.random() < 0.5); // 模拟边的两个方向
                const edgeCount = Math.floor(1 + Math.random() * 5);
                const edge = this.genEdges(nodes[i].data.id, nodes[i + 1].data.id, '转账', edgeCount, swap);
                edges.push(edge[0]);
            }
            innerPaths.push({
                // vertices: _shuffle(nodes),//模拟api的行为，api返回的node没有顺序
                vertices: nodes, // api乱序似乎已解决
                edges,
            });
        }
        return {
            source: firstNode,
            target: secondNode,
            innerPaths,
        };
    }

    private addPathBetweenSelectedNodes = async () => {
        const selectedNode = this.cy.nodes('.normal:selected');
        if (selectedNode.length === 2) {
            const n1 = selectedNode[0];
            const n2 = selectedNode[1];
            const firstNode = n1.id() < n2.id() ? n1 : n2;
            const secondNode = n1.id() < n2.id() ? n2 : n1;
            const pathCount = 18;
            // 1-3个
            const innerCount = (Math.floor(Math.random() * 2)) + 1;

            const cyNode1 = this.cyState.cyNode(firstNode.id())!;
            const cyNode2 = this.cyState.cyNode(secondNode.id())!;
            const singlePath = this.genPath(cyNode1, cyNode2, pathCount, innerCount);

            await this.cyState.addNormalNodesEdges({
                type: AddMixtureType.NORMAL,
                edges: [],
                nodes: [],
                paths: [
                    singlePath,
                ],
            });

        }
    }

    private addNormalNodePathMixture = async () => {
        const normalNodes: CyNode[] = [];
        for (let i = 0; i < 5; i++) {
            normalNodes.push(this.genPerson());
        }
        let count = 0;
        const paths: AddSinglePath[] = [];
        while (count < 10) {

            const random1 = Math.floor(Math.random() * normalNodes.length);
            const random2 = Math.floor(Math.random() * normalNodes.length);
            const node1 = normalNodes[random1];
            const node2 = normalNodes[random2];

            count++;
            paths.push(this.genPath(node1, node2, 2, 3));
        }
        await this.cyState.addNormalNodesEdges({
            type: AddMixtureType.NORMAL,
            edges: [],
            nodes: normalNodes,
            paths,
            replace: true,
        });
    }

    private async addEdgeAround() {
        const selectedNode = this.cy.nodes(':selected');
        const companyNodes = selectedNode.filter((n: any) => {
            return n.data().nodeType === 'company';
        });
        const anchorNodeIds = companyNodes.map((n: any) => n.id());
        const nodes = [];
        let edges: any[] = [];

        if (companyNodes.length === 0) {
            return;
        }

        for (const cNode of companyNodes) {
            const node1Data = cNode.data();
            const randomChildrenCount = Math.ceil(Math.random() * 30);
            for (let i = 0; i < randomChildrenCount; i++) {
                const node2 = this.genPerson();
                const temp = this.genEdges(node1Data.id, node2.data.id, '雇佣', Math.floor((Math.random() * 3) + 1));
                edges = edges.concat(temp);
                nodes.push(node2);
            }
            nodes.push(this.cyState.cyNode(cNode.id())!);
        }

        this.cyState.addNeighbors({
            nodes,
            edges,
            type: AddMixtureType.NEIGHBOR,
            anchorNodeIds,
        });
    }

    // @action
    // private setColor = () => {
    //     this.helperService.cySelectedEdges().forEach((e: any) => {
    //         const rIndex = Math.floor(Math.random() * SophonPipelineColors.length);
    //         const color = SophonPipelineColors[rIndex];
    //         const edge = this.cyState.cyEdge(e.id())!;
    //     })
    // };

    public render() {
        return <React.Fragment>
            <div className={'interaction'} onClick={() => {
                localStorage.setItem(this.service!.pipeline!.pipelineId, this.service.serializationService.serialize());
            }}>
                <Button size='small'>save</Button>
            </div>
            <div className={'interaction'} onClick={this.addText}>
                < Button size='small'>text</Button>
            </div>
            <div className={'interaction'} onClick={this.addDescriptionContainer}>
                < Button size='small'>d</Button>
            </div>

            <div className={'interaction'} onClick={this.addPerson}>
                <Button size='small'>p</Button>
            </div>

            <div className={'interaction'} onClick={this.addPeople}>
                <Button size='small'>ps</Button>
            </div>

            <div className={'interaction'} onClick={this.addCompany}>
                <Button size='small'>c</Button>
            </div>

            {/*添加一条普通边*/}
            <div className={'interaction'} onClick={this.addEdge}>
                <Button size='small'>e</Button>
            </div>
            <div className={'interaction'} onClick={this.addEdge2}>
                <Button size='small'>e2</Button>
            </div>
            {/*添加一条自己转账给自己的边*/}
            <div className={'interaction'} onClick={this.addLoopEdge}>
                <Button size='small'>self</Button>
            </div>
            {/*添加一条自己存钱给自己的边*/}
            <div className={'interaction'} onClick={this.addLoopEdge2}>
                <Button size='small'>self2</Button>
            </div>
            {/*添加一条自己服务给自己的边*/}
            <div className={'interaction'} onClick={this.addLoopEdge3}>
                <Button size='small'>self3</Button>
            </div>
            {/* 先选择一个公司节点，然后会为公司添加数条雇佣员工的边*/}
            <div className={'interaction'} onClick={this.addEdgeAround}>
                <Button size='small'>e a</Button>
            </div>
            {/*给选中边着随机色 */}
            {/*<div className={'interaction'} onClick={this.setColor}>*/}
            {/*<Button size='small'>set c</Button>*/}
            {/*</div>*/}
            <div className={'interaction'} onClick={this.addPathBetweenSelectedNodes}>
                <Button size='small'>path</Button>
            </div>
            <div className={'interaction'} onClick={this.addNormalNodePathMixture}>
                <Button size='small'>np mixture</Button>
            </div>

        </React.Fragment>;
    }
}
