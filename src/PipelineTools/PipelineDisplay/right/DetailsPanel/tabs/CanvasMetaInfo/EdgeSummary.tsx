import React from 'react';
import AttributeRow from '../attribute/AttributeRow';
import {EdgeTypeLink} from '../label/EdgeTypeLink';
import {CyEdgeCommonData} from '../../../../model/CyEdgeCommonData';
import {getTranslation, Locales} from '../../../../../../utils';
import {CyState} from '../../../../model/CyState';
import {CyEdgeGroupData} from '../../../../model/CyEdgeGroup';

interface IEdgeSummaryProps {
    edge: CyEdgeCommonData;
    locale: Locales;
    cyState: CyState;
}

export function EdgeSummary(props: IEdgeSummaryProps) {
    return (
        <>
            {(props.edge instanceof CyEdgeGroupData ) &&
            <AttributeRow
                attrName={getTranslation(props.locale, 'EdgeCount')}
                attrValue={props.edge.childrenCount}
            />
            }
            <AttributeRow
                attrName={getTranslation(props.locale, 'Type')}
                attrValue={getTranslation(props.locale, 'Edge')}
            />
            <AttributeRow
                attrName={getTranslation(props.locale, 'Label')}
                attrValue={
                    <React.Fragment>
                        <div className='label-content'>
                            <EdgeTypeLink label={props.edge.name}
                                          mainStore={props.cyState.drawService.canvasStore!}
                                      />
                        </div>
                    </React.Fragment>
                }
            />
        </>
    );
}
