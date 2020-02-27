import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {SearchIcon} from '../../../../icons/SearchIcon';
import {truthy} from '../TabSectionUtils';

export function homeSection3(locale: Locales, s: StatusService): SectionChild[] {

    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Search2'),
            icon: SearchIcon,
            hint: 'ctrl+f',
            enabledFunc: truthy,
            onClick: () => {
                s.stateService.setShowSearchBox(!s.stateService.showSearchBox);
            },
        },

    ];
}
