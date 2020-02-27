import {IPoint} from '../../utils';
import {Polynomial} from 'kld-polynomial';
import _times from 'lodash/times';

export interface BezierIntersectionResult {
    pointRoots: IPoint[];
    tRoots: number[];
}

export const DEFAULT_CONTROL_POINT_STEP = 100;

export class Bezier {
    /**
     * 该方法获取bezier x，y或z关于t的函数表达式的系数
     * a: axis
     * 推倒过程：
     * B(t) = (1-t)^2*p0 + 2t(1-t)*p1 + t^2*p2
     * 假设 p0 = (x0, y0, z0)， 则有
     * x(t) = (1−t)^2*x0 + 2t(1−t)*x1 + t^2*x2
     * 右边表达式对t进行多项式整理得
     * x(t) = (x0 - 2*x1 + x2)t^2 + 2*(x1-x0)t + x0;
     * y, z以此类推
     * @param a0: x0, y0或者z0
     * @param a1: x1, y1或者z1
     * @param a2: x2, y2或者z2
     */
    static quadraticBezierToCoefficients(a0: number, a1: number, a2: number) {
        return [a0 - 2 * a1 + a2, 2 * (a1 - a0), a0];
    }

    /**
     *
     * @param a0
     * @param a1
     * @param a2
     * @param t
     */
    static quadraticBezierDerivativeAt(a0: number, a1: number, a2: number, t: number) {
        return 2 * (a0 - 2 * a1 + a2) * t + 2 * (a1 - a0);
    }

    /**
     * 该方法返回贝塞尔曲线单维度上方程表达式
     * @param a0: x0, y0或者z0
     * @param a1: x1, y1或者z1
     * @param a2: x2, y2或者z2
     * @param t: bezier 参数t
     */
    static quadraticBezierAt(a0: number, a1: number, a2: number, t: number) {
        return (1 - t) * (1 - t) * a0 + 2 * (1 - t) * t * a1 + t * t * a2;
    }

    static quadraticBezierAtPoint(p0: IPoint, p1: IPoint, p2: IPoint, t: number) {
        return {
            x: Bezier.quadraticBezierAt(p0.x, p1.x, p2.x, t),
            y: Bezier.quadraticBezierAt(p0.y, p1.y, p2.y, t),
            z: p0.z !== undefined && p1.z !== undefined && p2.z !== undefined ? Bezier.quadraticBezierAt(p0.z, p1.z, p2.z, t) : undefined,
        };
    }

    /**
     *
     * @param p0
     * @param p1
     * @param p2
     * @param t
     * @return 返回导数值向量
     */
    static quadraticBezierTangentVectorAt(p0: IPoint, p1: IPoint, p2: IPoint, t: number) {
        return [
            Bezier.quadraticBezierDerivativeAt(p0.x, p1.x, p2.x, t),
            Bezier.quadraticBezierDerivativeAt(p0.y, p1.y, p2.y, t),
        ];
    }

    /**
     * 该方法返回切点所在切线的angle
     * @param p0
     * @param p1
     * @param p2
     * @param t
     */
    static quadraticBezierTangentAngleAt(p0: IPoint, p1: IPoint, p2: IPoint, t: number) {
        const vector = Bezier.quadraticBezierTangentVectorAt(p0, p1, p2, t);
        return Math.atan2(vector[1], vector[0]) + Math.PI / 2;
    }

    /**
     * 该方法计算起始两个点之间有多条边情况下，返回对应控制点数组
     * 所有控制点位于过两点连线中点且垂直于该直线的直线上
     * @param p0
     * @param p1
     * @param edgesNumber
     * @param step
     * @return IPoint[]
     */
    static calculateQuadraticBezierSymmetricControlPoints
    (p0: IPoint, p1: IPoint, edgesNumber: number, step: number = DEFAULT_CONTROL_POINT_STEP) {
        const midPoint = {x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2};
        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) + Math.PI / 2;
        const isEven = edgesNumber % 2 === 0;
        const controlPts: IPoint[] = [];
        let length = edgesNumber;
        if (!isEven) {
            length--;
            controlPts.push(midPoint);
        }
        _times(length / 2, (index) => {
            const deltaX = Math.cos(angle) * step * (index + 1);
            const deltaY = Math.sin(angle) * step * (index + 1);
            const x0 = midPoint.x + deltaX;
            const y0 = midPoint.y + deltaY;
            controlPts.push({x: x0, y: y0});
            const x1 = midPoint.x - deltaX;
            const y1 = midPoint.y - deltaY;
            controlPts.push({x: x1, y: y1});
        });
        return controlPts;
    }
}

export class Intersection {
    /**
     * 该方法求解bezier曲线和圆的交点
     * quadratic bezier math equation
     * B(t) = (1-t)^2*p0 + 2t(1-t)*p1 + t^2*p2
     * 圆球方程为 (x-center.x)^2 + (y-center.y)^2 + (z-center.z)^2 = radius^2
     * @param p0： quadratic bezier 第一个控制点
     * @param p1: quadratic bezier 第二个控制点
     * @param p2： quadratic bezier 第三个控制点
     * @param center： 圆或球心
     * @param radius： 圆或球半径
     * @return array of t roots, number[]
     */
    static intersectQuadraticBezierWithCircle
    (p0: IPoint, p1: IPoint, p2: IPoint, center: IPoint, radius: number): BezierIntersectionResult {
        // xc0， xc1, xc2 系数
        const [xc2, xc1, xc0] = Bezier.quadraticBezierToCoefficients(p0.x, p1.x, p2.x);
        const [yc2, yc1, yc0] = Bezier.quadraticBezierToCoefficients(p0.y, p1.y, p2.y);
        // quadratic bezier关于t的多项式带入圆方程得
        // (xc2*t^2 + xc1*t + xc0 - center.x)^2 + (yc2*t^2 + yc1*t + yc0 - center.y)^2 = radius^2
        // c4, c3, c2, c1, c0 上面方程式展开所的系数

        const c4 = xc2 * xc2 + yc2 * yc2;
        const c3 = 2 * (xc2 * xc1 + yc2 * yc1);
        const c2 = (xc1 * xc1 + 2 * xc2 * xc0 - 2 * xc2 * center.x) + (yc1 * yc1 + 2 * yc2 * yc0 - 2 * yc2 * center.y);
        const c1 = 2 * (xc1 * xc0 - center.x * xc1 + yc1 * yc0 - center.y * yc1);
        const c0 = (xc0 - center.x) * (xc0 - center.x) + (yc0 - center.y) * (yc0 - center.y) - radius * radius;
        const roots = new Polynomial(
            c4,
            c3,
            c2,
            c1,
            c0,
        ).getRootsInInterval(0, 1) as number[] || [];
        return {
            pointRoots: roots.map(r => Bezier.quadraticBezierAtPoint(p0, p1, p2, r)),
            tRoots: roots,
        };
    }

