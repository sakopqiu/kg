import * as React from 'react';
import './index.scss';

export interface PipelineFormElementProps {
    children: React.ReactNode;
}

// PipelineEditor右侧某个表单元素最好用这个包一下，形成统一的ui风格
export function PipelineFormElement(props: PipelineFormElementProps) {

    return (
        <div className='pipeline-form-element'>
            {props.children}
        </div>
    );
}
