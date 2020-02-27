import React from 'react';
import AddAttributeTool from '../attribute/AddAttributeTool';
import ElementParams from './ElementParams';
import {observer} from 'mobx-react-lite';
import {AttributeFilter} from '../filter/AttributeFilter';
import {ElementParamsBaseProps} from '../../../../interfaces';
import {CyNodeData} from '../../../../model/CyNode';

interface INodeParamsProps extends ElementParamsBaseProps {
    elementData: CyNodeData;
}

function NodeParams(props: INodeParamsProps) {
    const {elementData, ...rest} = props;

    return (
        <>
            <AddAttributeTool
                {...rest}
                elementType={'vertex'}
                elementData={elementData as CyNodeData}
            />
            <AttributeFilter />
            <ElementParams {...rest} elementData={elementData as CyNodeData} elementType={'vertex'} />
        </>
    );
}

export default observer(NodeParams);
