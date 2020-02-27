import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {falsy} from '../TabSectionUtils';
import {FullScreenSquareIcon} from '../../../../icons/FullScreenSquareIcon';

export function inspectSection3(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Full Screen'),
            icon: FullScreenSquareIcon,
            enabledFunc: falsy,
            hideTriangle: true,
            onClick: () => {
            },
        },
    ];
}
