import React from 'react';
import Timeline from 'antd/es/timeline';
import 'antd/es/timeline/style';

import './index.scss';
import {TimelineItem} from './TimelineItem';

interface ITimelineItem {
    id: string;
    datetime?: string;
    content: React.ReactNode;
}

interface IVerticalTimelineProps {
    items: ITimelineItem[];
    mode?: 'left' | 'right' | 'alternate';
    showDatetime?: boolean; // only left mode support show date time on left for now
    datetimeLabelWidth?: number; // works only showDatetime is true
    itemPaddingLeft?: number; // padding left for timeline item base on time axis
}

export class VerticalTimeline extends React.Component<IVerticalTimelineProps> {
    public render() {
        return (
            <Timeline
                className={`timeline-wrapper ${this.props.showDatetime ? 'show-datetime' : ''}`}
                style={{paddingLeft: this.props.showDatetime ? (this.paddingLeft) : 0}}
                mode={this.props.mode}
            >
                {this.props.items.map((item) => (
                    <TimelineItem
                        itemPaddingLeft={this.props.itemPaddingLeft}
                        key={item.id}
                        datetimeLabelWidth={this.props.datetimeLabelWidth}
                        datetime={this.props.showDatetime ? item.datetime : undefined}
                    >
                        {item.content}
                    </TimelineItem>
                ))}
            </Timeline>
        );
    }

    get paddingLeft() {
        let paddingLeft: number = 0;
        if (this.props.datetimeLabelWidth) {
            paddingLeft = this.props.datetimeLabelWidth;
        }
        if (this.props.itemPaddingLeft) {
            paddingLeft = paddingLeft + this.props.itemPaddingLeft;
        }

        return paddingLeft || 85; // default is 85
    }
}
