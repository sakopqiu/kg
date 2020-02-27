import {CommonService} from './CommonService';
import {AddFindPathEntryConfig} from '../model/CyState';
import {distance, filterCommonId, IPoint, LAYOUT_ELEMENT_PADDING} from '../../../utils';
import {NODE_NORMAL_SIZE, TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';
import {cyAnimation} from '../../PipelineEditor/cyto/cyto-utils';
import {computed} from 'mobx';
import {CyNode, CyNodeData} from '../model/CyNode';
import {CyElementDefaultClass} from '../interfaces';
import {CyEdge} from '../model/CyEdge';
import uuidv1 from 'uuid/v1';
// import _min from 'lodash/min';
// import _max from 'lodash/max';

function animationDuration(p1: IPoint, p2: IPoint) {
    const dist = distance(p1, p2) * 1.2;
    const duration = Math.max(dist, 600);
    return duration;
}

export class AddFindPathEntryService extends CommonService {

    public get config() {
        return this.cyState.addElementConfig as AddFindPathEntryConfig;
    }

    private get sourceId() {
        return this.config.nodes[0].data.id;
    }

    private get targetId() {
        return this.config.nodes[this.config.nodes.length - 1].data.id;
    }

    // 只需要计算新节点的位置，如果路径中某个节点已经在图上了，就过滤他
    @computed
    private get newNodesInBetween() {
        return this.config.nodes.slice(1, this.config.nodes.length - 1)
            .filter((n) => {
                return this.cyState.newNodeStats.get(filterCommonId(n.data.id)) === false;
            });
    }

    // 已经存在在图上并且不是锚点的点
    @computed
    private get nonAnchorExistingNodes() {
        return this.config.nodes.slice(1, this.config.nodes.length - 1)
            .filter((n) => {
                return this.cyState.newNodeStats.get(filterCommonId(n.data.id)) === true;
            });
    }

    private get startNode() {
        return this.config.nodes[0];
    }

    private get targetNode() {
        if (this.sourceId === this.targetId) {
            return this.startNode;
        }
        return this.config.nodes[this.config.nodes.length - 1];
    }

    private get startNodeInCy() {
        return this.cy.filter(filterCommonId(this.sourceId));
    }

    private get targetNodeInCy() {
        return this.cy.filter(filterCommonId(this.targetId));
    }

    // 计算当前这次动画所有节点的位置,注意:如果外部传入的nodes的position，是不可相信的
    private calculateNodePosition() {
        const cy = this.cy;
        const newNodes = this.newNodesInBetween;
        const newNodeInBetweenCount = newNodes.length;

        // 当前canvas的extent
        const extent = cy.extent();

        // 1. 先计算起始终点的位置,如果所有图上元素都已经存在了，那么没必要调整start和target的位置了
        if (newNodeInBetweenCount === 0) {
            this.startNode.position = {...this.startNodeInCy.position()};
            this.targetNode.position = {...this.targetNodeInCy.position()};
        } else if (this.startNode === this.targetNode) {
            this.startNode.position = {...this.startNodeInCy.position()};
        } else if (this.startNode !== this.targetNode) {
            const startNodeRadius = this.startNodeInCy.width() / 2;
            const targetNodeRadius = this.targetNodeInCy.width() / 2;

            const totalLength = startNodeRadius * 2 + targetNodeRadius * 2
                + newNodeInBetweenCount * NODE_NORMAL_SIZE + LAYOUT_ELEMENT_PADDING * (newNodeInBetweenCount + 1);

            // 将起始节点的x设定为（extent.w - 总路径长度) /2 + 起始节点半径
            this.startNode.position = {
                x: (extent.w - totalLength) / 2 + startNodeRadius + extent.x1,
                y: extent.h / 2 + extent.y1,
            };

            this.targetNode.position = {
                x: (this.startNode.position.x - startNodeRadius) + totalLength - targetNodeRadius,
                y: extent.h / 2 + extent.y1,
            };

        }

        // 2. 再计算已经存在与图上节点的位置
        for (const n of this.nonAnchorExistingNodes) {
            n.position = {...cy.filter(filterCommonId(n.data.id)).position()};
        }

        // 3. 最后设置新节点的位置
        // 查看当前这条边是第几条被展开的，比如说a和b之间一共有9条边，那么前四条(Math.floor(count / 2)展开在a和b的上方，后五条(Math.floor(count / 2 + 1)
        // 展开在a和b的下方
        if (this.newNodesInBetween.length !== 0) {
            const data = this.config.beaconEdgeData;
            const restEdgesCount = data.assortedInnerPathMap.size;
            const currentExpandedEdgeIndex = (data.originalPathsCount - restEdgesCount) - 1;

            // 如果总量为奇数,eg:7，Math.floor(7 / 2) = 3,那么[0,1,2]走上面，[3,4,5,6]走下面
            // 如果总量为偶数,eg:8，Math.floor(8 / 2) = 4,那么[0,1,2,3]走上面，[4,5,6,7]走下面
            const half = data.originalPathsCount / 2;
            const upOrDown = currentExpandedEdgeIndex < Math.floor(half) ? 'up' : 'down';
            let displacement = 0;
            if (upOrDown === 'up') {
                displacement = -1 * (currentExpandedEdgeIndex + 1) * LAYOUT_ELEMENT_PADDING;
            } else {
                displacement = (currentExpandedEdgeIndex - half + 1) * LAYOUT_ELEMENT_PADDING;
            }

            const startNodeRadius = this.startNodeInCy.width() / 2;
            let i = 0;
            for (const newNode of newNodes) {
                newNode.position = {
                    x: this.startNode.position.x + (i + 1) * LAYOUT_ELEMENT_PADDING + i * NODE_NORMAL_SIZE + startNodeRadius,
                    y: displacement + this.startNode.position.y,
                };
                i++;
            }
        }
    }

    // 如果计算出来的节点的boundingRect大于当前cy.extent(),那么需要zoomOut
    // private async zoomOutIfNecessary() {
    //     const cy = this.cy;
    //     const nodesX = this.config.nodes.map((n) => n.position.x);
    //     const x1 = _min(nodesX)!, x2 = _max(nodesX)!;
    //     const range = x2 - x1;
    //     const extent = cy.extent().w;
    //
    //     if (range > extent) {
    //         const ratio = range / extent * 1.1;
    //         await cyAnimation(cy, {
    //             zoom: cy.zoom() / ratio,
    //             pan: cy.pan() / ratio,
    //             duration: animationDuration,
    //         });
    //     }
    // }

    // 如果有新节点的加入，可能需要调整表起点和终点的位置
    private async translateAnchorNodes() {
        if (this.startNode === this.targetNode) {
            return; // 如果是自环的话，不移动节点位置
        }
        if (this.newNodesInBetween.length !== 0) {

            const animationQueue: Array<Promise<any>> = [];
            if (this.startNode.position.x !== this.startNodeInCy.position().x ||
                this.startNode.position.y !== this.startNodeInCy.position().y) {
                const targetPosition = {
                    x: this.startNode.position.x,
                    y: this.startNode.position.y,
                };
                const startNodeAnimation = cyAnimation(this.startNodeInCy, {
                    position: targetPosition,
                    duration: animationDuration(this.startNodeInCy.position(), targetPosition),
                });
                animationQueue.push(startNodeAnimation);
            }

            if (this.startNode !== this.targetNode) {
                if (this.targetNode.position.x !== this.targetNodeInCy.position().x ||
                    this.targetNode.position.y !== this.targetNodeInCy.position().y) {
                    const targetPosition = {
                        x: this.targetNode.position.x,
                        y: this.targetNode.position.y,
                    };
                    const targetNodeAnimation = cyAnimation(this.targetNodeInCy, {
                        position: targetPosition,
                        duration: animationDuration(this.targetNodeInCy.position(), targetPosition),
                    });
                    animationQueue.push(targetNodeAnimation);
                }
            }
            await Promise.all(animationQueue);
        }
    }

    private async startAnimation() {

        const config = this.config;
        const cy = this.cy;
        const pathNodes = config.nodes;

        for (let i = 1; i < pathNodes.length; i++) {
            const currentId = pathNodes[i].data.id;
            const previousId = pathNodes[i - 1].data.id;
            const currentNode = this.cy.filter(filterCommonId(currentId));
            const previousNode = this.cy.filter(filterCommonId(previousId));

            // 当前节点的触发节点是前一个节点的位置，前一个节点如果事先就存在在图上就使用它的位置，不然使用nodesPositionInBetween中的位置
            const startPosition = pathNodes[i - 1].position;

            // 新加入的节点, 并且不是最后一个的话
            if (this.cyState.newNodeStats.get(filterCommonId(currentId)) === false && i !== pathNodes.length - 1) {
                cy.batch(() => {
                    // 目前支持双向了，所以两边都要显示
                    previousNode.edgesTo(currentNode).union(currentNode).removeClass(TEMP_HIDDEN_CLASS).remove().restore();
                    currentNode.edgesTo(previousNode).union(previousNode).removeClass(TEMP_HIDDEN_CLASS).remove().restore();
                    currentNode.position(startPosition);
                });
                const targetPosition = pathNodes[i].position;
                await cyAnimation(currentNode, {
                    position: targetPosition,
                    duration: animationDuration(currentNode.position(), targetPosition),
                });
            } else {
                // 如果已经存在在图上，那么以半透明的形式从上一个节点移动到当前位置
                // 半透明节点
                const tempNode = new CyNode(this.cyState);
                const currentNodeData = this.cyState.cyNode(currentId)!.data;
                tempNode.data = CyNodeData.fromJSON(currentNodeData, this.cyState, true);
                tempNode.data.id = 'add-path-temp' + tempNode.data.id;
                tempNode.addClass(CyElementDefaultClass.ADD_PATH_MOVER);
                tempNode.position = startPosition;
                tempNode.setSelected(true);
                tempNode.data.parent = '';

                // 半透明边
                const tempEdge = new CyEdge(this.cyState);
                tempEdge.data.id = 'add-path-temp-edge' + uuidv1();
                tempEdge.data.source = previousId;
                tempEdge.data.target = tempNode.data.id;
                tempEdge.data.name = '';
                tempEdge.setSelected(true);
                tempEdge.addClass(CyElementDefaultClass.ADD_PATH_MOVER);

                let cyTempNode: any = null;
                let cyTempEdge: any = null;
                cy.batch(() => {
                    cyTempNode = cy.add(tempNode.cytoFormat());
                    cyTempEdge = cy.add(tempEdge.cytoFormat());
                });

                const targetPosition = currentNode.position();
                await cyAnimation(cyTempNode, {
                    position: {...targetPosition},
                    duration: animationDuration(cyTempNode.position(), targetPosition),
                });
                cy.batch(() => {
                    cyTempEdge!.remove();
                    cyTempNode!.remove();
                    // 目前支持双向了，所以两边都要显示
                    previousNode.edgesTo(currentNode).union(currentNode).removeClass(TEMP_HIDDEN_CLASS).remove().restore();
                    currentNode.edgesTo(previousNode).union(previousNode).removeClass(TEMP_HIDDEN_CLASS).remove().restore();
                });
            }
        }
    }

    // 加入一条path entry需要做很多复杂的操作
    public async exec() {
        return new Promise(async (resolve) => {
            this.calculateNodePosition();
            // await this.zoomOutIfNecessary();
            await this.translateAnchorNodes();
            await this.startAnimation();
            // 获取当前这次的渲染框架，和当前的extent.w对比，如果过长，需要进行缩放
            // const boundingRect = this.getRenderBoundingRect();
            resolve();
        });
    }
}
