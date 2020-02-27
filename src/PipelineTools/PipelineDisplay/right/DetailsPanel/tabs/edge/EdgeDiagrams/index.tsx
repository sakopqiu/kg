import React, {useCallback} from 'react';
import {EdgeDiagram} from './EdgeDiagram';
import {CyEdgeCommonData} from '../../../../../model/CyEdgeCommonData';
import {CyState} from '../../../../../model/CyState';
import {Locales} from '../../../../../../../utils';
import {SelectionService} from '../../../../../service/SelectionService';

interface IEdgeDiagrams {
    edges: CyEdgeCommonData[];
    cyState: CyState;
    locale: Locales;
    selectionService: SelectionService;
}

export function EdgeDiagrams(props: IEdgeDiagrams) {
    const proxyOnClick = useCallback((edgeId: string) => {
        props.selectionService.selectElementsByIds([edgeId]);
    }, [props.selectionService]);
    return (
        <div>
            {props.edges.map((edge) => {
                const sourceName = props.cyState.cyNode(edge.source)!.data.name;
                const targetName = props.cyState.cyNode(edge.target)!.data.name;
                return(
                    <EdgeDiagram
                        key={`${edge.id}`}
                        edge={edge}
                        sourceName={sourceName}
                        targetName={targetName}
                        locale={props.locale}
                        onClick={proxyOnClick}
                    />);
            })}
        </div>
    );
}
