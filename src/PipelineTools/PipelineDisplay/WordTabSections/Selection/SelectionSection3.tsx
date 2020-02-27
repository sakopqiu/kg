import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {falsy} from '../TabSectionUtils';
import {CombinationFilterIcon} from '../../../../icons/CombinationFilterIcon';

export function selectionSection3(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Combined Filter'),
            icon: CombinationFilterIcon,
            enabledFunc: falsy,
        },
    ];
}
