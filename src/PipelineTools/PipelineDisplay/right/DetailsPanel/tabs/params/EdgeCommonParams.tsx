import React from 'react';
import {observer} from 'mobx-react-lite';
import ElementParams from './ElementParams';
import AddAttributeTool from '../attribute/AddAttributeTool';
import {AttributeFilter} from '../filter/AttributeFilter';
import {ElementParamsBaseProps} from '../../../../interfaces';
import {CyState} from '../../../../model/CyState';
import {CyEdgeCommonData} from '../../../../model/CyEdgeCommonData';
import {CyEdgeGroupData} from '../../../../model/CyEdgeGroup';
import {SophonCollapse} from '../../../../../../components/SophonCollapse';
import {getTranslation} from '../../../../../../utils';
import {CyEdge, CyEdgeData} from '../../../../model/CyEdge';

interface IEdgeCommonParamsProps extends ElementParamsBaseProps {
    elementData: CyEdgeCommonData;
    cyState: CyState;
}

function EdgeCommonParams(props: IEdgeCommonParamsProps) {
    const {elementData, cyState, ...rest} = props;
    if (props.elementData instanceof CyEdgeGroupData) {
        const groupEdges = props.cyState.allCyEdgesByMEI(props.elementData.id);
        return (
            <div className='edge-group-detail-wrapper'>
                <div className='title'>{getTranslation(props.locale, 'Single Relationship Detail')}</div>
                <AttributeFilter/>
                <SophonCollapse data={
                    groupEdges.map((edge: CyEdge) => {
                        return {
                            id: edge.data.id,
                            title: `ID: ${edge.data.id}`,
                            panelContent: <ElementParams {...rest} elementType={'edge'} elementData={edge.data}/>,
                        };
                    })
                }/>
            </div>
        );
    } else {
        return (
            <>
                <AddAttributeTool
                    {...rest}
                    elementType={'edge'}
                    elementData={elementData as CyEdgeData}
                />
                <AttributeFilter/>
                <ElementParams {...rest} elementData={elementData as CyEdgeData} elementType={'edge'}/>
            </>
        );
    }
}

export default observer(EdgeCommonParams);
