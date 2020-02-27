// 所有sophon产品线的项目初始化的代码
import {Locales, useRouter} from '../utils';
import _get from 'lodash/get';
import _noop from 'lodash/noop';
import * as React from 'react';
import i18n, {TranslationFunction} from 'i18next';
import {RouteComponentProps} from 'react-router';
import {observer as hookObserver} from 'mobx-react-lite';
import 'core-js/stable/array/values';

type mountFn = () => any;

// 在数组的第index个位置把老元素替换为新元素，如果是inPlace，则对当前数组原地替换，不然返回一个新数组
export function replaceInArray(arr: any[], index: number, newEle: any, inPlace: boolean) {
    if (arr.length < index || index < 0) {
        throw new Error('Index指定超出数组范围');
    }

    if (inPlace) {
        arr.splice(index, 1, newEle);
        return arr;
    } else {
        return [
            ...arr.slice(0, index),
            newEle,
            ...arr.slice(index + 1),
        ];
    }
}

// 第一个参数是didMount，第二个参数是unMount
export function componentMount(onMountFn: mountFn, onUnmountFn: mountFn = _noop) {
    React.useEffect(() => {
        onMountFn();
        return onUnmountFn;
    }, []);
}

export type NonRequired<T> = {
    [K in keyof T]?: T[K];
};

// 不带路由属性
export interface BaseInjectHookProps<T = any> {
    i18n?: i18n.i18n;
    t?: TranslationFunction;
    locale?: Locales;
}

// 带路由属性
export interface BaseInjectAllHookProps<T= any> extends BaseInjectHookProps<T>, NonRequired<RouteComponentProps> {
    pid?: string; // sophonbase会使用的projectId
}

export function baseInjectHook<T extends BaseInjectHookProps = BaseInjectHookProps>
(component: React.FunctionComponent<T>): React.FunctionComponent<T> {
    return hookObserver((props: T) => {
        const enhancedProps = Object.assign({}, props,
            {i18n, t: i18n.t.bind(i18n), locale: i18n.language as Locales});
        const render = component(enhancedProps);
        return render;
    });
}

export function baseInjectAllHook<T extends BaseInjectAllHookProps = BaseInjectAllHookProps>
(component: React.FunctionComponent<T>): React.FunctionComponent<T> {
    return hookObserver((props: T) => {
        const routerContext: RouteComponentProps = useRouter();
        const pid = _get(routerContext, 'match.params.pid', '');
        const enhancedProps = Object.assign({}, props, routerContext,
            {i18n, pid, t: i18n.t.bind(i18n), locale: i18n.language as Locales});
        const render = component(enhancedProps);
        return render;
    });
}

// 标记模块是线上模式还是本地测试模式
export type RunningMode = 'online' | 'local';
export const RunningModeContext = React.createContext('local');
