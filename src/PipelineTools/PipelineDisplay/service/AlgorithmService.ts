import {PathAlgos} from './CanvasDrawService';
import {filterCommonId, getTranslation, showMessage, try2ConvertToNumber} from '../../../utils';
import {action, observable} from 'mobx';
import {CyNodeData} from '../model/CyNode';
import {CommonService} from './CommonService';
import {CyEdgeCommon} from '../model/CyEdgeCommonData';

export class AlgorithmService extends CommonService {
    // 路径算法
    @observable public pathAlgo: PathAlgos | null;
    // 路径算法起点和终点
    @observable public pathAlgoStart: string | null;
    @observable public pathAlgoEnd: string | null;
    // A*算法，Dijkstra算法路径的长度
    @observable public currentPathLength: number = Infinity;

    // 权重域配置
    private weightConfig: Map<string, string | null>;

    get locale() {
        return this.drawService.canvasStore.locale;
    }

    reset() {
        this.setPathAlgo(null);
        this.setPathAlgoStart(null);
        this.setPathAlgoEnd(null);
        this.setCurrentPathLength(Infinity);
    }

    @action
    setPathAlgo(val: PathAlgos | null) {
        this.stateService.closeAllContextMenu();
        this.pathAlgo = val;
    }

    @action
    setPathAlgoStart(val: string | null) {
        this.pathAlgoStart = val;
    }

    @action
    setPathAlgoEnd(val: string | null) {
        this.pathAlgoEnd = val;
    }

    @action
    public setCurrentPathLength(val: number) {
        this.currentPathLength = val;
    }

    @action
    public async rankNodes() {
        this.stateService.setShowCanvasContextMenu(false);
        const cy = this.cy!;
        const pr: any = cy.elements().pageRank({});
        // pipeline里虽然还存在widget，但是可能被用户点击过滤掉了，这个时候不会显示出来
        for (const data of this.cyState.allCyNodesData) {
            // 强制使用pageRank计算出的节点大小
            data.manualSize = CyNodeData.AUTO_SIZE;
            try {
                data.rank = pr.rank(cy.filter(filterCommonId(data.id)));
            } catch {
                data.rank = CyNodeData.RANK_DEFAULT;
            }
        }
        this.resetPageRankRange(this.cyState.allCyNodesData);
    }

    // 重新设置当前画布上page rank计算出来的rank指标
    public resetPageRankRange(cyNodeData: CyNodeData[]) {
        const rankValues = cyNodeData.map((data) => data.rank);

        let rankMin = Infinity;
        let rankMax = -Infinity;
        rankValues.forEach((v: number) => {
            if (v < rankMin) {
                rankMin = v;
            }
            if (v > rankMax) {
                rankMax = v;
            }
        });

        if (rankValues.length === 0) {
            rankMin = 0.01;
            rankMax = 0.02;
        }
        if (rankMin === rankMax) {
            rankMax += 0.01; // avoid NaN inside cytoscape
        }
        this.cyState.MIN_RANK = rankMin;
        this.cyState.MAX_RANK = rankMax;
    }

    public setPathEnd() {
        this.stateService.setShowCanvasContextMenu(false);
        this.setPathAlgoEnd(this.stateService.canvasContextMenuNode!.id);
        // 取消所有路径选择
        this.cy.elements().unselect();
        this.findPath();
        this.setPathAlgoStart(null);
        this.setPathAlgoEnd(null);
    }

    public setWeightConfig(config: Map<string, string | null>) {
        this.weightConfig = config;
    }

    @action
    public findShortestPath(algorithm: PathAlgos, weighConfig: Map<string, string | null>, start: string, end: string) {
        this.setPathAlgo(algorithm);
        this.setPathAlgoStart(start);
        this.setPathAlgoEnd(end);
        this.setWeightConfig(weighConfig);
        this.cy!.elements().unselect();
        this.findPath();
        this.setPathAlgoStart(null);
        this.setPathAlgoEnd(null);
    }

    private pathTraversingConfig() {
        return {
            roots: '#' + this.pathAlgoStart,
            visit: (v: any) => {
                // example of finding desired node
                if (v.id() === this.pathAlgoEnd) {
                    return true;
                }
                return;
            },
            directed: true,
        };
    }

    private showPathTraverseResult(algoResult: any) {
        if (algoResult.found.length === 0) {
            showMessage(getTranslation(this.locale, 'Path does not exist'));
        } else {
            showMessage(getTranslation(this.locale, 'Path indication'));
            algoResult.path.select();
        }
    }

    private weightFunc = (e: any) => {
        const id = e.data().id;
        const edge: CyEdgeCommon = this.dataDriverProcessor.allVisibleEdges.find((e) => e.data.id === id)!;
        if ((this.weightConfig && !this.weightConfig.has(edge.data.name))) {
            return Infinity;
        }
        return try2ConvertToNumber(edge.data.weight);
    }

    private findPath() {
        const algo = this.pathAlgo;
        const cy = this.cy!;

        if (algo === PathAlgos.BFS) {
            const algoResult = cy.elements().breadthFirstSearch(this.pathTraversingConfig());
            this.showPathTraverseResult(algoResult);
        } else if (algo === PathAlgos.DFS) {
            const algoResult = cy.elements().depthFirstSearch(this.pathTraversingConfig());
            this.showPathTraverseResult(algoResult);
        } else if (algo === PathAlgos.DIJKSTRA) {
            // @ts-ignore: @types/cytoscape version does not match with cytoscape
            const dijkstra = cy.elements().dijkstra(('#' + this.pathAlgoStart) as any, this.weightFunc, true);
            const distance = dijkstra.distanceTo(cy.$id(this.pathAlgoEnd!));
            if (distance === Infinity) {
                showMessage(getTranslation(this.locale, 'Path does not exist'));
            } else {
                showMessage(getTranslation(this.locale, 'Path indication'));
                this.setCurrentPathLength(distance);
                dijkstra.pathTo(cy.$id(this.pathAlgoEnd!)).select();
            }
        } else if (algo === PathAlgos.ASTAR) {
            const result = cy.elements().aStar({
                root: '#' + this.pathAlgoStart,
                goal: '#' + this.pathAlgoEnd,
                weight: this.weightFunc,
                directed: true,
            }) as any;
            if (!result.found) {
                showMessage(getTranslation(this.locale, 'Path does not exist'));
            } else {
                showMessage(getTranslation(this.locale, 'Path indication'));
                result.path.select();
                this.setCurrentPathLength(result.distance);
            }
        }
    }
}
