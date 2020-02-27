import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {getTranslation, Locales} from '../../../../utils';
import {ConnectedRelationshipIcon} from '../../../../icons/ConnectedRelationshipIcon';
import {determineMenuPosition, truthy} from '../TabSectionUtils';
import {runInAction} from 'mobx';
import {PathDiscoveryIcon} from '../../../../icons/PathDiscoveryIcon';
import {ShortestPathIcon} from '../../../../icons/ShortestPathIcon';

export function analyzeSection2(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Add Related'),
            icon: ConnectedRelationshipIcon,
            onClick: (e: any) => {
                runInAction(() => {
                    determineMenuPosition(s, e);
                    s.stateService.setShowNeighborFilterModal(true);
                });
            },
            enabledFunc: () => s.showForSingleNode || s.showForMultipleNodes,
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Path Discovery'),
            icon: PathDiscoveryIcon,
            onClick: (e: any) => {
                const eleService = s.elementService;
                runInAction(() => {
                    eleService.setShowBlazer(true);
                    eleService.setBlazerPosition({x: e.clientX, y: e.clientY});
                    eleService.blazerType = 'ONLINE_PATH';
                });
            },
            enabledFunc: truthy,
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Find Shortest Path'),
            icon: ShortestPathIcon,
            onClick: (e: any) => {
                const eleService = s.elementService;
                runInAction(() => {
                    eleService.setShowBlazer(true);
                    eleService.setBlazerPosition({x: e.clientX, y: e.clientY});
                    eleService.blazerType = 'OFFLINE_PATH';
                });
            },
            enabledFunc: truthy,
        },
    ];
}
