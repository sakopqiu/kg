import {StatusService} from '../../service/StatusService';
import {CustomizedCommunityIcon} from '../../../../icons/CustomizedCommunityIcon';
import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {ManualCommunitySearchIcon} from '../../../../icons/ManualCommunitySearchIcon';
import {runInAction} from 'mobx';
import {setMenuPosition, truthy} from '../TabSectionUtils';

export function analyzeSection1(locale: Locales, s: StatusService): SectionChild[] {

    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Community Exploration'),
            icon: ManualCommunitySearchIcon,
            onClick: () => {
                runInAction(() => {
                    s.stateService.setShowCommunityPanel(true);
                });
            },
            enabledFunc: truthy,
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Customized Community'),
            icon: CustomizedCommunityIcon,
            onClick: (e) => {
                setMenuPosition(s, e);
                s.stateService.setShowCustomizedCommunityMenu(true);
            },
            enabledFunc: truthy,
        },
    ];
}
