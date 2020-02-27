import * as React from 'react';
import './index.scss';
import {getTranslation, Locales, showError} from '../../utils';
import DatePicker from 'antd/es/date-picker';
import 'antd/es/date-picker/style';
import Row from 'antd/es/row';
import 'antd/es/row/style';
import Col from 'antd/es/col';
import 'antd/es/col/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import * as moment from 'moment';
import {useHitOnClose, useOnChangeHandler} from '../SophonHooks/hookUtils';

export interface TimeRangeTableProps {
    locale: Locales;
    onClose: () => void;
    onConfirm: (from: moment.Moment | null, to: moment.Moment | null) => void;
    className?: string;
    // 点击周边触发关闭
    maskClosable?: boolean;
    defaultFrom?: moment.Moment | null;
    defaultTo?: moment.Moment | null;
    style?: React.CSSProperties;
}

export function TimeRangeTable(props: TimeRangeTableProps) {

    const locale = props.locale;
    const divRef = React.useRef<HTMLDivElement>(null);
    const [fromDate, setFromDate] = useOnChangeHandler<moment.Moment | null>(props.defaultFrom || null);
    const [toDate, setToDate] = useOnChangeHandler<moment.Moment | null>(props.defaultTo || null);
    useHitOnClose(!!props.maskClosable, divRef, props.onClose);

    return (
        <div ref={divRef} className={`time-range-table ${props.className || ''}`} style={props.style || {}}>
            <div className='time-range-table-title'>
                <span className='time-range-table-title-left'>{getTranslation(locale, 'Customized Time Range')}</span>
                <span className='time-range-table-title-right'
                      onClick={props.onClose}
                >+</span>
            </div>
            <div className='time-range-table-content'>
                <Row>
                    <Col span={6}>
                        From
                    </Col>
                    <Col span={18}>
                        <DatePicker value={fromDate || undefined}
                                    showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    onChange={(selectedTime: moment.Moment) => {
                                        if (selectedTime) {
                                            selectedTime = moment(selectedTime.valueOf() - selectedTime.valueOf() % 1000);
                                        }
                                        if (selectedTime && toDate && selectedTime.isAfter(toDate)) {
                                            showError(getTranslation(locale, 'End time warning'));
                                        } else {
                                            setFromDate(selectedTime);
                                        }
                                    }}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        To
                    </Col>
                    <Col span={18}>
                        <DatePicker value={toDate || undefined}
                                    showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    onChange={(selectedTime: moment.Moment) => {
                                        if (selectedTime) {
                                            selectedTime = moment(selectedTime.valueOf() - selectedTime.valueOf() % 1000);
                                        }
                                        if (selectedTime && fromDate && selectedTime.isBefore(fromDate)) {
                                            showError(getTranslation(locale, 'End time warning'));
                                        } else {
                                            setToDate(selectedTime);
                                        }
                                    }}/>
                    </Col>
                </Row>
            </div>
            <Button type='primary' className='time-range-table-confirm' disabled={!fromDate && !toDate}
                    onClick={() => {
                        props.onConfirm(fromDate, toDate);
                        props.onClose();
                    }}
            >
                {getTranslation(locale, 'Confirm')}
            </Button>
        </div>
    );

}
