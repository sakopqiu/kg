import * as React from 'react';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';

import classNames from 'classnames';
import {getTranslation, Locales} from '../../../../utils';
import './index.scss';
import './tabs/collapse.scss';
import {CurrentSelection} from './tabs/CurrentSelection/CurrentSelection';
import {CommunityResult} from './tabs/community/CommunityResult';
import {observer} from 'mobx-react';
import {DisplayModeCanvasStore} from '../../stores/DisplayModeCanvasStore';
import {SophonTabs} from '../../../../components/SophonTab';

export interface DetailsPanelProps {
    mainStore: DisplayModeCanvasStore;
    locale: Locales;
    showCommunityPanel?: boolean;
}

@observer
export default class DetailsPanel extends React.Component<DetailsPanelProps> {
    private divRef: HTMLDivElement;

    constructor(props: DetailsPanelProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
    }

    get stateService() {
        return this.currentActiveStore.canvasDrawService.stateService;
    }

    get locale() {
        return this.props.locale;
    }

    get currentActiveStore() {
        return this.props.mainStore;
    }

    componentDidMount(): void {
        this.divRef.addEventListener('transitionend', this.handleResize);
    }

    componentWillUnmount() {
        this.divRef.removeEventListener('transitionend', this.handleResize);
    }

    private handleResize = () => {
        const s = (this.currentActiveStore!) as DisplayModeCanvasStore;
        s.cy.resize();
        this.currentActiveStore!.resizeListeners.forEach((listener: VoidFunction) => {
            listener();
        });
    }

    private toggle() {
        const s = (this.currentActiveStore!) as DisplayModeCanvasStore;
        s.toggleDetailsPanelCollapsed();
    }

    private getDivRef = (ref: HTMLDivElement) => {
        this.divRef = ref;
    }

    public render() {
        const s = (this.currentActiveStore!) as DisplayModeCanvasStore;
        const collapsed = s.detailsPanelCollapsed;

        const tabs = [
            {
                key: 'CANVAS_INFO',
                label: getTranslation(this.locale, 'Canvas Info'),
                content: <CurrentSelection mainStore={this.currentActiveStore}/>,
            },
        ];
        if (this.props.showCommunityPanel) {
            tabs.push(
                {
                    key: 'COMMUNITY_DISCOVERY',
                    label: getTranslation(this.locale, 'Community Result'),
                    content: <CommunityResult/>,
                },
            );
        }

        return (
            <div ref={this.getDivRef} className={classNames('canvas-details-panel', {collapsed})}>
                {collapsed ?
                    <div className='details-title'>
                        <Icon style={{cursor: 'pointer'}} type={'double-left'} onClick={this.toggle}/>
                    </div>
                    :
                    <React.Fragment>
                        <div className='details-title'>
                            <div>
                                {getTranslation(this.locale, 'Graph Results')}
                            </div>
                            <Icon style={{cursor: 'pointer', color: '#a2afbf'}} type={'double-right'}
                                  onClick={this.toggle}/>
                        </div>

                        {this.currentActiveStore && <SophonTabs
                            activeKey={this.stateService!.attributeTab}
                            onTabClick={(oldKey: string, newKey: string) => {
                                this.stateService!.setAttributeTab(newKey as any);
                            }}
                            tabs={tabs}
                        />}
                    </React.Fragment>
                }
            </div>
        );
    }
}
