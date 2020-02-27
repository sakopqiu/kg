import * as React from 'react';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import Popover from 'antd/es/popover';
import 'antd/es/popover/style';

import './index.scss';
import {Community} from '../../../../model/Community';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {getTranslation} from '../../../../../../utils';
import EllipsisText from '../../../../../../components/EllipsisText';
import {SetupIcon} from '../../../../../../icons/SetupIcon';
import {CrossIcon} from '../../../../../../icons/CrossIcon';
import {TickIcon} from '../../../../../../icons/TickIcon';
import {ColorSquare} from '../../../../../../components/ColorSquare';

const MenuItem = Menu.Item;

export interface CommunityMetaInfoProps extends ComplexModeCanvasComponentProps {
    community: Community;
    editable?: boolean;
    inputWidth: number;
    onClickCenterElements: boolean; // 点击标签时是否居中社群元素
    readonly?: boolean;
}

interface CommunityMetaInfoState {
    isEditing: boolean;
    tempName: string;
}

@complexInject
export class CommunityMetaInfo extends ComplexModeCanvasComponent<CommunityMetaInfoProps, CommunityMetaInfoState> {
    state = {
        isEditing: false,
        tempName: '',
    };

    public constructor(props: CommunityMetaInfoProps) {
        super(props);
        this.selectCommunity = this.selectCommunity.bind(this);
        this.enterEditState = this.enterEditState.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.updateTempName = this.updateTempName.bind(this);
        this.updateCommunityName = this.updateCommunityName.bind(this);
        this.deleteCommunity = this.deleteCommunity.bind(this);
        this.showCommunity = this.showCommunity.bind(this);
        this.hideCommunity = this.hideCommunity.bind(this);
    }

    private selectCommunity() {
        if (this.props.onClickCenterElements) {
            this.selectionService.selectCommunity(this.props.community.id);
        }
    }

    private enterEditState() {
        this.setState({
            isEditing: true,
            tempName: this.props.community.simpleName,
        });
    }

    private cancelEdit() {
        this.setState({
            isEditing: false,
        });
    }

    private updateTempName(e: any) {
        this.setState({
            tempName: e.target.value,
        });
    }

    private updateCommunityName() {
        const newName = this.state.tempName.trim();
        if (newName) {
            this.props.community.setCustomizedName(newName);
        }
        this.setState({
            isEditing: false,
        });
    }

    private deleteCommunity() {
        const cid = this.props.community.id;
        this.stateService.communityService.deleteCommunityNode(cid);
    }

    private async showCommunity() {
        await this.visibilityService.setCommunityVisibility(this.props.community, true);
    }

    private async hideCommunity() {
        await this.visibilityService.setCommunityVisibility(this.props.community, false);
    }

    private renderMenu() {
        return (
            <Menu className='community-meta-info-menu'>
                <MenuItem onClick={this.enterEditState}>
                    {getTranslation(this.locale, 'Edit Community')}
                </MenuItem>
                <MenuItem onClick={this.deleteCommunity}>
                    {getTranslation(this.locale, 'Delete Community')}
                </MenuItem>
                {this.props.community.show ? <MenuItem onClick={this.hideCommunity}>
                        {getTranslation(this.locale, 'Hide Community')}
                    </MenuItem>
                    : <MenuItem onClick={this.showCommunity}>
                        {getTranslation(this.locale, 'Show Community')}
                    </MenuItem>
                }
            </Menu>
        );
    }

    public render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }
        const community = this.props.community;
        const count = this.cyState.cyNodesByCommunity(community.id).length;
        const color = community.show ? '#28374F' : '#A3AFC0';

        return (
            <div className='community-meta-info'>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <ColorSquare
                        style={{marginRight: 8}}
                        color={community.color}
                        nonClickable={!this.props.editable}
                        onSelected={async (color: string) => {
                            this.stateService.communityService.setCommunityColor(community, color);
                        }}
                    />
                    {
                        this.state.isEditing ?
                            <Input style={{width: this.props.inputWidth}} size={'small'}
                                   value={this.state.tempName}
                                   onChange={this.updateTempName}
                                   id={community.id + '-name'}
                                   autoFocus/>
                            :
                            <EllipsisText
                                className='community-name' onClick={this.selectCommunity}
                                style={{color}}
                                title={community.name + ' : ' + count}
                                noTrailing
                                mode={'dimension'}
                                text={community.simpleName}
                                length={143}/>
                    }
                </div>
                <div>
                    {!this.state.isEditing &&
                    <React.Fragment>
                        <span className='community-count'
                              style={{color}}
                        >{count}</span>
                        {!this.props.readonly && <Popover overlayClassName='community-meta-info-popover'
                                                          content={this.renderMenu()} placement='bottomLeft'
                                                          trigger={'click'}>
                            <SetupIcon className='setting-icon'
                                       style={{marginLeft: 24}}/>
                        </Popover>}
                    </React.Fragment>
                    }
                    {this.state.isEditing && <React.Fragment>
                        <CrossIcon
                            onClick={this.cancelEdit}
                            style={{marginLeft: 5, cursor: 'pointer'}}/>
                        <TickIcon
                            onClick={this.updateCommunityName}
                            style={{marginLeft: 8, cursor: 'pointer', fontSize: 14}}/>
                    </React.Fragment>}
                </div>
            </div>
        );
    }
}
