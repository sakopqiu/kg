import * as React from 'react';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import classNames from 'classnames';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {complexInject} from '../../../../DisplayCanvasUtils';
import EllipsisText from '../../../../../../components/EllipsisText';

export interface StatsBarItem {
    name: string; // 显示在bar上的文字
    title?: string; // 显示在bar上的title,
    size: number; // 大小
    elements?: any[]; // 对应的元素，可填可不填
    data?: any; // 附加信息，用于点击时的回调
    popoverNode?: React.ReactNode;
    leftNode?: React.ReactNode;
    rightNode?: React.ReactNode;
    noTooltip?: boolean;
    translucent?: boolean;
    statsBarItemOnclick?: () => void; // StatsBar整体有一个onClick事件，但是如果item上自定义了statsBarOnclick事件，那么将调用它而不是整体的那个
}

export interface StatsBarProps extends ComplexModeCanvasComponentProps {
    items: StatsBarItem[];
    onClick?: (item: StatsBarItem) => any;
    showZero?: boolean; // 如果数值是0是否显示，默认不显示
    maxBarSize: number; // 横条长度最大扩展值
    barContainerWidth: number; // 整个bar的长度，包括bar，bar下方的半透明遮罩和统计数字
}

@complexInject
export class StatsBar extends ComplexModeCanvasComponent<StatsBarProps> {
    public render() {
        const items = this.props.items;
        let max = -Infinity;
        // 这里不使用lodash的min和max是因为要walk through数组两遍
        items.forEach((item: StatsBarItem) => {
            if (item.size > max) {
                max = item.size;
            }
        });
        return (
            items.map((item: StatsBarItem) => {
                if (item.size === 0 && !this.props.showZero) {
                    return null;
                }
                const width = this.props.maxBarSize * item.size / max;
                const containerWidth = this.props.barContainerWidth;
                return <Bar key={item.name}
                            maxBarWidth={this.props.maxBarSize}
                            barContainerWidth={containerWidth} barWidth={width}
                            onClick={this.props.onClick}
                            item={item}/>;
            })
        );
    }
}

export interface BarProps extends ComplexModeCanvasComponentProps {
    item: StatsBarItem;
    barContainerWidth: number; // bar容器长度
    maxBarWidth: number;
    barWidth: number; // bar的长度
    onClick?: (item: StatsBarItem) => any;
    noTooltip?: boolean;
}

@complexInject
export class Bar extends ComplexModeCanvasComponent<BarProps> {

    constructor(props: BarProps) {
        super(props);
    }

    render() {
        const item = this.props.item;
        const body = <div
            style={{marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            {item.leftNode}
            <div className='stats-wrapper' style={{width: this.props.barContainerWidth}}
                 onClick={() => {
                     item.statsBarItemOnclick ? item.statsBarItemOnclick() : this.props.onClick && this.props.onClick(item);
                 }}>
                <div className='stats-progress-wrapper' style={{width: this.props.maxBarWidth}}>
                    <div
                        title={item.title || item.name + ' ' + item.size}
                        key={item.name} className={classNames('stats-progress', {translucent: item.translucent})}
                        style={{width: this.props.barWidth}}
                    >
                        <EllipsisText
                            noTooltip={this.props.noTooltip}
                            text={item.name} length={this.props.barContainerWidth - 28}
                            mode={'dimension'}/>
                    </div>
                </div>
                <span className='stats-count'>{item.size}</span>
            </div>
            {item.rightNode}
        </div>;
        if (item.popoverNode) {
            return (
                <Popover placement='bottomLeft' content={item.popoverNode}>
                    {body}
                </Popover>
            );
        } else {
            return body;
        }
    }
}
