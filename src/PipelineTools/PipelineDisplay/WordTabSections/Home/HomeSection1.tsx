import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {UndoIcon} from '../../../../icons/UndoIcon';
import {RedoIcon} from '../../../../icons/RedoIcon';

export function homeSection1(locale: Locales, s: StatusService): SectionChild[] {

    const historyService = s.historyService;
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Undo'),
            icon: UndoIcon,
            hint: 'ctrl+z',
            onClick: historyService.back.bind(historyService),
            enabledFunc: () => historyService.canBack,
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Redo'),
            icon: RedoIcon,
            hint: 'ctrl+shift+z',
            onClick: historyService.forward.bind(historyService),
            enabledFunc: () => historyService.canForward,
        },
    ];
}
