import * as React from 'react';
import './index.scss';
import _find from 'lodash/find';
import _get from 'lodash/get';
import classNames from 'classnames';

export interface ISophonTab {
    key: string;
    label: string;
    content: React.ReactNode;
}

export interface ISophonTabsProps {
    tabs: ISophonTab[];
    onTabClick: (oldKey: string, newKey: string) => void;
    activeKey: string;
    className?: string;
    style?: React.CSSProperties;
}

interface SophonTabState {
    activeKey: string;
}

export class SophonTabs extends React.Component<ISophonTabsProps, SophonTabState> {

    constructor(props: ISophonTabsProps) {
        super(props);
    }

    private tuneMarkerPosition() {
        const label = document.querySelector('.sophon-tab-header-item.active .sophon-tab-header-item-label')! as HTMLDivElement;
        const marker = document.querySelector('.sophon-tab-header-item.active .sophon-tab-header-item-marker')! as HTMLDivElement;
        requestAnimationFrame(() => {
            // 可能tab为空
            if (!label || !marker) {
                return;
            }
            const labelWidth = label.getBoundingClientRect().width;
            const markerWidth = marker.getBoundingClientRect().width;
            marker.style.width = '25px';
            marker.style.transform = '';
            if (labelWidth < markerWidth) {
                marker.style.width = labelWidth + 'px';
            } else {
                marker.style.transform = `translateX(${(labelWidth - markerWidth) / 2}px)`;
            }
        });
    }

    componentDidUpdate() {
        this.tuneMarkerPosition();
    }

    componentDidMount() {
        this.tuneMarkerPosition();
    }

    public render() {
        const tabs = this.props.tabs || [];
        if (tabs.length === 0) {
            return null;
        }
        let activeTab: ISophonTab | undefined = _find(tabs, (t: ISophonTab) => t.key === this.props.activeKey);
        if (!activeTab) {
            activeTab = tabs[0];
        }
        const activeBody = activeTab.content;
        return (
            <div className={`sophon-tab ${this.props.className || ''}`} style={this.props.style}>
                <div className='sophon-tab-header'>
                    {tabs.map((tab: ISophonTab) => (
                        <div key={tab.key}
                             onClick={() => {
                                 if (this.props.activeKey !== tab.key) {
                                     this.props.onTabClick(this.props.activeKey, tab.key);
                                 }
                             }}
                             className={classNames('sophon-tab-header-item',
                                 {active: tab.key === this.props.activeKey})}>
                            <div className='sophon-tab-header-item-label'>
                                {tab.label}
                            </div>
                            <div className='sophon-tab-header-item-marker'/>
                        </div>
                    ))}
                </div>
                <div className='sophon-tab-body'>
                    {activeBody}
                </div>
            </div>
        );
    }
}
