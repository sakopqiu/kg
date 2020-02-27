import React from 'react';
import ReactHorizontalTimeline from 'react-horizontal-timeline';
import {observer} from 'mobx-react';
import {action} from 'mobx';
import moment from 'moment';
import './index.scss';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';

// props detail refer https://github.com/sherubthakur/react-horizontal-timeline
interface IHorizontalTimelineProps {
    index: number; // required
    values: number[]; // sorted timestamps
    onClick: (value: number, index?: number) => void; // value is timestamp
    getLabel?: (value: number, index?: number) => React.ReactNode; // value is timestamp
    minEventPadding?: number; // The minimum padding between two event labels
    maxEventPadding?: number; // The maximum padding between two event labels
    linePadding?: number; // Padding used at the start and end of the timeline
    labelWidth?: number; // The width of an individual label
    labelPosition?: 'top' | 'bottom'; // default is top
    toolTipFunc?: (value: number, index?: number) => React.ReactNode;
    plainMode?: boolean; // 没有past present future的效果区别
    rotate?: string; // e.g. 'rotate(45deg)'
    height?: number; // height of the timeline
    styles?: {[index: string]: string}; // timeline dot styles include background, foreground, outline
}

// precision is millisecond
@observer
export class HorizontalTimeline extends React.Component<IHorizontalTimelineProps> {
    get labelPosition() {
        return this.props.labelPosition || 'top';
    }

    get rotate() {
        if (this.labelPosition === 'top') {
            return this.props.rotate;
        } else {
            return `translateX(-50%) ${this.props.rotate || ''}`;
        }
    }

    public render() {
        const {values, ...rest} = this.props;
        return (
            values.length ?
                <div
                    className={`timeline-wrapper ${this.props.plainMode ? 'plain-mode' : ''} ${this.labelPosition === 'bottom' ? 'timeline-label-bottom' : 'timeline-label-top'}`}
                    style={{height: this.props.height || 34}}
                >
                    <ReactHorizontalTimeline
                        {...rest}
                        index={this.props.index}
                        indexClick={this.onClick}
                        getLabel={this.getLabel}
                        values={values.map((value) => moment(value, 'x').format('YYYY-MM-DD'))} // require format 'yyyy-mm-dd'
                    />
                </div> : null
        );
    }

    // date is useless here since the precision of this tool is day... and we need second
    private getLabel = (date: string, index: number) => {
        const value = this.props.values[index];
        if (this.props.getLabel) {
            const label = <div className='spot-label' style={{transform: this.rotate}}>{this.props.getLabel(value, index)}</div>;
            return(
                this.props.toolTipFunc ?
                    <Tooltip title={this.props.toolTipFunc(value, index)}>
                        {label}
                    </Tooltip> :
                    label);
        } else {
            // default label format
            const label = <div className='spot-label' style={{transform: this.rotate}}>{moment(value, 'x').format('YYYY-MM-DD HH:mm:ss')}</div>;
            return(
                this.props.toolTipFunc ?
                    <Tooltip title={this.props.toolTipFunc(value, index)}>
                        {label}
                    </Tooltip> :
                    label);
        }
    }

    @action
    private onClick = (index: number) => {
        this.props.onClick(this.props.values[index], index);
    }
}
