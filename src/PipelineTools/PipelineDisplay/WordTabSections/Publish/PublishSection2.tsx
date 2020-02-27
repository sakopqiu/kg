import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {falsy} from '../TabSectionUtils';
import {AnalysisCaseIcon} from '../../../../icons/AnalysisCaseIcon';

export function publishSection2(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Analyze Case'),
            icon: AnalysisCaseIcon,
            hideTriangle: true,
            enabledFunc: falsy,
        },
    ];
}
