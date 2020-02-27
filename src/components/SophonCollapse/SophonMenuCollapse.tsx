import './index.scss';
import React from 'react';
import {observer} from 'mobx-react';
import {SophonCollapse} from './index';
import {CollapseProps} from 'antd/es/collapse/Collapse';
import './SophonMenuCollapse.scss';

export interface ISophonMenuCollapsePanel {
    title: React.ReactNode;
    id: string;
    name: string;
    menus: IMenuItem[];
}

export interface ISophonMenuCollapseProps extends CollapseProps {
    panels: ISophonMenuCollapsePanel[];
    accordion?: boolean;
    onMenuClick?: (panelKey: string, panelName: string, menuKey: string, menuName: string) => void;
    activePath?: string[]; // ['panelPath', 'MenuPath']
}

export interface IMenuItem {
    title: string | React.ReactNode;
    id: string;
}

interface IMenuPanelProps {
    items: IMenuItem[];
    onMenuClick?: (panelKey: string, panelName: string, menuKey: string, menuName: string) => void;
    panelId: string;
    panelName: string;
    selectedKey?: string;
}

@observer
export class SophonMenuCollapse extends React.Component<ISophonMenuCollapseProps> {
    public render() {
        const [panelPath = '', menuPath = ''] = this.props.activePath || [];
        const panels = this.props.panels.map((panel) => {
            const {id, title, name, menus} = panel;
            return {
                id,
                title,
                panelContent: (
                    <MenuPanel
                        key={id}
                        panelId={id}
                        panelName={name}
                        items={menus}
                        onMenuClick={this.props.onMenuClick}
                        selectedKey={panelPath === panel.id ? menuPath : undefined}
                    />
                ),
            };
        });
        return (
            <SophonCollapse
                destroyInactivePanel
                data={panels}
                {...this.props}
                className={`sophon-menu-collapse ${this.props.className}`}
                activeKey={panelPath ? [panelPath] : undefined}
            />
        );
    }
}

@observer
export class MenuPanel extends React.Component<IMenuPanelProps> {
    public render() {
        const {items, selectedKey} = this.props;
        return (
            <div className='menu-panel'>
                {items.map((item) => (
                    <div
                        className={`menu-panel-item ${selectedKey === item.id ? 'item-active' : ''}`}
                        onClick={() => this.handleMenuClick(item.id, typeof item.title === 'string' ? item.title : '')}
                        key={item.id}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        );
    }

    private handleMenuClick = (id: string, title: string) => {
        if (this.props.onMenuClick) {
            this.props.onMenuClick(this.props.panelId, this.props.panelName, id, title);
        }
    }
}
