import React from 'react';
import Timeline from 'antd/es/timeline';
import 'antd/es/timeline/style';

interface ITimelineProps {
    datetime?: string; // if datetime specified, only left mode is supported for now
    datetimeLabelWidth?: number; // default is 85px and only work if the datetime is true
    itemPaddingLeft?: number; // padding left for timeline item base on time axis
}

export class TimelineItem extends React.Component<ITimelineProps> {
    public render() {
        let date: string = '';
        let time: string = '';
        if (this.props.datetime) {
            [date, time] = this.props.datetime.split(' ');
        }
        return (
            <Timeline.Item
                className='timeline-item'
                style={{
                    paddingLeft: this.props.itemPaddingLeft,
                }}
            >
                {this.props.datetime &&
                <div
                    className='datetime-label'
                    style={{
                        width: this.props.datetimeLabelWidth || 85,
                        transform: `translateX(-100%) translateX(-${2 * (this.props.itemPaddingLeft || 0) + 18}px)`,
                    }}
                >
                    <div className='datetime-wrapper'>
                        <span>{date}</span> <br />
                        <span>{time}</span>
                    </div>
                </div>}
                {this.props.children}
            </Timeline.Item>
        );
    }
}
