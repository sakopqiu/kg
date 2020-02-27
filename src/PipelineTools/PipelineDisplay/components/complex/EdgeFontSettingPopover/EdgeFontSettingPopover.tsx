import * as React from 'react';
import {CyState} from '../../../model/CyState';
import {getTranslation, Locales} from '../../../../../utils';
import {observer} from 'mobx-react-lite';
import './index.scss';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style';

export interface EdgeFontSettingPopoverProps {
    cyState: CyState;
    locale: Locales;
}

const SliderMarker = {
    12: '12',
    24: '24',
    36: '36',
};

function EdgeFontSettingPopoverFunc(props: EdgeFontSettingPopoverProps) {

    const {cyState, locale} = props;
    const edgeConfig = cyState.canvasSetting.globalEdgeConfig;
    const [fontSize, setFontSize] = React.useState(edgeConfig.edgeFontSize);

    return (
        <div className='edge-font-setting-popover'>
            <div className='edge-font-setting-popover-title'>
                {getTranslation(locale, 'Edge Font Size')}
            </div>
            <Slider
                style={{marginLeft: 0, marginTop: 7, marginBottom: 20}}
                marks={SliderMarker} min={12} max={36}
                value={fontSize} onChange={setFontSize as any}
                onAfterChange={edgeConfig.setEdgeFontSize.bind(edgeConfig)}
            />
        </div>
    );

}

export const EdgeFontSettingPopover = observer(EdgeFontSettingPopoverFunc);
