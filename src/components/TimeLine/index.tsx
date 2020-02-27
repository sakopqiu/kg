import * as React from 'react';
import './index.scss';
import {observer} from 'mobx-react';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
export interface TimeLineData {
    name: string; // name用来显示每个时间节点上的值
}

export interface TimeLineProps {
    data: TimeLineData[];
    withScroll: boolean;
    diameter?: number; // 圆点的直径
    marginBetween?: number; // 圆点之间的间距
    onClick?: (data: TimeLineData) => void;
    tooltipFunc?: (data: TimeLineData) => React.ReactNode;
}

@observer
export class Timeline extends React.Component<TimeLineProps> {
    public render() {
        const data = this.props.data || [];
        const diameter = this.props.diameter || 10;
        const marginBetween = this.props.marginBetween || 10;
        const axisTop = diameter / 2;
        const axisWidth = data.length === 0 ? 0 : data.length * (diameter + marginBetween) - marginBetween;
        return (
            <div className='timeline-wrapper'
                 style={{height: diameter, width: axisWidth}}>
                {data.map((data: TimeLineData, i: number) => {
                    const left = i * diameter + i * marginBetween;
                    const style = {
                        width: diameter,
                        height: diameter,
                        left,
                    };

                    const tooltip = this.props.tooltipFunc ? this.props.tooltipFunc(data) :
                        data.name;
                    return (
                        <div key={i}>
                            <Tooltip title={tooltip}>
                                <div title={data.name} onClick={() => {
                                    if (this.props.onClick) {
                                        this.props.onClick(data);
                                    }
                                }}
                                     className='timeline-node' style={style}>
                                </div>
                            </Tooltip>
                            {/*<div className='timeline-node-desc' style={{*/}
                            {/*transformOrigin: `${left}px 5px`,*/}
                            {/*left,*/}
                            {/*}}>*/}
                            {/*{data.name}*/}
                            {/*</div>*/}
                        </div>
                    );
                })}
                <div style={{top: axisTop, width: axisWidth}} className='timeline-axis'></div>
            </div>
        );
    }
}
