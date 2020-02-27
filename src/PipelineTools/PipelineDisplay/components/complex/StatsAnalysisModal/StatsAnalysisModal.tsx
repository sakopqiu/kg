import * as React from 'react';
import {SophonModal} from '../../../../../components/SophonModal';
import {getTranslation, Locales} from '../../../../../utils';
import {CanvasDrawService} from '../../../service/CanvasDrawService';
import {StatsAnalysis} from '../../../../../components/bi/StatsAnalysis/StatsAnalysis';
import {observer} from 'mobx-react-lite';

export interface StatsAnalysisModalProps {
    service: CanvasDrawService;
    locale: Locales;
    fieldsAlias: (val: string) => string;
}

function StatsAnalysisModalFunc(props: StatsAnalysisModalProps) {
    const {service, locale} = props;
    const statsStore = service.statsAnalysisStore;

    return <SophonModal
        className='stats-analysis-modal'
        width={'90%'}
        topPadding={35}
        bottomPadding={20}
        height='calc(100% - 55px)'
        footer={null}
        draggble
        cancelOption={{
            showCross: true,
            onCancel: () => {
                service.stateService.setShowStatsAnalysisModal(false);
            },
        }}
        locale={locale} title={getTranslation(locale, 'Stats Analysis')}
        showState={service.stateService.showStatsAnalysisModal}>
        <StatsAnalysis locale={locale} store={statsStore} fieldsAlias={props.fieldsAlias}/>
    </SophonModal>;

}

export const StatsAnalysisModal = observer(StatsAnalysisModalFunc);
