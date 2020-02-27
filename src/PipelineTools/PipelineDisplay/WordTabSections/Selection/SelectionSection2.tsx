import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {ConnectedEntityIcon} from '../../../../icons/ConnectedEntityIcon';
import {ConnectedRelationshipIcon} from '../../../../icons/ConnectedRelationshipIcon';
import {EntityRelationshipIcon} from '../../../../icons/EntityRelationshipIcon';

export function selectionSection2(locale: Locales, s: StatusService): SectionChild[] {
    const selectionService = s.selectionService;
    return [
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Select Neighboring Nodes'),
            icon: ConnectedEntityIcon,
            enabledFunc: () => s.showForMultipleNodes || s.showForSingleNode || s.isAnyEdgesSelected,
            onClick: () => {
                selectionService.selectNeighboringNodes();
            },
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Select Neighboring Edges'),
            icon: ConnectedRelationshipIcon,
            enabledFunc: () => s.showForMultipleNodes || s.showForSingleNode,
            onClick: () => {
                selectionService.selectNeighboringEdges();
            },
        },
        {
            type: SectionChildType.LARGE,
            title: getTranslation(locale, 'Select All Neighbors'),
            icon: EntityRelationshipIcon,
            enabledFunc: () => s.showForMultipleNodes || s.showForSingleNode,
            onClick: () => {
                selectionService.selectAllNeighbors();
            },
        },
    ];
}