    // handle 3d intersection
    static intersectQuadraticBezierWithSphere
    (p0: IPoint, p1: IPoint, p2: IPoint, center: IPoint, radius: number) {

    }

    /**
     * 直线方程： (lineP1.y - lineP0.y) * (x - lineP0.x) = (y - lineP0.y) * (lineP1.x - lineP0.x)
     * @param p0
     * @param p1
     * @param p2
     * @param lineP0
     * @param lineP1
     * @param isSegment 为true时，会剔除不在两点之间的root
     */
    static intersectQuadraticBezierWithLine
    (p0: IPoint, p1: IPoint, p2: IPoint, lineP0: IPoint, lineP1: IPoint, isSegment?: boolean): BezierIntersectionResult {
        // xc0， xc1, xc2 系数
        const [xc2, xc1, xc0] = Bezier.quadraticBezierToCoefficients(p0.x, p1.x, p2.x);
        const [yc2, yc1, yc0] = Bezier.quadraticBezierToCoefficients(p0.y, p1.y, p2.y);
        // 直线方程为
        // (lineP1.y - lineP0.y) * (x - lineP0.x) = (y - lineP0.y) * (lineP1.x - lineP0.x)
        // c2 : t^2 系数 c1：t 系数 c0
        const c2 = xc2 * (lineP1.y - lineP0.y) - yc2 * (lineP1.x - lineP0.x);
        const c1 = xc1 * (lineP1.y - lineP0.y) - yc1 * (lineP1.x - lineP0.x);
        const c0 = (lineP1.y - lineP0.y) * (xc0 - lineP0.x) - (lineP1.x - lineP0.x) * (yc0 - lineP0.y);
        const squareResult = c1 * c1 - 4 * c2 * c0;
        const result: BezierIntersectionResult = {
            pointRoots: [],
            tRoots: [],
        };
        if (squareResult < 0) {
            return result;
        }
        function validateRootAndAddToResult(root: number) {
            if (root >= 0 && root <= 1) {
                const point = Bezier.quadraticBezierAtPoint(p0, p1, p2, root);
                if (isSegment) {
                    // 用来判断点是否在线段上
                    const minX = Math.min(lineP0.x, lineP1.x);
                    const maxX = Math.max(lineP0.x, lineP1.x);
                    const minY = Math.min(lineP0.y, lineP1.y);
                    const maxY = Math.max(lineP0.y, lineP1.y);
                    if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
                        result.pointRoots.push(point);
                        result.tRoots.push(root);
                    }
                } else {
                    result.pointRoots.push(point);
                    result.tRoots.push(root);
                }
            }
        }
        if (c2 === 0) {
            const singleRoot = -c0 / c1;
            validateRootAndAddToResult(singleRoot);
        } else {
            const root1 = (-c1 + Math.sqrt(squareResult)) / (2 * c2);
            const root2 = (-c1 - Math.sqrt(squareResult)) / (2 * c2);
            validateRootAndAddToResult(root1);
            validateRootAndAddToResult(root2);
        }
        return result;
    }

    /**
     * 该方法求解bezier和矩形的交点
     * @param p0
     * @param p1
     * @param p2
     * @param r0
     * @param r1
     */
    static intersectQuadraticBezierWithRectangle(p0: IPoint, p1: IPoint, p2: IPoint, r0: IPoint, r1: IPoint) {
        const minX = Math.min(r0.x, r1.x);
        const maxX = Math.max(r0.x, r1.x);
        const minY = Math.min(r0.y, r1.y);
        const maxY = Math.max(r0.y, r1.y);
        const topLeft = {x: minX, y: minY};
        const topRight = {x: maxX, y: minY};
        const bottomRight = {x: maxX, y: maxY};
        const bottomLeft = {x: minX, y: maxY};

        const inter1 = Intersection.intersectQuadraticBezierWithLine(p0, p1, p2, topLeft, topRight, true);
        const inter2 = Intersection.intersectQuadraticBezierWithLine(p0, p1, p2, topRight, bottomRight, true);
        const inter3 = Intersection.intersectQuadraticBezierWithLine(p0, p1, p2, bottomRight, bottomLeft, true);
        const inter4 = Intersection.intersectQuadraticBezierWithLine(p0, p1, p2, bottomLeft, topLeft, true);

        const result: BezierIntersectionResult = {
            tRoots: [...inter1.tRoots, ...inter2.tRoots, ...inter3.tRoots, ...inter4.tRoots],
            pointRoots: [...inter1.pointRoots, ...inter2.pointRoots, ...inter3.pointRoots, ...inter4.pointRoots],
        };
        return result;
    }
}
