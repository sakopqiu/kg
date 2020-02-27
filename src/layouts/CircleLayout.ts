import {IPoint} from '../utils';
import _times from 'lodash/times';

const DEFAULT_MIN_SPACING = 150;

export interface ICircleCenterPoint extends IPoint {
    // 该flag来判断中心点是否是一个node
    isAnchorNode?: boolean;
}

export interface CircleLayoutConfig {
    centerPoint: ICircleCenterPoint;
    nodesNumber: number;
    /** 指圆周上相邻两个点中心之间的最短距离
     * 一般大于node的size防止overlap
     * default value 150
     */
    minSpacing?: number;
    // 定义了最小半径值， 不给值的话会自动通过minSpacing计算出来
    minRadius?: number;
}

class CircleLayout {
    public layout(config: CircleLayoutConfig): IPoint[] {
        if (config.nodesNumber <= 0) {
            return [];
        }

        const minSpacing = config.minSpacing || DEFAULT_MIN_SPACING;

        if (config.nodesNumber === 1) {
            if (!config.centerPoint.isAnchorNode) {
                // 如果只有一个节点且中心不是节点（anchor）, 那么这个唯一节点位置就是中心节点的位置
                return [{
                    x: config.centerPoint.x,
                    y: config.centerPoint.y,
                }];
            } else {
                // 直接画在anchor node 垂直上方
                const radius = Math.max(config.minRadius || 0, minSpacing);
                return [{
                    x: config.centerPoint.x,
                    y: config.centerPoint.y - radius,
                }];
            }
        }

        const evenTheta = 2 * Math.PI / config.nodesNumber;
        /**
         * 假设最终计算出来的radius是r
         * 计算公式 是 minSpacing^2 <= (r - r*cos(evenTheta))^2 + (r*sin(evenTheta))^2
         */
        const deltaCos = 1 - Math.cos(evenTheta);
        const deltaSin = Math.sin(evenTheta);
        const radius = Math.max(Math.sqrt(minSpacing * minSpacing / (deltaCos * deltaCos + deltaSin * deltaSin)), config.minRadius || 0);
        return _times(config.nodesNumber, (index: number) => {
            // 从270度开始也就是 永远保证最顶端有一个点
            const currentDegree = 3 * Math.PI / 2 + index * evenTheta;
            const deltaX = radius * Math.cos(currentDegree);
            const deltaY = radius * Math.sin(currentDegree);
            return {
                x: config.centerPoint.x + deltaX,
                y: config.centerPoint.y + deltaY,
            };
        });
    }
}

export const circleLayout = new CircleLayout();
