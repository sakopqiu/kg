import * as React from 'react';
import './index.scss';

export interface ISectionComponentProps {
    title?: string;
}

/**
 * 上下结构，上层是粗体文字描述，下层是任意的ui组件
 */
export class SectionComponent extends React.Component<ISectionComponentProps> {
    public render() {
        return (
            <div className='section-component'>
                {this.props.title && <div className='section-component-title'>{this.props.title}</div>}
                <div className='section-component-content'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
