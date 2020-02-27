import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {NoteIcon} from '../../../../icons/NoteIcon';
import {TagIcon} from '../../../../icons/TagIcon';
import {truthy} from '../TabSectionUtils';
import {FileIcon} from '../../../../icons/FileIcon';
import {CommunityIcon} from '../../../../icons/CommunityIcon';

export function editSection2(locale: Locales, s: StatusService): SectionChild[] {
    const eleService = s.elementService;
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Clear Canvas'),
            icon: NoteIcon,
            hideTriangle: true,
            enabledFunc: truthy,
            onClick: eleService.clearAll.bind(eleService),
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'All Annotations'),
            icon: FileIcon,
            enabledFunc: truthy,
            hideTriangle: true,
            onClick: eleService.removeAllAnnotations.bind(eleService),
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Clear Communities'),
            icon: CommunityIcon,
            enabledFunc: truthy,
            hideTriangle: true,
            onClick: () => {
                s.communityService.clearCommunities();
            },
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Note'),
            icon: TagIcon,
            hideTriangle: true,
            enabledFunc: () => {
                return s.showForSingleNode || s.showForMultipleNodes;
            },
            onClick: eleService.removeNotes.bind(eleService),
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Tags'),
            icon: TagIcon,
            hideTriangle: true,
            enabledFunc: () => {
                return s.showForSingleNode || s.showForMultipleNodes;
            },
            onClick: eleService.removeTags.bind(eleService),
        },

    ];
}
