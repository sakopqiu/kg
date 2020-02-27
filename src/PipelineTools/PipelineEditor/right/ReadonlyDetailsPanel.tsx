import * as React from 'react';
import 'antd/es/icon/style';
import Table from 'antd/es/table';
import 'antd/es/table/style';
import 'antd/es/col/style';
import {editCanvasInject, rightPanelWidth} from '../EditCanvasUtils';
import {getTranslation} from '../../../utils';
import '../../PipelineDisplay/right/DetailsPanel/index.scss';
import {EditModeCanvasComponent, IEditModeCanvasComponentProps} from '../components/EditModeCanvasComponent';
import './index.scss';
import {BlueprintFieldSchemaJson} from '../../common/interfaces';

@editCanvasInject
export default class ReadOnlyDetailsPanel extends EditModeCanvasComponent {

    constructor(props: IEditModeCanvasComponentProps) {
        super(props);
        this.toggle = this.toggle.bind(this);
    }

    private toggle() {
        this.currentActiveStore!.toggleDetailsPanelCollapsed();
        setTimeout(() => {
            this.currentActiveStore!.updateCanvasClientPosition();
        }, 100);
    }

    private renderAttrs() {
        const s = this.currentActiveStore!;
        const fieldAlias = this.fieldAlias.bind(this);

        const currObj = s.currentWidget || s.currentLink;
        if (currObj) {
            const columns = [{
                title: 'Column',
                dataIndex: 'column',
                width: 114,
                render: (value: string) => {
                    const name = fieldAlias(value);
                    return <span title={name}>{name}</span>;
                },
            },
                {
                    title: 'Type',
                    dataIndex: 'type',
                    width: 114,
                    render: (value: string) => {
                        return <span title={value}>{value}</span>;
                    },
                },
            ];

            const data: any[] = [];
            let counter = 0;
            const fields = currObj.getValue('fields') as BlueprintFieldSchemaJson[];

            if (fields) {
                for (const attr of fields) {
                    // arr 里三个值分别是 fieldName, fieldNameInDF, type
                    data.push({
                        key: counter++,
                        column: attr.fieldName,
                        type: attr.fieldType,
                    });
                }
            }
            return (
                <div>
                    <div style={{marginTop: 10, marginBottom: 10}}>{getTranslation(this.locale, 'Meta Info')}</div>
                    <Table bordered columns={columns} dataSource={data} pagination={false}/>
                </div>
            );
        }
        return <div className='select-sth'>{getTranslation(this.locale, 'Select sth')}</div>;
    }

    public render() {
        // 目前readonly暂时不支持collapse
        const width = rightPanelWidth(this.canvasConfig);
        return (
            <div style={{width}} className='widget-details-panel readonly-panel'>
                <div className='fields'>
                    {this.renderAttrs()}
                </div>
            </div>
        );
    }
}
