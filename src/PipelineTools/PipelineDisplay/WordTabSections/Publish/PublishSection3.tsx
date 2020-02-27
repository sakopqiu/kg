import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {falsy} from '../TabSectionUtils';
import {ShareIcon} from '../../../../icons/ShareIcon';

export function publishSection3(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Share'),
            icon: ShareIcon,
            hideTriangle: true,
            enabledFunc: falsy,
        },
    ];
}
