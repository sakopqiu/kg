import {getTranslation, Locales} from '../../../../utils';
import {StatusService} from '../../service/StatusService';
import {SectionChild, SectionChildType} from '../../interfaces';
import {NoteIcon} from '../../../../icons/NoteIcon';
import {TagIcon} from '../../../../icons/TagIcon';
import {determineMenuPosition, setMenuPositionAtSelectedNode, truthy} from '../TabSectionUtils';
import {runInAction} from 'mobx';
import {FileIcon} from '../../../../icons/FileIcon';
import {AnnotationToolBar} from '../components/AnnotationToolBar/AnnotationToolBar';
import * as React from 'react';

export function editSection1(locale: Locales, s: StatusService): SectionChild[] {
    return [
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Note'),
            icon: NoteIcon,
            hideTriangle: true,
            enabledFunc: () => s.showForSingleNode,
            onClick: () => {
                runInAction(() => {
                    setMenuPositionAtSelectedNode(s);
                    s.stateService.setShowNodeNote(true);
                });
            },
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Tags'),
            icon: TagIcon,
            hideTriangle: true,
            enabledFunc: () => s.showForSingleNode || s.showForMultipleNodes,
            onClick: (e: any) => {
                runInAction(() => {
                    determineMenuPosition(s, e);
                    s.stateService.setShowCanvasTag(true);
                });
            },
        },
        {
            type: SectionChildType.MINI,
            title: getTranslation(locale, 'Annotation'),
            icon: FileIcon,
            enabledFunc: truthy,
            popover: <AnnotationToolBar/>,
        },

    ];
}
