import {complexInject} from '../../../../DisplayCanvasUtils';
import * as React from 'react';
import {getTranslation} from '../../../../../../utils';
import {Community} from '../../../../model/Community';
import {CommunityMetaInfo} from '../CanvasMetaInfo/CommunityMetaInfo';
import {PlusIcon} from '../../../../../../icons/PlusIcon';
import './index.scss';
import 'antd/es/menu/style';
import '../../../../../../global.scss';
import {SophonSimpleCollapse} from '../../../../../../components/SophonCollapse/SophonSimpleCollapse';
import {ComplexModeCanvasComponent} from '../../../../components/complex/ComplexModeCanvasComponent';

const commonProperties = {
    onClickCenterElements: true,
    editable: true,
    inputWidth: 160,
};

@complexInject
export class CommunityResult extends ComplexModeCanvasComponent {

    private addCommunity = () => {
        this.stateService.communityService.addNewCommunity(this.locale);
    }

    renderCustomizedCommunities() {
        const communities = this.cyState.sortedCommunities;
        const customizedCommunities = communities.filter((c: Community) => !c.nodeType);

        return (
            <React.Fragment>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItem: 'center',
                    marginTop: 20,
                }}>
                <span className='community-discovery-title'>
                    {getTranslation(this.locale, 'Customized Community')}
                </span>
                    <div onClick={this.addCommunity} className='new-community'>
                        <PlusIcon style={{marginRight: 5, fontSize: 12}}/>
                        <span>{getTranslation(this.locale, 'New Community')}</span>
                    </div>
                </div>
                {customizedCommunities.map((community: Community) => {
                    return this.renderHierarchy(community);
                })}
            </React.Fragment>
        );
    }

    renderNodeTypesCommunities() {
        const communities = this.cyState.sortedCommunities;
        const nodeTypeCommunities = communities.filter((c: Community) => !!c.nodeType);

        let communityDivisionEvidence = '';
        if (nodeTypeCommunities.length > 0) {
            const first = nodeTypeCommunities[0];
            communityDivisionEvidence = `${first.nodeType} (${this.fieldAlias(first.clusterBy || '')})`;
        }
        return nodeTypeCommunities.length > 0 ?
            <React.Fragment>
                <div className='community-discovery-title' style={{marginTop: 10}}>
                    {getTranslation(this.locale, 'Community By')}:
                    <span style={{marginLeft: 5}}>{communityDivisionEvidence}</span>
                </div>
                {nodeTypeCommunities.map((community: Community) => {
                    return this.renderHierarchy(community);
                })}
            </React.Fragment>
            : null;
    }

    private renderHierarchy(community: Community) {
        if (community.childCommunities.length === 0) {
            return (
                <CommunityMetaInfo
                    {...commonProperties}
                    key={community.id}
                    community={community}/>
            );
        } else {
            return <SophonSimpleCollapse
                arrowPosition={'left-tick'}
                key={community.id}
                header={<CommunityMetaInfo
                    {...commonProperties}
                    key={community.id}
                    community={community}/>}>
                {community.childCommunities.map((c) => {
                    return this.renderHierarchy(c);
                })}
            </SophonSimpleCollapse>;
        }
    }

    render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }

        return (
            <div className='community-discovery-wrapper'>
                {this.renderNodeTypesCommunities()}
                {this.renderCustomizedCommunities()}
            </div>
        );
    }
}
