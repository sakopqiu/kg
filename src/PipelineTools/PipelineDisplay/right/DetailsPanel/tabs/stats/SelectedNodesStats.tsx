import * as React from 'react';
import {NodeTypeLink} from '../label/NodeTypeLink';
import Collapse from 'antd/es/collapse';
import 'antd/es/collapse/style';
import './index.scss';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {CyNodeData} from '../../../../model/CyNode';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {getTranslation} from '../../../../../../utils';
import {renderForNodeType} from '../../../../CanvasDrawUtils';

const CollapsePanel = Collapse.Panel;

export interface SelectedNodesStatsProps extends ComplexModeCanvasComponentProps {
    mainStore: DisplayModeCanvasStore;
    data: CyNodeData[];
}

@complexInject
export class SelectedNodesStats extends ComplexModeCanvasComponent<SelectedNodesStatsProps> {

    get currentActiveStore() {
        return this.props.mainStore;
    }

    render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }

        const nodesData = this.props.data;
        // 将选中的元素根据nodeType进行分组
        const map: Map<string, CyNodeData[]> = new Map<string, CyNodeData[]>();
        for (const data of nodesData) {
            const type = data.nodeType;
            let arr = map.get(type);
            if (!arr) {
                arr = [];
                map.set(type, arr);
            }
            arr.push(data);
        }

        // 渲染每一种类型的统计
        const typesInfo = Array.from(map.entries()).map((entry: any) => {
            const nodeType = entry[0];
            const data = entry[1];
            return <CollapsePanel
                header={<div>
                    <b>{getTranslation(this.locale, 'Label')}</b>:
                    <NodeTypeLink
                        mainStore={this.currentActiveStore!}
                        style={{marginLeft: 5}} nodeTypeName={nodeType}
                                  data={data}/>
                </div>} key={nodeType}>
                {renderForNodeType(this.currentActiveStore, nodeType, data)}
            </CollapsePanel>;
        });

        return (<div>
            <Collapse bordered={false}
                      className='node-stats-collapse' >
                {typesInfo}
            </Collapse>
        </div>);
    }
}
