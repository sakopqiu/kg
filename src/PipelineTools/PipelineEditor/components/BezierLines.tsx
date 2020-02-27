import * as React from 'react';
import {circleCenter, editCanvasInject} from '../EditCanvasUtils';
import {PairedLink, PipelineLink} from '../../../models/LinkModel';
import Line from './Line';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from './EditModeCanvasComponent';
import {IPoint} from '../../../utils';

export interface IBezierLinesProps extends IEditModeCanvasComponentProps {
    style?: React.CSSProperties;
    link: PairedLink;
}

export interface IArcInfo {
    d: string;
    dreverse: string;
    left2right: boolean;
}

export interface IdInfo extends IArcInfo {
}

@editCanvasInject
export default class BezierLines extends EditModeCanvasComponent<IBezierLinesProps> {

    constructor(props: IBezierLinesProps) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
    }

    get radius() {
        return this.canvasConfig.circleConfig!.circleRadius;
    }

    get link(): PairedLink {
        return this.props.link;
    }

    private onMouseDown(e: React.MouseEvent<any>, link: PipelineLink) {
        const s = this.currentActiveStore!;
        e.stopPropagation();
        s.clearAllSelections();

        if (e.button === 0) {
            s.setCurrentLink(link);
        } else if (e.button === 2) {
            s.setShowLinkContextMenu(true);
            s.setCurrentLink(link);
            s.setClickEventPosition({x: e.clientX, y: e.clientY});
        }
    }

    /**
     * @function
     * @param {Node} p1 节点
     * @param {Node} p2 节点
     * @param {number} r1 节点p1的r
     * @param {number} r2 节点p2的r
     * @param {Array<boolean>} directionArr 边的方向组成的数组
     */
    private getPath(p1: IPoint, p2: IPoint, r1: number, r2: number, directionArr: boolean[]): IArcInfo[] {
        const returnArr: IArcInfo[] = [];
        const count = directionArr.length;
        const midNum = (count - 1) / 2; // 中位数

        // direction:方向 true : p1->p2, false: p2->p1
        directionArr.forEach((direction: boolean, index: number) => {
            let delta = 0; // 偏移量
            if (count % 2 === 0) {// 中位数会是小数
                delta = Math.round(Math.abs(midNum - index) + 0.5);
            } else {// 中位数会是整数
                delta = Math.abs(midNum - index);
            }
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let mark = 1; // 画圆弧时的方向,1：顺时针,-1：逆时针
            let directionFlag = 0; // 最终path所需的参数

            // const gamma = Math.atan2(dy, dx);
            let sr = 0; // 画线时起点r
            let tr = 0; // 画线时终点r
            let sx = 0; // 画线时起点x
            let sy = 0; // 画线时起点y
            let tx = 0; // 画线时终点x
            let ty = 0; // 画线时终点y
            let dsx = 0;
            let dsy = 0;
            let dtx = 0;
            let dty = 0;
            const markerWidth = 0; // 箭头宽度

            if (direction) {
                dx = p2.x - p1.x;
                dy = p2.y - p1.y;
                dsx = p1.x;
                dsy = p1.y;
                dtx = p2.x;
                dty = p2.y;
                sr = r1;
                tr = r2;
                if (index - midNum > 0) {
                    mark = -1; // p1->p2方向并且index比midNum大,逆时针
                } else {
                    mark = 1;
                    directionFlag = 1;
                }
            } else {
                dx = p1.x - p2.x;
                dy = p1.y - p2.y;
                dsx = p2.x;
                dsy = p2.y;
                dtx = p1.x;
                dty = p1.y;
                sr = r2;
                tr = r1;
                if (index - midNum > 0) {
                    mark = 1; // p2->p1方向并且index比midNum大,顺时针
                    directionFlag = 1;
                } else {
                    mark = -1;
                }
            }

            if (delta === 0) {
                // sx = dsx + (Math.cos(gamma) * sr);
                // sy = dsy + (Math.sin(gamma) * sr);
                // tx = dtx - (Math.cos(gamma) * (tr + markerWidth));
                // ty = dty - (Math.sin(gamma) * (tr + markerWidth));
                // returnArr.push(`M${sx},${sy} L${tx},${ty}`);
                if (direction) {
                    returnArr.push(
                        {
                            d: `M${p1.x},${p1.y} L${p2.x},${p2.y}`,
                            dreverse: `M${p2.x},${p2.y} L${p1.x},${p1.y}`,
                            left2right: p1.x < p2.x,
                        },
                    );
                } else {
                    returnArr.push(
                        {
                            d: `M${p2.x},${p2.y} L${p1.x},${p1.y}`,
                            dreverse: `M${p1.x},${p1.y} L${p2.x},${p2.y}`,
                            left2right: p2.x < p1.x,
                        },
                    );
                }
            } else {
                // if (delta > 5) {
                //     delta = 5;
                // }
                const ds = Math.sqrt(dx * dx + dy * dy);
                // 大圆弧度
                const theta = Math.PI * 0.2 * delta;
                const dr = ds * 0.5 / Math.sin(theta / 2);
                // 大圆圆心和两个节点圆心连接线的斜率
                let alpha = Math.atan(-dx / dy);
                if (dy > 0) {
                    alpha = Math.PI + alpha;
                }
                // 连线中点坐标,设两节点中点为O:(Ox,Oy)
                const Ox = (dsx + dtx) / 2;
                const Oy = (dsy + dty) / 2;

                // 设大圆圆心为C:(xr,yr)
                const distanceOC = dr * Math.cos(theta / 2);
                const xr = Ox + mark * distanceOC * Math.cos(alpha);
                const yr = Oy + mark * distanceOC * Math.sin(alpha);
                // 小圆半径对应大圆的弧度
                const betaT = -mark * 2 * Math.asin((tr + markerWidth) / dr * 0.5);
                const betaS = mark * 2 * Math.asin(sr / dr * 0.5);
                sx = (dsx - xr) * Math.cos(betaS) - (dsy - yr) * Math.sin(betaS) + xr;
                sy = (dsy - yr) * Math.cos(betaS) + (dsx - xr) * Math.sin(betaS) + yr;
                tx = (dtx - xr) * Math.cos(betaT) - (dty - yr) * Math.sin(betaT) + xr;
                ty = (dty - yr) * Math.cos(betaT) + (dtx - xr) * Math.sin(betaT) + yr;
                returnArr.push({
                    d: `M${sx},${sy}A${dr},${dr} 0 0,${directionFlag} ${tx},${ty}`,
                    dreverse: `M${tx},${ty}A${dr},${dr} 0 0,${directionFlag === 0 ? 1 : 0} ${sx},${sy}`,
                    left2right: sx < tx,
                });
            }
        });
        return returnArr;
    }

    public render() {
        // 提取这些变量都是为了提高性能
        const s = this.currentActiveStore!;
        const pairedLink = this.props.link;
        const node1 = pairedLink.node1;
        const node2 = pairedLink.node2;
        const normalLinks = pairedLink.links;
        const totalLinksCount = normalLinks.length;
        const storeSelectedLink = s.currentLink;
        const hasMiddle = totalLinksCount % 2 === 1;
        const halfIndex = Math.floor(totalLinksCount / 2) + 1;
        const radius = this.radius;

        const directionArray = [];
        for (let i = 0; i < totalLinksCount; i++) {
            const currentLink = normalLinks[i];
            directionArray.push(currentLink.output === node1);
        }
        const paths = this.getPath(circleCenter(node1.dimension, radius), circleCenter(node2.dimension, radius),
            radius, radius, directionArray);

        return paths.map((arcInfo: IArcInfo, index: number) => {
            const currLink = normalLinks[index];
            const selected = storeSelectedLink === currLink;
            const label = currLink.name;
            if (hasMiddle && (index + 1) === halfIndex) {
                return <Line
                    key={index}
                    labelConfig={
                        {
                            label,
                        }
                    }
                    error={currLink.checkFormFailed}
                    markerId='arrow-linked-for-circle'
                    highligtedMarkerId='arrow-linked-thick-for-circle'
                    selected={selected}
                    onMouseDown={
                        (e: React.MouseEvent<any>) => {
                            this.onMouseDown(e, currLink);
                        }} type={2} dInfo={arcInfo}/>;
            }

            return <Line
                selected={selected}
                labelConfig={{label}}
                key={index}
                error={currLink.checkFormFailed}
                onMouseDown={
                    (e: React.MouseEvent<any>) => {
                        this.onMouseDown(e, currLink);
                    }} type={2} dInfo={arcInfo}/>;
        });
    }
}
