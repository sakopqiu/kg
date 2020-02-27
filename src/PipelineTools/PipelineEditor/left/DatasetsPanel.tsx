import * as React from 'react';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
import Menu from 'antd/es/menu';
import 'antd/es/menu/style';
import DatasetMenuItem from './DatasetMenuItem';
import SvgWidgetDragLayer from './SvgDatasetDragLayer';
import CytoWidgetDragLayer from './CytoDatasetDragLayer';

import {getTranslation} from '../../../utils';
import {SophonSearch} from '../../../components/SophonSearch/index';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import {editCanvasInject, leftPanelCollapsedWidth, leftPanelWidth} from '../EditCanvasUtils';
import classNames from 'classnames';
import _get from 'lodash/get';
import {TreeFile, TreeFileBase, TreeFolder} from '../../../stores/TreeStore/TreeStoreModels';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

@editCanvasInject
export default class DatasetsPanel extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.clickSubMenu = this.clickSubMenu.bind(this);
        this.setSearchKey = this.setSearchKey.bind(this);
    }

    private toggle = () => {
        this.currentActiveStore!.toggleLeftPanelCollapsed();
        setTimeout(() => {
            this.currentActiveStore!.updateCanvasClientPosition();
        }, 100);
    }

    private setSearchKey(value: string) {
        const activeStore = this.currentActiveStore!;
        const newSearchKey = value.trim() as string;
        activeStore.datasetTree.setSearchKey(newSearchKey);
        if (newSearchKey === '') {
            activeStore.setOpenKeys([]);
            return;
        }

        activeStore.setOpenKeys(activeStore.datasetTree.eligibleOpenKeys);
    }

    private async clickSubMenu(param: any, TreeFolder: TreeFolder) {
        const s = this.currentActiveStore!;
        const key = param.key;
        if (s.openKeys.has(key)) {
            s.closeKey(key);
        } else {
            if (_get(this.canvasConfig!, 'events.onTreeFolderClicked')) {
                TreeFolder.setLoading(true);
                try {
                    await this.canvasConfig!.events!.onTreeFolderClicked!(TreeFolder);
                } catch (e) {
                    console.error(e);
                } finally {
                    TreeFolder.setLoading(false);
                }
            }
            s.addKey(key);
        }
    }

    private getFolderIcon(folder: TreeFolder) {
        if (folder.loading) {
            return <Icon type='loading'/>;
        }
        const customIcon = _get(this.canvasConfig, 'uiConfig.folderIcon');
        return customIcon ? customIcon(folder) : <Icon type='folder'/>;
    }

    private renderDirectory(level: number, directoryFiles: TreeFileBase[]) {
        const result: React.ReactNode[] = [];
        const s = this.currentActiveStore!;

        for (const file of directoryFiles) {
            if (!s.datasetTree.isElementVisible(file)) {
                continue;
            }
            if (file instanceof TreeFolder) {
                const children = this.renderDirectory(level + 1, file.children);
                result.push(
                    <SubMenu
                        className={'item-level-' + level}
                        key={file.key} title={
                        <span>
                            {this.getFolderIcon(file)}
                            <span>{file.name}</span>
                            </span>
                    }
                        onTitleClick={(params: any) => {
                            this.clickSubMenu(params, file);
                        }}>
                        {children}
                    </SubMenu>,
                );
            } else if (file instanceof TreeFile) {
                const customIcon = _get(this.canvasConfig, 'uiConfig.fileIcon');
                const fileIcon = customIcon ? customIcon(file) : <Icon type='file'/>;
                result.push(<MenuItem key={file.key} className={'item-level-' + level}>
                        <span style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                            {fileIcon}
                            <DatasetMenuItem dataset={file}/>
                        </span>
                </MenuItem>);
            }
        }
        return result;
    }

    public render() {
        const openKeys = this.currentActiveStore ? this.currentActiveStore.openKeys : [];
        const collapsed = this.currentActiveStore!.leftPanelCollapsed;
        const panelWidth = collapsed ? leftPanelCollapsedWidth() : leftPanelWidth(this.canvasConfig);
        let title: React.ReactNode = '';
        if (this.canvasConfig.widgetPanelTitle) {
            if (typeof this.canvasConfig.widgetPanelTitle === 'function') {
                title = this.canvasConfig.widgetPanelTitle!(this.mainStore.currentActiveStore!.pipeline!.toJson());
            } else {
                title = this.canvasConfig.widgetPanelTitle;
            }
        }
        return (
            <div style={{width: panelWidth}}
                 className={classNames('widget-panel', {collapsed})}>
                {collapsed ?
                    <div className='widget-selector-title'>
                        <Icon style={{cursor: 'pointer'}}
                              type={'double-right'}
                              onClick={this.toggle}/>

                    </div>
                    :
                    <React.Fragment>
                        <div className='widget-selector-title'>
                            <span>{title}</span>
                            <Icon style={{cursor: 'pointer'}}
                                  type={'double-left'}
                                  onClick={this.toggle}/>

                        </div>
                        <SophonSearch
                            style={{width: 160, marginLeft: 9}}
                            onChange={this.setSearchKey}
                            placeholder={getTranslation(this.locale, 'Search', {title: ''})}/>
                        <Menu
                            openKeys={Array.from(openKeys)}
                            className='widgets' mode='inline' style={{height: '100%'}}>
                            {this.renderDirectory(0, this.currentActiveStore ? this.currentActiveStore.datasetTree.rootChildren : [])}
                        </Menu>
                        {this.canvasConfig!.renderType === 'cyto'
                            ? <CytoWidgetDragLayer/> : <SvgWidgetDragLayer/>}
                    </React.Fragment>
                }
            </div>
        );
    }
}
