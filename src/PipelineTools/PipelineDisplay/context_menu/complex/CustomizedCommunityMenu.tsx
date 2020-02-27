import * as React from 'react';
import {complexInject} from '../../DisplayCanvasUtils';
import {Community} from '../../model/Community';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';

import {PositionHandler} from '../PositionHandler';
import {getTranslation} from '../../../../utils';
import {PlusIcon} from '../../../../icons/PlusIcon';
import {ComplexModeCanvasComponentProps} from '../../components/complex/ComplexModeCanvasComponent';
import {CommunityMetaInfo} from '../../right/DetailsPanel/tabs/CanvasMetaInfo/CommunityMetaInfo';

const RadioGroup = Radio.Group;

interface CustomizedCommunityMenuState {
    selectedValue: string;
}

@complexInject
export class CustomizedCommunityMenu extends PositionHandler<ComplexModeCanvasComponentProps, CustomizedCommunityMenuState> {

    constructor(props: ComplexModeCanvasComponentProps) {
        super(props);
        this.close = this.close.bind(this);
        this.move = this.move.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            selectedValue: '',
        };
    }

    private onChange(e: any) {
        this.setState({
            selectedValue: e.target.value,
        });
    }

    private close() {
        this.stateService.closeAllContextMenu();
    }

    private move() {
        const cid = this.state.selectedValue;
        this.stateService.elementService.moveToCommunity(cid);
        this.close();
    }

    private addCommunity = () => {
        this.stateService.communityService.addNewCommunity(this.locale);
    }

    public render() {
        const radioStyle = {
            height: '24px',
            lineHeight: '24px',
            padding: '4px 8px',
            marginRight: 0,
            boxSizing: 'content-box',
            display: 'flex',
            alignItems: 'center',
        } as any;

        const selectedCommunities = this.helperService.cyMovableCommunities();

        const communities = this.cyState.communities.filter((c) => {
            // 已经被选择的社群不能出现在列表中，不然会造成循环引用
            if (selectedCommunities.find(s => c.id === s.id)) {
                return false;
            }

            for (const s of selectedCommunities) {
                if (s.isAncestorOfCommunity(c)) {
                    return false;
                }
            }
            return true;
        });

        return (
            <div ref={this.ref}
                 style={{
                     left: this.stateService.canvasContextMenuX, top: this.stateService.canvasContextMenuY,
                     width: 247,
                     minHeight: 280,
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'space-between',
                 }}
                 className='customized-community-context-menu'>
                <div
                    style={{
                        margin: '8px auto',
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: 360,
                    }}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: 8, width: 208}}>
                        <span>{getTranslation(this.locale, 'Customized Community')}</span>
                        <div onClick={this.addCommunity} style={{color: '#549BE7', cursor: 'pointer'}}>
                            <PlusIcon style={{
                                marginRight: 5, fontSize: 12,
                            }}/>
                            <span>{getTranslation(this.locale, 'New Community')}</span>
                        </div>
                    </div>
                    {
                        communities.length > 0
                            ?
                            <RadioGroup value={this.state.selectedValue} onChange={this.onChange}>
                                <Radio key={'none'} value={''} style={radioStyle}>
                                    <div style={{display: 'inline-block', fontSize: 12, marginLeft: 5}}>
                                        {getTranslation(this.locale, 'No Community')}
                                    </div>
                                </Radio>
                                {communities
                                    .map((c: Community) => {
                                        return (
                                            <Radio key={c.id} value={c.id} style={radioStyle}>
                                                <div style={{display: 'inline-block'}}>
                                                    <CommunityMetaInfo
                                                        readonly
                                                        onClickCenterElements={false}
                                                        inputWidth={130} editable={false} community={c}/>
                                                </div>
                                            </Radio>
                                        );
                                    })}
                            </RadioGroup>
                            :
                            <div style={{
                                padding: 14,
                                margin: '0 auto',
                                textAlign: 'center',
                                position: 'relative',
                                top: '40px',
                            }}>{getTranslation(this.locale, 'No communities')}</div>
                    }
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 8,
                }}>
                    <Button onClick={this.close} size={'small'}>{getTranslation(this.locale, 'Cancel')}</Button>
                    <Button onClick={this.move} type={'primary'} size={'small'}
                            style={{marginLeft: 8}}>{getTranslation(this.locale, 'Confirm')}</Button>
                </div>
            </div>
        );
    }
}
