import {getTranslation, Locales} from '../../../utils';
import {CategoryConfig, CategoryKey, SectionKey} from '../interfaces';
import {StatusService} from '../service/StatusService';
import {styleSection1} from './Style/StyleSection1';
import {selectionSection1} from './Selection/SelectionSection1';
import {selectionSection2} from './Selection/SelectionSection2';
import {selectionSection3} from './Selection/SelectionSection3';
import {editSection1} from './Edit/EditSection1';
import {editSection2} from './Edit/EditSection2';
import {homeSection1} from './Home/HomeSection1';
import {layoutSection1} from './Layout/LayoutSection1';
import {layoutSection2} from './Layout/LayoutSection2';
import {layoutSection3} from './Layout/LayoutSection3';
import {homeSection2} from './Home/HomeSection2';
import {styleSection3} from './Style/StyleSection3';
import {styleSection2} from './Style/StyleSection2';
import {homeSection3} from './Home/HomeSection3';
import {analyzeSection1} from './Analyze/AnalyzeSection1';
import {analyzeSection2} from './Analyze/AnalyzeSection2';
import {analyzeSection3} from './Analyze/AnalyzeSection3';
import {inspectSection1} from './Inspect/InspectSection1';
import {inspectSection2} from './Inspect/InspectSection2';
import {inspectSection3} from './Inspect/InspectSection3';

export function allSectionsConfig(locale: Locales, s: StatusService): CategoryConfig[] {
    const config: CategoryConfig[] = [
        {
            key: CategoryKey.home,
            title: getTranslation(locale, 'Home'),
            sections: [
                {
                    key: SectionKey.homeSection1,
                    children: homeSection1(locale, s),
                },
                {
                    key: SectionKey.homeSection2,
                    children: homeSection2(locale, s),
                },
                {
                    key: SectionKey.homeSection3,
                    children: homeSection3(locale, s),
                },
            ],
        },
        {
            key: CategoryKey.selection,
            title: getTranslation(locale, 'Selection'),
            sections: [
                {
                    key: SectionKey.selectionSection1,
                    children: selectionSection1(locale, s),
                },
                {
                    key: SectionKey.selectionSection2,
                    children: selectionSection2(locale, s),
                },
                {
                    key: SectionKey.selectionSection3,
                    children: selectionSection3(locale, s),
                },
            ],
        },
        {
            key: CategoryKey.analyze,
            title: getTranslation(locale, 'Analyze'),
            sections: [
                {
                    key: SectionKey.analysisSection1,
                    children: analyzeSection1(locale, s),
                },
                {
                    key: SectionKey.analysisSection2,
                    children: analyzeSection2(locale, s),
                },
                {
                    key: SectionKey.analysisSection3,
                    children: analyzeSection3(locale, s),
                },
            ],
        },
        {
            key: CategoryKey.discovery,
            title: getTranslation(locale, 'Discovery'),
            sections: [
                {
                    key: SectionKey.discoverySection1,
                    children: [],
                },
            ],
        },
        {
            key: CategoryKey.edit,
            title: getTranslation(locale, 'Edit'),
            sections: [
                {
                    key: SectionKey.editSection1,
                    title: getTranslation(locale, 'Add'),
                    children: editSection1(locale, s),
                },
                {
                    key: SectionKey.editSection2,
                    title: getTranslation(locale, 'Clear'),
                    children: editSection2(locale, s),
                },
            ],
        },
        {
            key: CategoryKey.style,
            title: getTranslation(locale, 'Style'),
            sections: [
                {
                    key: SectionKey.styleSection1,
                    title: getTranslation(locale, 'Entity Style'),
                    children: styleSection1(locale, s),
                },
                {
                    key: SectionKey.styleSection2,
                    title: getTranslation(locale, 'Edge Style'),
                    children: styleSection2(locale, s),
                },
                {
                    key: SectionKey.styleSection3,
                    title: getTranslation(locale, 'Reset'),
                    children: styleSection3(locale, s),
                },
                // {
                //     key: SectionKey.styleSection4,
                //     title: getTranslation(locale, 'Time Series'),
                //     children: styleSection4(locale, s),
                // },
            ],
        },
        {
            key: CategoryKey.inspect,
            title: getTranslation(locale, 'Inspect'),
            sections: [
                {
                    key: SectionKey.inspectSection1,
                    title: getTranslation(locale, 'Zooming and Panning'),
                    children: inspectSection1(locale, s),
                },
                {
                    key: SectionKey.inspectSection2,
                    title: getTranslation(locale, 'Blueprint and Summary'),
                    children: inspectSection2(locale, s),
                },
                {
                    key: SectionKey.inspectSection3,
                    children: inspectSection3(locale, s),
                },
            ],
        },
        {
            key: CategoryKey.layout,
            title: getTranslation(locale, 'Layout'),
            sections: [
                {
                    key: SectionKey.layoutSection1,
                    children: layoutSection1(locale, s),
                },
                {
                    key: SectionKey.layoutSection2,
                    children: layoutSection2(locale, s),
                },
                {
                    key: SectionKey.layoutSection3,
                    title: getTranslation(locale, 'Alignment and Gap'),
                    children: layoutSection3(locale, s),
                },
            ],
        },
    ];
    return config;
}
