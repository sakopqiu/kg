import {SectionChild, SectionChildType} from '../../interfaces';
import {CYTO_MAX_ZOOM, CYTO_MIN_ZOOM, getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {ScreenFitIcon} from '../../../../icons/ScreenFitIcon';
import {truthy} from '../TabSectionUtils';
import {ZoomInIcon} from '../../../../icons/ZoomInIcon';
import {ZoomOutIcon} from '../../../../icons/ZoomOutIcon';

export function inspectSection1(locale: Locales, s: StatusService): SectionChild[] {
    const eleService = s.elementService;
    const stateService = s.stateService;
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Fit'),
            icon: ScreenFitIcon,
            enabledFunc: truthy,
            hideTriangle: true,
            onClick: eleService.fitElements.bind(eleService),
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Zoom in'),
            icon: ZoomInIcon,
            enabledFunc: () => stateService.canvasRatio < CYTO_MAX_ZOOM,
            hideTriangle: true,
            onClick: eleService.zoomIn.bind(eleService),
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Zoom out'),
            icon: ZoomOutIcon,
            enabledFunc: () => stateService.canvasRatio > CYTO_MIN_ZOOM,
            hideTriangle: true,
            onClick: eleService.zoomOut.bind(eleService),
        },
    ];
}
