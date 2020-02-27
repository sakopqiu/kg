import {SectionChild, SectionChildType} from '../../interfaces';
import {Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {truthy} from '../TabSectionUtils';
import {CanvasPageRankIcon} from '../../../../icons/CanvasPageRankIcon';

export function layoutSection1(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.LARGE,
            title: 'PageRank',
            icon: CanvasPageRankIcon,
            enabledFunc: truthy,
            onClick: () => {
                s.algorithmService.rankNodes();
            },
        },
    ];
}
