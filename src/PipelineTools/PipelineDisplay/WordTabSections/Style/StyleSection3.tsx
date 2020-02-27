import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {EntityStyleIcon} from '../../../../icons/EntityStyleIcon';
import {truthy} from '../TabSectionUtils';
import {FileIcon} from '../../../../icons/FileIcon';

export function styleSection3(locale: Locales, s: StatusService): SectionChild[] {
    const eleService = s.elementService;
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Entity Style'),
            icon: EntityStyleIcon,
            hideTriangle: true,
            enabledFunc: truthy,
            onClick: eleService.clearNodesStyle.bind(eleService),
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Edge Style'),
            icon: FileIcon,
            enabledFunc: truthy,
            hideTriangle: true,
            onClick: eleService.clearEdgesStyle.bind(eleService),
        },
    ];
}
