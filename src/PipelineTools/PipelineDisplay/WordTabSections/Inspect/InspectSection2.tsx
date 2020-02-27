import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {truthy} from '../TabSectionUtils';
import {SummaryGridIcon} from '../../../../icons/SummaryGridIcon';

export function inspectSection2(locale: Locales, s: StatusService): SectionChild[] {
    const miniMapService = s.miniMapService;
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Summary'),
            icon: SummaryGridIcon,
            enabledFunc: truthy,
            hideTriangle: true,
            onClick: () => {
                miniMapService.setMiniMapVisible(!miniMapService.miniMapVisible);
            },
        },
    ];
}
