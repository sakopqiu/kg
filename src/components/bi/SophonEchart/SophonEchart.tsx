import * as React from 'react';
import {GLOBAL_PALETTE} from '../bi-interface';
import * as echarts from 'echarts/lib/echarts';

import {debug} from '../../../utils';
import {globalStore} from '../../../business-related/stores/GlobalStore';
import {SophonTheme} from '../../SophonThemeSelect/interface';
import '../../../themes/echarts-themes/dark';
import {baseInjectHook, BaseInjectHookProps} from '../../../business-related/utils';

export interface SophonEchartProps {
    id: string;
    width?: number | string;
    height?: number | string;
    style?: React.CSSProperties;
    echartOptions: echarts.EChartOption;
}

export const SophonEchart = baseInjectHook((props: SophonEchartProps & BaseInjectHookProps) => {

    const echartInstance = React.useRef<echarts.ECharts>();
    const options = props.echartOptions;

    const echartConfig = React.useMemo(() => {
        const result = {
            color: GLOBAL_PALETTE,
            ...options,
        } as echarts.EChartOption;
        return result;
    }, [props]);

    debug(JSON.stringify(echartConfig, null, 2));

    const initEchart = React.useCallback(() => {
        const theme = globalStore.theme === SophonTheme.DARK ? 'dark' : '';
        echartInstance.current = echarts.init(document.getElementById(props.id) as HTMLDivElement, theme);
        echartInstance.current.setOption(echartConfig);
    }, [props]);

    const resizeFunc = React.useCallback(() => {
        echartInstance.current!.resize();
    }, []);

    React.useEffect(() => {
        initEchart();
        window.addEventListener('resize', resizeFunc);
        return () => {
            if (echartInstance.current) {
                echartInstance.current.dispose();
            }
            window.removeEventListener('resize', resizeFunc);
        };
    });

    const width = props.width || '';
    const height = props.height || '';

    return (
        <div id={props.id} style={{width, height, ...(props.style || {})}}/>
    );
});
