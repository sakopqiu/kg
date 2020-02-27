import * as React from 'react';
import Checkbox from 'antd/es/checkbox';
import 'antd/es/checkbox/style';
import './index.scss';
import {CanvasStore} from '../CanvasStore';
import {EditModePipelineModel} from '../../../models/EditModePipelineModel';
import {DisplayModePipelineModel} from '../../../models/DisplayModePipelineModel';

// 放在moreBtn里的每一个item
export function CanvasTabMoreBtnItem(props: { isActive: boolean, store: CanvasStore }) {
    const pipeline = props.store.pipeline!;
    const parentStore = props.store.parent!;
    return (
        <div>
            <div className='tab-in-more-btn' onClick={() => {
                parentStore.switchTab(pipeline);
            }}>
                <div style={{width: 16}}>
                    {props.isActive && <Checkbox checked/>}
                </div>
                <span className='tab-name'>{pipeline.pipelineName}</span>
                <span
                    onClick={(e: any) => {
                        e.stopPropagation();
                        // 编辑模式下有脏检查，浏览模式下永远弹出警告框
                        if (
                            pipeline instanceof DisplayModePipelineModel
                            ||
                            (pipeline instanceof EditModePipelineModel && pipeline.dirty)) {
                            parentStore.setCurrentToBeClosedPipeline(pipeline);
                        } else {
                            parentStore.closeTab(pipeline);
                        }
                    }}
                    className='cross'>+</span>
            </div>
        </div>
    );
}
