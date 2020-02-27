import React, {useCallback, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import AttributeRow from '../attribute/AttributeRow';
import {NodeTypeLink} from '../label/NodeTypeLink';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';
import {CyNodeData} from '../../../../model/CyNode';
import {getTranslation, Locales, capitalize} from '../../../../../../utils';
import {CyState} from '../../../../model/CyState';
import {CanvasDrawService} from '../../../../service/CanvasDrawService';
import {TipsIcon} from '../../../../../../icons/TipsIcon';

interface INodeSummaryProps {
    node: CyNodeData;
    locale: Locales;
    cyState: CyState;
    service: CanvasDrawService;
    cy: any;
}

function NodeSummary(props: INodeSummaryProps) {
    const tags = useMemo(() => {
        const tags = (props.node.tags || []).map((tag: string) => {
            return <span className='kg-tag' key={tag}>{tag}</span>;
        });
        if (tags.length > 0) {
            return tags;
        } else {
            return null;
        }
    }, [props.node]);

    const communityLink = useMemo(() => {
        if (props.node.parent) {
            const community = props.cyState.getCommunityById(props.node.parent);
            return community ?
                (<span style={{color: '#599BE7', cursor: 'pointer'}}
                          onClick={(e: React.MouseEvent) => {
                              props.service.selectionService.selectCommunity(community.id, true, e);
                          }}
                    >
                    {capitalize(community.name)}
                </span>) : null;
        }
        return null;
    }, [props.node, props.cyState, props.service]);

    const renderDegree = useCallback(() => {
        if (!props.cy) {// 第一次页面加载的时候
            return null;
        }
        const node = props.cy.getElementById(props.node.id);

        return (
            <React.Fragment>
                <div className='degree-div'>
                    <span className='degree'>{getTranslation(props.locale, 'Outdegree')}</span>
                    <Popover placement={'bottom'}
                             content={<div
                                 className='tip-icon-wrapper'>{getTranslation(props.locale, 'Outdegree Hint')}</div>}>
                        <TipsIcon className='tip-icon'/>
                    </Popover>
                    <span className='colon'>:</span>
                    {node.outdegree(true)}
                </div>
                <div className='degree-div'>
                    <span className='degree'>{getTranslation(props.locale, 'Indegree')}</span>
                    <Popover placement={'bottom'} title={''}
                             content={<div
                                 className='tip-icon-wrapper'>{getTranslation(props.locale, 'Indegree Hint')}</div>}>
                        <TipsIcon className='tip-icon'/>
                    </Popover>
                    <span className='colon'>:</span>
                    {node.indegree(true)}
                </div>
            </React.Fragment>
        );
    }, [props.cy, props.locale, props.node]);

    return (
        <>
            <AttributeRow
                attrName={getTranslation(props.locale, 'Type')}
                attrValue={getTranslation(props.locale, 'Entities')}
            />
            <AttributeRow
                attrName={getTranslation(props.locale, 'Label')}
                attrValue={
                    <React.Fragment>
                        <div className='label-content'>
                            <NodeTypeLink
                                mainStore={props.service.canvasStore}
                                style={{marginRight: 10}} nodeTypeName={props.node.nodeType}/>
                            {tags}
                        </div>
                    </React.Fragment>
                }
            />
            {renderDegree()}
            {props.node.note && <AttributeRow
                attrName={getTranslation(props.locale, 'Note')}
                attrValue={props.node.note}
            />}
            {communityLink &&
            <AttributeRow
                spanCols={props.locale === 'zh' ? [4, 20] : [8, 16]}
                attrName={getTranslation(props.locale, 'Community')}
                attrValue={communityLink}
            />}
        </>
    );
}

export default observer(NodeSummary);
