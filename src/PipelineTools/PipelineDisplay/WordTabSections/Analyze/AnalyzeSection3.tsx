import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {truthy} from '../TabSectionUtils';
import {TimeFilterIcon} from '../../../../icons/TimeFilterIcon';
import {VisualizedAnalysisIcon} from '../../../../icons/VisualizedAnalysisIcon';

export function analyzeSection3(locale: Locales, s: StatusService): SectionChild[] {
    const tService = s.timeFilterService;

    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Time Series'),
            icon: TimeFilterIcon,
            onClick: () => {
                tService.setShowTimeFilter(!tService.showTimeFilter);
            },
            enabledFunc: truthy,
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Visualized Analysis'),
            icon: VisualizedAnalysisIcon,
            onClick: () => {
                s.stateService.openStatsAnalysis(locale);
            },
            enabledFunc: truthy,
        },
    ];
}
