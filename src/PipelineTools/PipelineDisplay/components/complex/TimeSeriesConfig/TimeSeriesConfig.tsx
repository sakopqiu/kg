import * as React from 'react';
import {TimeFilterType} from '../../../interfaces';
import {CanvasSetting} from '../../../model/CanvasSetting';
import {getTranslation, Locales} from '../../../../../utils';
import {CanvasDrawService} from '../../../service/CanvasDrawService';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import {RadioChangeEvent} from 'antd/es/radio';
import {observer} from 'mobx-react';

const RadioGroup = Radio.Group;

export interface TimeSeriesConfigProps {
    service: CanvasDrawService;
    locale: Locales;
}

@observer
export class TimeSeriesConfig extends React.Component<TimeSeriesConfigProps> {
    public render() {
        const cyState = this.props.service.cyState;
        const {timeFilterType} = cyState.canvasSetting;
        const locale = this.props.locale;

        return (
            <div className='time-series-adjustment' key={'time-series'}>
                <RadioGroup value={timeFilterType}
                            disabled={!this.props.service.timeFilterService.showTimeFilter}
                            onChange={(evt: RadioChangeEvent) => {
                                const newSetting = CanvasSetting.fromJSON(cyState.canvasSetting);
                                newSetting.timeFilterType = evt.target.value;
                                cyState.setCanvasSetting(newSetting);
                            }}
                >
                    <Radio key={'t'} value={TimeFilterType.TRANSPARENTIZE}>
                        {getTranslation(locale, 'Translucent')}
                    </Radio>
                    <Radio key={'h'} value={TimeFilterType.HIDE}>
                        {getTranslation(locale, 'Hide')}
                    </Radio>
                </RadioGroup>
            </div>
        );
    }
}
