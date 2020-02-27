import {CommonService} from './CommonService';
import {TEMP_HIDDEN_CLASS} from '../../common/cytoscapeCommonStyle';
import {filterCommonId, IPoint} from '../../../utils';
import {CyType} from '../model/CyElement';
import {FindNeighborConfig} from '../model/CyState';
import {FILTER_ID} from '../interfaces';

export class AddNeighborService extends CommonService {
    public async exec() {
        const config = this.cyState.addElementConfig! as FindNeighborConfig;
        if (config.anchorNodeIds!.length < 1) {
            throw new Error('寻找邻居至少需要设置一个锚点');
            return;
        }
        const allNodeStats = this.cyState.newNodeStats;
        const allEdgeStats = this.cyState.newEdgeStats;
        const allNodeIds: string[] = Array.from(allNodeStats.keys());
        const allEdgeIds: string[] = Array.from(allEdgeStats.keys());

        const allNewEdgeIds: Set<FILTER_ID> = new Set<FILTER_ID>();
        const allNewNodeIds: Set<FILTER_ID> = new Set<FILTER_ID>();
        allNodeIds.forEach((id) => {
            if (allNodeStats.get(id) === false) {
                allNewNodeIds.add(filterCommonId(id));
            }
        });
        allEdgeIds.forEach((id) => {
            if (allEdgeStats.get(id) === false) {
                allNewEdgeIds.add(filterCommonId(id));
            }
        });

        const promises: Array<Promise<void>> = [];

        this.cy.batch(() => {
            for (const anchorId of config.anchorNodeIds!) {
                const fid = filterCommonId(anchorId);
                // 如果锚点是新加入的话，对他进行居中
                if (allNewNodeIds.has(fid)) {
                    const anchor = this.cy.filter(fid);
                    this.cy.center(anchor);
                }
            }
        });

        // 如果一个子节点属于多个anchor，那么动画可能被播放多次，这个变量存在是为了控制这一个行为
        const animatedNodeIds: Set<string> = new Set<string>();
        this.cy.batch(() => {
            for (const anchorId of config.anchorNodeIds!) {
                const anchor = this.cy.filter(filterCommonId(anchorId));

                // 该对象只包含当前锚点的所有新邻居（老邻居被过滤）
                const neighborhood = anchor.neighborhood();

                const newNodes = neighborhood.filter((f: any) => {
                    const fid = filterCommonId(f.id());
                    if (f.data().cyType === CyType.NODE) {
                        return allNewNodeIds.has(fid);
                    }
                    return false;
                });

                // 全部挪到对应的anchor的位置，
                const anchorPosition = {...anchor.position()};
                newNodes.position({...anchorPosition});
                // 将锚点的所有邻居全部显示出来
                neighborhood.removeClass(TEMP_HIDDEN_CLASS).remove().restore();

                // 最后画动画
                promises.push(this.animateToNewPosition(anchorPosition, newNodes, animatedNodeIds));
            }
        });

        await Promise.all(promises);
    }

    private async animateToNewPosition(anchorNodePosition: IPoint, newNodes: any, animatedNodeIds: Set<string>) {
        const newNodesCount = newNodes.length;
        if (newNodesCount === 0) {
            return;
        }
        const positions = this.elementService.newElementsGridPosition(newNodesCount, 40,
            anchorNodePosition);

        let animationCompletionCount = 0;
        const duration = Math.max(Math.min(newNodes.length / 30 * 1000, 3000), 400);

        return new Promise<void>((resolve) => {

            function checkFinished() {
                if (animationCompletionCount === newNodesCount) {
                    resolve();
                }
            }

            newNodes.forEach((n: any, i: number) => {
                // 不重复播放某个节点的动画
                if (animatedNodeIds.has(n.id())) {
                    animationCompletionCount++;
                    checkFinished();
                    return;
                } else {
                    animatedNodeIds.add(n.id());
                    n.animate({
                            position: {...positions[i]},
                        },
                        {
                            duration,
                            complete: () => {
                                // 所有动画全部结束后才返回
                                animationCompletionCount++;
                                checkFinished();
                            },
                        });
                }
            });
        });
    }

}
