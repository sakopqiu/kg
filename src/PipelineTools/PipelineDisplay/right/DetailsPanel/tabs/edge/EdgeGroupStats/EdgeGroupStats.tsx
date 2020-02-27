import * as React from 'react';
import {useCallback, useState} from 'react';
import './index.scss';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import 'antd/es/row/style';
import 'antd/es/col/style';
import {EdgesGroupByModal} from '../EdgesGroupBy/EdgesGroupByModal';
import {CyEdgeGroupData} from '../../../../../model/CyEdgeGroup';
import {getTranslation, isNumberType, Locales, try2ConvertToNumber} from '../../../../../../../utils';
import {CyEdge} from '../../../../../model/CyEdge';
import EllipsisText from '../../../../../../../components/EllipsisText';
import {EdgeSchema} from '../../../../../interfaces';
import {useOnChangeHandler} from '../../../../../../../components/SophonHooks/hookUtils';
import {AggregateType, doStatsCalculation} from '../../../../../../../BiUtils';
import {StatsTypeSelector} from '../../../../../../../components/bi/StatsTypeSelector/StatsTypeSelector';

export interface EdgeGroupStatsProps {
    eg: CyEdgeGroupData;
    locale: Locales;
}

// edge的schema
function schema(ed: CyEdgeGroupData) {
    const state = ed.cyState!;
    const store = state.drawService.canvasStore;
    return store.getEdgeSchema(ed.name)!;
}

function allNumericFieldNames(schema: EdgeSchema): string[] {
    return schema.fields.filter((f) => isNumberType(f.fieldType) && f.fieldName !== 'id').map((f) => f.fieldName);
}

const leftSpan = 16;
const rightSpan = 24 - leftSpan;

export function EdgeGroupStats(props: EdgeGroupStatsProps) {
    const [advancedVisible, setAdvancedVisible] = useState(false);
    const locale = props.locale;
    const eg = props.eg;
    const numericFieldNames = allNumericFieldNames(schema(eg));
    const stringFieldsNames = schema(eg).fields.filter((f) => f.fieldType === 'string' && f.fieldName !== 'id')
        .map(f => f.fieldName);
    const edges = eg.cyState!.allCyEdgesByMEI(eg.id);
    const [globalIndicator, setGlobalIndicator] = useOnChangeHandler<AggregateType>('SUM');
    const openAdvancedStatModal = useCallback(() => {
        setAdvancedVisible(true);
    }, []);
    const closeAdvancedStatModal = useCallback(() => {
        setAdvancedVisible(false);
    }, []);

    return (
        <div className='edge-group-stats'>
            {/*统计指标*/}
            <div className='stats-indicator'>
                <div className='stats-indicator-title'>
                    {getTranslation(locale, 'Stats Indicator')}
                </div>

                <StatsTypeSelector
                    locale={locale} className='main-selector'
                    value={globalIndicator}
                    onChange={setGlobalIndicator}
                />
                <div className='advanced-statistics'
                     onClick={openAdvancedStatModal}>{getTranslation(props.locale, 'AdvancedStats')}</div>
            </div>

            <div className='edge-group-stats-rows'>
                <Row className='edge-group-stats-rows-first'>
                    <Col span={24}>
                         <span>
                            {getTranslation(locale, 'Edge Count')}
                        </span>
                        <span>
                            {props.eg.childrenCount}
                        </span>
                    </Col>
                </Row>

                <Row className='edge-group-stats-rows-second'>
                    <Col span={leftSpan}>
                        {getTranslation(locale, 'Attr Indicator')}
                    </Col>
                    <Col span={rightSpan}>
                        {getTranslation(locale, 'Statistics')}
                    </Col>
                </Row>
                {numericFieldNames.map((name) => {
                    return (
                        <StatsIndicatorRow
                            key={name}
                            attr={name}
                            edges={edges}
                            globalIndicator={globalIndicator}
                            locale={locale}
                        />
                    );
                })}
            </div>
            <EdgesGroupByModal
                edges={edges}
                numericFields={numericFieldNames}
                stringFields={stringFieldsNames}
                show={advancedVisible}
                locale={props.locale}
                onClose={closeAdvancedStatModal}
            />
        </div>
    );
}

interface StatsIndicatorRowProps {
    attr: string;
    globalIndicator: AggregateType;
    edges: CyEdge[];
    locale: Locales;
}

function StatsIndicatorRow(props: StatsIndicatorRowProps) {
    const [innerGlobalIndicator, setInnerGlobalIndicator] = React.useState(props.globalIndicator);
    const [indicator, setIndicator] = useOnChangeHandler(props.globalIndicator);
    // props changed cause inner state to change
    if (innerGlobalIndicator !== props.globalIndicator) {
        setInnerGlobalIndicator(props.globalIndicator);
        setIndicator(props.globalIndicator);
    }

    const data = props.edges.map((e) => try2ConvertToNumber(e.data.getValue(props.attr)));

    const showResult = doStatsCalculation(data, indicator);
    return (
        !!showResult ? <Row className='indicator-row'>
            <Col span={leftSpan} className='left-col'>
                <EllipsisText text={props.attr} length={65} mode={'dimension'}/>
                <StatsTypeSelector
                    value={indicator}
                    locale={props.locale}
                    className='inner-selector'
                    onChange={setIndicator}
                />
            </Col>
            <Col span={rightSpan} className='right-col'>
                <div style={{overflowWrap: 'break-word', width: '100%'}}>
                    {showResult}
                </div>
            </Col>
        </Row> : null
    );

}
