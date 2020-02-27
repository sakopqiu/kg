import React, {useEffect, useRef, useState} from 'react';
import './index.scss';
import moment from 'moment';

interface ISophonTimeElapsedProps {
    startTime: number;
    stopTime?: number;
}

export function SophonTimeElapsed(props: ISophonTimeElapsedProps) {
    const timer = useRef<number>(-1);
    const [current, setCurrent] = useState(moment().valueOf() - props.startTime);
    useEffect(() => {
        if (props.stopTime) {
            setCurrent(props.stopTime - props.startTime);
        } else {
            timer.current = setInterval(() => {
                // 取当前时间而不是加一，增加准确性
                setCurrent(moment().valueOf() - props.startTime);
            }, 1000);
        }
        return () => {
            clearInterval(timer.current);
        };
    }, [props.startTime, props.stopTime]);
    const duration = moment.duration(current);
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return (
        <span className='sophon-time-elapsed'>
            {!!days && <span className='time-item'>{days}d</span>}
            {(!!hours || !!days) && <span className='time-item'>{hours}h</span>}
            {(!!minutes || !!days || !!hours) && <span className='time-item'>{minutes}m</span>}
            {<span className='time-item'>{seconds}s</span>}
        </span>
    );
}
