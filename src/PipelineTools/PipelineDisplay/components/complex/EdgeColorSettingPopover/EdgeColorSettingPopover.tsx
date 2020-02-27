import * as React from 'react';
import {CyState} from '../../../model/CyState';
import {getTranslation, Locales} from '../../../../../utils';
import {observer} from 'mobx-react-lite';
import './index.scss';
import {StyleColorSquare} from '../../common/StyleColorSquare/StyleColorSquare';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style';
import {LineColors, LineOpacitySliderMarker} from '../interface';

export interface EdgeColorSettingPopoverProps {
    cyState: CyState;
    locale: Locales;
}

function EdgeColorSettingPopoverFunc(props: EdgeColorSettingPopoverProps) {

    const {cyState, locale} = props;
    const edgeColorConfig = cyState.canvasSetting.globalEdgeConfig.edgeColorConfig;
    const color = edgeColorConfig.color;
    const [opacity, setOpacity] = React.useState(edgeColorConfig.opacity);

    return (
        <div className='edge-color-setting-popover'>
            <div className='edge-color-setting-popover-title'>
                {getTranslation(locale, 'Line Color')}
            </div>
            <div className='edge-color-setting-popover-squares'>
                <StyleColorSquare selected={color === LineColors.COLOR1}
                                  color={LineColors.COLOR1}
                                  onClick={() => {
                                      edgeColorConfig.setColor(LineColors.COLOR1);
                                  }}/>
                <StyleColorSquare selected={color === LineColors.COLOR2}
                                  color={LineColors.COLOR2}
                                  onClick={() => {
                                      edgeColorConfig.setColor(LineColors.COLOR2);
                                  }}/>
            </div>
            <div className='edge-color-setting-popover-title'>
                {getTranslation(locale, 'Line Opacity')}
            </div>
            <Slider
                style={{marginLeft: 0, marginTop: 7, marginBottom: 20}}
                marks={LineOpacitySliderMarker} min={0} max={100}
                value={opacity} onChange={setOpacity as any}
                onAfterChange={edgeColorConfig.setOpacity.bind(edgeColorConfig)}
            />
        </div>
    );

}

export const EdgeColorSettingPopover = observer(EdgeColorSettingPopoverFunc);
