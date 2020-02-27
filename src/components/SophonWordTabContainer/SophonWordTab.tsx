import * as React from 'react';
import _find from 'lodash/find';
import classNames from 'classnames';
import './index.scss';
import Divider from 'antd/es/divider';
import 'antd/es/divider/style';
import {ArrowDownIcon} from '../../icons/ArrowDownIcon';

export interface ISophonWordTabContainerProps {
    tabsLeft?: React.ReactNode; // tabs左侧区域
    tabs: ISophonWordTab[];
    currentActiveTabKey: string;
    onTabClicked: (clickedTabKey: string) => any;
    collapseTab: boolean;
    onTabsToggled: (collapseTab: boolean) => any;
    disabled: boolean;
}

export interface ISophonWordTab {
    key: string;
    title: string;
    sections: React.ReactNode[];
}

interface ISophonWordTabProps {
    key: string;
    title: string;
    onClick: (clickedTabKey: string) => any;
    active: boolean;
    id: string;
    disabled: boolean;
}

// word风格的tab
export class SophonWordTabContainer extends React.Component<ISophonWordTabContainerProps> {
    public render() {
        const tabs = this.props.tabs;
        let currentActiveTabKey = this.props.currentActiveTabKey;
        let currentTab = _find(tabs, tab => tab.key === currentActiveTabKey);
        if (!currentTab) {
            currentActiveTabKey = tabs[0].key;
            currentTab = tabs[0];
        }
        const collapsed = this.props.collapseTab || this.props.disabled;
        return (
            <div className={classNames('sophon-word-tab-container', {collapsed})}>
                <div className='sophon-word-tabs-wrapper'>
                    {this.props.tabsLeft || null}
                    <div className='sophon-word-tabs'>
                        {tabs.map((tabConfig) => {
                            return (
                                <SophonWordTab
                                    disabled={this.props.disabled}
                                    onClick={this.props.onTabClicked}
                                    active={currentActiveTabKey === tabConfig.key}
                                    key={tabConfig.key}
                                    id={tabConfig.key}
                                    title={tabConfig.title}/>
                            );
                        })}
                        <div onClick={() => {
                            this.props.onTabsToggled(!this.props.collapseTab);
                        }} className='size-toggler-wrapper'>
                            <ArrowDownIcon
                                className={classNames('size-toggler', {collapsed})}/>
                        </div>
                    </div>
                </div>
                <div className='sophon-word-tab-content'>
                    {currentTab.sections.map((section, index) => (
                        <div className='sophon-word-tab-section' key={'section' + index}>
                            {section}
                            <Divider type='vertical'/>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

class SophonWordTab extends React.Component<ISophonWordTabProps> {
    render() {
        return (
            <div onClick={() => {
                if (this.props.disabled) {
                    return;
                }
                this.props.onClick(this.props.id);
            }} className={classNames('sophon-word-tab', {active: this.props.active, disabled: this.props.disabled})}>
                {this.props.title}
            </div>
        );
    }
}
