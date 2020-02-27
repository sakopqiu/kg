import {SectionChild, SectionChildType} from '../../interfaces';
import {Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import './index.scss';
import * as React from 'react';
import {TimeSeriesConfig} from '../../components/complex/TimeSeriesConfig/TimeSeriesConfig';

export function styleSection4(locale: Locales, service: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.CUSTOM,
            render() {
                return <TimeSeriesConfig key='time-series-config' service={service.drawService} locale={locale}/>;
            },
        },
    ];
}
