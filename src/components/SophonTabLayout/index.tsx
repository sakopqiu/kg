import React, {useCallback} from 'react';
import Tabs from 'antd/es/tabs';
import 'antd/es/tabs/style';
import {TabsProps} from 'antd/es/tabs';
import cs from 'classnames';
import './index.scss';
import {RouteComponentProps} from 'react-router';
import {ROOT_PATH, useRouter} from '../../utils';
import {cacheUtils} from '../../cacheUtils';

const TabPane = Tabs.TabPane;

export interface TabItem {
    key: string;
    title: React.ReactNode;
    disabled?: boolean;
    component?: React.ReactNode;
    forceRender?: boolean;
}

interface TabLayoutProps extends TabsProps {
    tabs: Array<TabItem | (React.ComponentType & TabItem)>;
    isPartPage?: boolean;
    mode?: 'hash' | 'url'; // 使用url中的hash或是url中的最后一部分来反映当前选择的是哪个tab
    baseUrl?: string; // mode为url时有效
    tabChangeCallback?: (activeKey: string) => void;
    destroyOnChange?: boolean;    // 每次切换tab是否销毁其他tab组件
}

function TabLayout(props: TabLayoutProps) {
    const routerContext: RouteComponentProps = useRouter();
    const mode = props.mode || 'hash';

    function parseDefaultActiveKey(mode: 'hash' | 'url') {
        if (mode === 'hash') {
            return routerContext.location!.hash.replace('#', '');
        } else {
            // 如果url为 /a/b/comp1,其中baseUrl为/a/b,
            // 那么结果为comp1
            // 如果url为 /a/b/comp1/subroute,其中baseUrl为/a/b,
            // 那么结果也为comp1
            let baseUrl = props.baseUrl || '';
            if (baseUrl[baseUrl.length - 1] !== '/') {
                baseUrl += '/';
            }
            const pathName = routerContext.location!.pathname;
            const startPos = pathName.indexOf(baseUrl) + baseUrl.length;
            let end = pathName.indexOf('/', startPos);
            if (end === -1) {
                end = pathName.length;
            }
            return pathName.slice(startPos, end);
        }
    }

    const defaultActiveKey = parseDefaultActiveKey(mode);

    const handleTabChange = useCallback((activeKey: string) => {
        const {match, history} = routerContext;
        if (mode === 'hash') {
            history!.push(`${match!.url}#${activeKey}`);
        } else {
            const lastSlashPos = match!.url.lastIndexOf('/');
            const newUrl = match!.url.slice(0, lastSlashPos) + '/' + activeKey;
            history!.push(newUrl);
        }
        cacheUtils.saveCurrentSelectedPath(ROOT_PATH);
        props.tabChangeCallback && props.tabChangeCallback(activeKey);
    }, [props.mode]);

    const {tabs, ...rest} = props;
    const otherProps = {} as any;
    if (defaultActiveKey && tabs.map(tab => tab.key).indexOf(defaultActiveKey) >= 0) {
        otherProps.defaultActiveKey = defaultActiveKey;
    }
    const classes = [props.className || ''];
    if (!props.isPartPage) {
        classes.unshift('tab-layout');
    }

    return (
        <Tabs
            animated={false}
            onTabClick={handleTabChange}
            {...rest}
            {...otherProps}
            className={`sophon-tab-layout ${cs(...classes)}`}
        >
            {tabs.map((item, index) => (
                <TabPane
                    forceRender={item.forceRender} disabled={item.disabled} key={item.key || '' + index}
                    tab={item.title || index}>
                    {props.destroyOnChange && props.activeKey !== item.key ? '' : (item.component || item)}
                </TabPane>
            ))}
        </Tabs>
    );
}

export default TabLayout;
