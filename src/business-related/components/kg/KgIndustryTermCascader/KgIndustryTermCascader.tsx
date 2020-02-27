import * as React from 'react';
import {CascaderWithInput, CascaderWithInputProps} from '../../../../components/CascaderWithInput/CascaderWithInput';
import {getKgIndustryTermCascaderOptions} from '../../../../PipelineTools/PipelineDisplay/kg-interface';

export type KgIndustryTermCascaderProps = Pick<CascaderWithInputProps, Exclude<keyof CascaderWithInputProps, 'cascaderOptions'>>;

export function KgIndustryTermCascader(props: KgIndustryTermCascaderProps) {

    return (
        <CascaderWithInput
            {...props}
            cascaderOptions={getKgIndustryTermCascaderOptions()}/>
    );
}
