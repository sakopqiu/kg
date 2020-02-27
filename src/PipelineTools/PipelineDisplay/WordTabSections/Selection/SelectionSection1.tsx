import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {InverseSelectIcon} from '../../../../icons/InverseSelectIcon';
import {truthy} from '../TabSectionUtils';
import {SelectAllIcon} from '../../../../icons/SelectAllIcon';
import {LeafEntityIcon} from '../../../../icons/LeafEntityIcon';

export function selectionSection1(locale: Locales, s: StatusService): SectionChild[] {
    const selectionService = s.selectionService;
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Invert Selection'),
            icon: InverseSelectIcon,
            enabledFunc: truthy,
            onClick: () => {
                selectionService.invertSelection();
            },
        },
        {
            type: SectionChildType.LARGE,
            hint: 'ctrl+a',
            title: getTranslation(locale, 'Select All'),
            icon: SelectAllIcon,
            enabledFunc: truthy,
            onClick: () => {
                selectionService.selectAll();
            },
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Leaf Entity'),
            icon: LeafEntityIcon,
            enabledFunc: truthy,
            onClick: () => {
                selectionService.selectLeafNodes();
            },
        },
    ];
}
