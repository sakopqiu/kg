import {BorderStyleIcon} from '../../../../icons/BorderStyleIcon';
import {SectionChildType} from '../../interfaces';
import {SizeIcon} from '../../../../icons/SizeIcon';
import {ShapeIcon} from '../../../../icons/ShapeIcon';
import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {EntitySizeConfigurer} from '../../context_menu/complex/NodeStyleConfigurer/EntitySizeConfigurer';
import {RadioChangeEvent} from 'antd/es/radio';
import * as React from 'react';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import {observer} from 'mobx-react';
import {ShapeConfigurer} from '../../context_menu/complex/NodeStyleConfigurer/ShapeConfigurer';
import {NameCardIcon} from '../../../../icons/NameCardIcon';
import {truthy} from '../TabSectionUtils';
import {CanvasDrawService} from '../../service/CanvasDrawService';
import {BorderColorConfigurer} from '../../context_menu/complex/NodeStyleConfigurer/BorderColorConfigurer';
import {VideoSettingIcon} from '../../../../icons/VideoSettingIcon';

const RadioGroup = Radio.Group;

function entityNamePopover(locale: Locales, drawService: CanvasDrawService) {
    const {hideNodeLabel} = drawService.cyState.canvasSetting;
    return (
        <div>
            <RadioGroup value={hideNodeLabel} onChange={(e: RadioChangeEvent) => {
                drawService.cyState.setCanvasSetting({
                    ...drawService.cyState.canvasSetting,
                    hideNodeLabel: e.target.value,
                });
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

export function styleSection1(locale: Locales, service: StatusService) {
    const enabledFunc = () => service.showForSingleNode || service.showForMultipleNodes;
    const enabled = service.showForSingleNode || service.showForMultipleNodes;
    const stateService = service.stateService;

    const style = {margin: 0};
    const EEC = observer(() => {
        return (
            <EntitySizeConfigurer
                style={style}
                locale={locale}
                onChange={(e: RadioChangeEvent) => {
                    const newSize = e.target.value;
                    stateService.setLastTimeEntitySize(newSize);
                    stateService.elementService.applySize(newSize);
                }}
                value={stateService.lastTimeEntitySize}/>
        );
    });

    const SC = observer(() => {
        return (
            <ShapeConfigurer
                style={style}
                locale={locale}
                onChange={(shape) => {
                    stateService.setLastTimeEntityShape(shape);
                    stateService.elementService.applyShape(shape);
                }}
                shape={stateService.lastTimeEntityShape}/>
        );
    });

    const LCC = observer(() => {
        return (
            <BorderColorConfigurer
                style={style}
                locale={locale}
                onChange={(color) => {
                    stateService.setLastTimeEntityColor(color);
                    stateService.elementService.applyColor(color);
                }}
                color={stateService.lastTimeEntityColor}/>
        );
    });

    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Name'),
            icon: NameCardIcon,
            popover: entityNamePopover(locale, service.drawService),
            enabledFunc: truthy,
        },
        {
            id: 'entity-size-configurer',
            popoverOverlayClassName: 'entity-size-configurer-overlay',
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Entity Size'),
            icon: SizeIcon,
            popover: enabled ? <EEC/> : null,
            enabledFunc,
        }
        ,
        {
            id: 'entity-shape-configurer',
            popoverOverlayClassName: 'entity-shape-configurer-overlay',
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Entity Shape'),
            icon: ShapeIcon,
            popover: enabled ? <SC/> : null,
            enabledFunc,
        }
        ,
        {
            id: 'border-style-configurer',
            popoverOverlayClassName: 'border-style-configurer-overlay',
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Border Color'),
            icon: BorderStyleIcon,
            popover: enabled ? <LCC/> : null,
            enabledFunc,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'More'),
            hint: getTranslation(locale, 'More Settings'),
            icon: VideoSettingIcon,
            hideTriangle: false,
            enabledFunc: truthy,
            onClick: () => {
                service.stateService.setShowNodeStyleModal(true);
            },
        },
    ];
}
