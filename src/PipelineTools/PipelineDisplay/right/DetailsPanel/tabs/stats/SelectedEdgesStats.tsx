import * as React from 'react';
import Collapse from 'antd/es/collapse';
import 'antd/es/collapse/style';
import './index.scss';
import {EdgeTypeLink} from '../label/EdgeTypeLink';
import {CyEdgeCommonData} from '../../../../model/CyEdgeCommonData';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {CyEdgeData} from '../../../../model/CyEdge';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {renderForEdgeType} from '../../../../CanvasDrawUtils';
import {getTranslation} from '../../../../../../utils';

const CollapsePanel = Collapse.Panel;

export interface SelectedEdgesStatsProps extends ComplexModeCanvasComponentProps {
    data: CyEdgeCommonData[];
    mainStore: DisplayModeCanvasStore;
}

@complexInject
export class SelectedEdgesStats extends ComplexModeCanvasComponent<SelectedEdgesStatsProps> {

    get currentActiveStore() {
        return this.props.mainStore;
    }

    render() {
        const s = this.currentActiveStore;
        if (!s) {
            return null;
        }

        const edgesData = this.props.data;
        // 将选中的元素根据label进行分组
        const map: Map<string, CyEdgeData[]> = new Map<string, CyEdgeData[]>();
        for (const data of edgesData) {
            const type = data.name;
            let arr = map.get(type);
            if (!arr) {
                arr = [];
                map.set(type, arr);
            }

            if (data instanceof CyEdgeData) {
                arr.push(data);
            } else {
                // 当前edgeGroup的id和所有cyState中edges的emi相匹配
                const groupData = this.cyState.cyEdges
                    .filter((e) => e.data.emi === data.id)
                    .map((e) => e.data);
                arr.push(...groupData);
            }
        }

        // 渲染每一种类型的统计
        const typesInfo = Array.from(map.entries()).map((entry: any) => {
            const label = entry[0];
            const data = entry[1];
            return <CollapsePanel
                header={<div>
                    <b>{getTranslation(this.locale, 'Label')}</b>:
                    <EdgeTypeLink
                        mainStore={this.currentActiveStore!}
                        style={{marginLeft: 5}}
                        label={label}
                        data={data}/>
                </div>} key={label}>
                {renderForEdgeType(this.currentActiveStore, label, data)}
            </CollapsePanel>;
        });

        return (<div>
            <Collapse bordered={false}
                      className='node-stats-collapse'>
                {typesInfo}
            </Collapse>
        </div>);
    }
}
