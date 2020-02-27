import * as React from 'react';

import Cascader, {CascaderProps} from 'antd/es/cascader';
import 'antd/es/cascader/style';
import {getKgUnitCascaderOptions} from '../../../../PipelineTools/PipelineDisplay/kg-interface';

export type KgUnitCascaderProps = Pick<CascaderProps, Exclude<keyof CascaderProps, 'options'>>;

export function KgUnitCascader(props: KgUnitCascaderProps) {

    const displayRender = React.useCallback((labels: string[]) => {
        if (labels.length === 0) {
            return '';
        } else {
            // 只显示最后的单位
            return labels[1];
        }
    }, []);
    return (
        <Cascader
            placeholder={'无'}
            {...props}
            displayRender={displayRender}
            options={getKgUnitCascaderOptions()}/>
    );
}
