import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {falsy} from '../TabSectionUtils';
import {HorizontalAlignIcon} from '../../../../icons/HorizontalAlignIcon';
import {VerticalAlignIcon} from '../../../../icons/VerticalAlignIcon';
import {EntityHorizontalAlignIcon} from '../../../../icons/EntityHorizontalAlignIcon';
import {EntityVerticalAlignIcon} from '../../../../icons/EntityVerticalAlignIcon';

export function layoutSection3(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'H Align'),
            icon: HorizontalAlignIcon,
            enabledFunc: falsy,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'V Align'),
            icon: VerticalAlignIcon,
            enabledFunc: falsy,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'H equal margin'),
            icon: EntityHorizontalAlignIcon,
            enabledFunc: falsy,
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'V equal margin'),
            icon: EntityVerticalAlignIcon,
            enabledFunc: falsy,
        },
    ];
}
