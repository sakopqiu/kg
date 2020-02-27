import React, {useCallback, useMemo} from 'react';
import './index.scss';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import {CyEdgeCommonData} from '../../../../../model/CyEdgeCommonData';
import {getTranslation, Locales} from '../../../../../../../utils';

interface IEdgeDiagramProps {
    edge: CyEdgeCommonData;
    sourceName: string;
    targetName: string;
    locale: Locales;
    onClick: (edgeId: string) => void;
}

// 实体名称1 ---> 实体名称2
export function EdgeDiagram(props: IEdgeDiagramProps) {
    const overlay = useMemo(() => {
        return (
            <div className='edge-diagram-tooltip'>
                <div>{`${getTranslation(props.locale, 'Source')}: ${props.sourceName}`}</div>
                <div>{`${getTranslation(props.locale, 'Target')}: ${props.targetName}`}</div>
                <div>{`${getTranslation(props.locale, 'Edge')}: ${props.edge.name}`}</div>
            </div>
        );
    }, [props.edge, props.sourceName, props.targetName]);

    const onClick = useCallback(() => {
        props.onClick(props.edge.id);
    }, [props.edge, props.onClick]);

    return (
        <Tooltip placement='left' overlay={overlay}>
            <div className='edge-diagram-wrapper' onClick={onClick}>
                <div className='start'>{props.sourceName}</div>
                <div className='edge'>
                    <div className='edge-label'>{props.edge.name}</div>
                    <div className='edge-arrow' />
                </div>
                <div className='end'>{props.targetName}</div>
            </div>
        </Tooltip>
    );
}
