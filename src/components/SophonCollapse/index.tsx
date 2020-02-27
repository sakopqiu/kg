import './index.scss';
import React from 'react';
import Collapse from 'antd/es/collapse';
import 'antd/es/collapse/style';

import {observer} from 'mobx-react';
import {CollapseProps} from 'antd/es/collapse/Collapse';

export interface ISophonCollapseItem {
    title: React.ReactNode;
    id: string;
    panelContent: React.ReactNode;
}

export interface ISophonCollapseProps extends CollapseProps {
    data: ISophonCollapseItem[];
}

const Panel = Collapse.Panel;

@observer
export class SophonCollapse extends React.Component<ISophonCollapseProps> {
    public render() {
        const {data, className, ...rest} = this.props;
        return (
            <Collapse {...rest} className={`sophon-collapse ${className}`}>
                {data.map((item) => (
                    <Panel header={item.title} key={item.id}>
                        {item.panelContent}
                    </Panel>
                ))}
            </Collapse>
        );
    }
}
