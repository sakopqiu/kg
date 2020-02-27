// 某个类型的某个域的统计图
import * as React from 'react';
import {StatsBar, StatsBarItem} from './StatsBar';
import {
    ComplexModeCanvasComponent,
    ComplexModeCanvasComponentProps,
} from '../../../../components/complex/ComplexModeCanvasComponent';
import {FieldStat} from '../../../../service/StatisticsService';
import {CyNodeData} from '../../../../model/CyNode';
import {DisplayModeCanvasStore} from '../../../../stores/DisplayModeCanvasStore';
import {CyEdgeData} from '../../../../model/CyEdge';
import {complexInject} from '../../../../DisplayCanvasUtils';
import {BucketInfo} from '../../../../../../algorithms/bucket/BucketInfo';
import {HandledTime, isTimeRelatedType, isTimestamp} from '../../../../../../utils';

export interface FieldStatViewerProps extends ComplexModeCanvasComponentProps {
    stat: FieldStat;
    data: Array<CyNodeData | CyEdgeData>;
    mainStore: DisplayModeCanvasStore;
}

@complexInject
export class FieldStatViewer extends ComplexModeCanvasComponent<FieldStatViewerProps> {

    get currentActiveStore() {
        return this.props.mainStore;
    }

    constructor(props: FieldStatViewerProps) {
        super(props);
    }

    public render() {
        const stat = this.props.stat;
        const bucketInfos = stat.fieldInfo(this.stateService.communityService);
        const items = bucketInfos.map((b: BucketInfo) => {
            const type = b.type;
            const displayName = isTimeRelatedType(type) ?
                new HandledTime(b.from, isTimestamp(type)).display() : b.toString();
            return {
                name: displayName,
                title: displayName,
                size: b.size,
                data: b,
            };
        });

        return (
            <div style={{marginBottom: 10}}>
                <div><b>{this.fieldAlias(stat.fieldName)}</b></div>
                <StatsBar
                    items={items}
                    maxBarSize={150}
                    barContainerWidth={200}
                    onClick={(item: StatsBarItem) => {
                        const bucketInfo = item.data as BucketInfo;
                        const firstItem = this.props.data[0];
                        let ids: string[] = [];

                        if (firstItem instanceof CyNodeData) {
                            ids = this.props.data
                                .filter(n => {
                                    return bucketInfo.has(n.getValue(stat.fieldName));
                                })
                                .map(n => n.id);
                        } else if (firstItem instanceof CyEdgeData) {
                            // TODO!!!
                            ids = this.props.data
                                .filter(n => {
                                    return bucketInfo.has(n.getValue(stat.fieldName));
                                })
                                .map(n => n.id);
                        }
                        this.selectionService.selectElementsByIds(ids);
                    }}
                />

            </div>
        );
    }
}
