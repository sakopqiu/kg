import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import 'antd/es/checkbox/style';
import Radio, {RadioChangeEvent} from 'antd/es/radio';
import 'antd/es/radio/style';
import './index.scss';
import * as React from 'react';
import {CanvasDrawService} from '../../service/CanvasDrawService';
import {truthy} from '../TabSectionUtils';
import {NameCardIcon} from '../../../../icons/NameCardIcon';
import {MergeIcon} from '../../../../icons/MergeIcon';
import {ExpandIcon} from '../../../../icons/ExpandIcon';
import {VideoSettingIcon} from '../../../../icons/VideoSettingIcon';
import {EdgeColorSettingPopover} from '../../components/complex/EdgeColorSettingPopover/EdgeColorSettingPopover';
import {LineIcon} from '../../../../icons/LineIcon';
import {EdgeFontSettingPopover} from '../../components/complex/EdgeFontSettingPopover/EdgeFontSettingPopover';
import {FontIcon} from '../../../../icons/FontIcon';

const RadioGroup = Radio.Group;

function edgeNamePopover(locale: Locales, drawService: CanvasDrawService) {
    const {hideEdgeLabel} = drawService.cyState.canvasSetting.globalEdgeConfig;
    return (
        <div>
            <RadioGroup value={hideEdgeLabel} onChange={(e: RadioChangeEvent) => {
                drawService.cyState.canvasSetting.globalEdgeConfig.setHideEdgeLabel(e.target.value);
            }}>
                <Radio value={false}>
                    {getTranslation(locale, 'Show')}
                </Radio>
                <br/>
                <Radio style={{marginTop: 10}} value={true}>
                    {getTranslation(locale, 'Hide')}
                </Radio>
            </RadioGroup>
        </div>
    );
}

export function styleSection2(locale: Locales, service: StatusService): SectionChild[] {
    const cyState = service.cyState;

    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Name'),
            icon: NameCardIcon,
            popover: edgeNamePopover(locale, service.drawService),
            enabledFunc: truthy,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Font'),
            icon: FontIcon,
            popover: <EdgeFontSettingPopover locale={locale} cyState={cyState}/>,
            enabledFunc: truthy,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Line'),
            icon: LineIcon,
            popover: <EdgeColorSettingPopover locale={locale} cyState={cyState}/>,
            enabledFunc: truthy,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Merge edge'),
            hint: getTranslation(locale, 'Merge all edge hint'),
            icon: MergeIcon,
            hideTriangle: true,
            enabledFunc: truthy,
            onClick: () => {
                cyState.mergeAllEdges();
            },
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Expand edge'),
            hint: getTranslation(locale, 'Expand all edge hint'),
            icon: ExpandIcon,
            hideTriangle: true,
            enabledFunc: truthy,
            onClick: () => {
                cyState.expandAllEdges();
            },
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'More'),
            hint: getTranslation(locale, 'More Settings'),
            icon: VideoSettingIcon,
            hideTriangle: false,
            enabledFunc: truthy,
            onClick: () => {
                service.stateService.setShowRelationStyleModal(true);
            },
        },
    ];
}
