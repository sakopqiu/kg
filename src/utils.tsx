import _each from 'lodash/each';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import en from './t/en';
import zh from './t/zh';
import * as React from 'react';
import {AxiosError, AxiosPromise, Canceler} from 'axios';
import {LoadableStoreImpl, LoadingTargets, OperationNoticeTargets} from './stores/LoadableStoreImpl';

import message from 'antd/es/message';
import 'antd/es/message/style';

import {cacheUtils} from './cacheUtils';
import * as moment from 'moment';
import {NewElementLayoutConfig} from './PipelineTools/PipelineDisplay/model/CyState';
// @ts-ignore
import {__RouterContext, RouteComponentProps} from 'react-router-dom';
import {FILTER_ID} from './PipelineTools/PipelineDisplay/interfaces';
import _startsWith from 'lodash/startsWith';
import {toJS} from 'mobx';
import {TreeNodeNormal} from 'antd/es/tree/Tree';
import {SophonTheme} from './components/SophonThemeSelect/interface';
import {globalStore} from './business-related/stores/GlobalStore';

(window as any).toJS = toJS;

export type FunctionVariadic = (...args: any[]) => any;

export interface LocalContent {
    content: any;
    timestamp: number;
}

// 10/29/2019 starts to support 3d
export interface IPoint {
    x: number;
    y: number;
    z?: number;
}

export interface ILocation {
    latitude: number;
    longitude: number;
}

export interface IDimension {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ChangeMessageProps {
    message: string | React.ReactNode;
}

export type ValidateWay = 'require' | 'len' | 'format';

export enum Locales {
    'zh' = 'zh',
    'en' = 'en',
}

// sophon有些地方用Locale，有些Locales，这里为了更好的Backward Compatibility
export enum Locale {
    'zh' = 'zh',
    'en' = 'en',
}

export enum SortOrder {
    'ascend' = 'ascend',
    'descend' = 'descend',
}

export enum ListStyle {
    'LIST' = 'LIST',
    'CARD' = 'CARD',
}

export enum CopyMoveType {
    'MOVE' = 'MOVE',
    'COPY' = 'COPY',
}

export const MAX_NAME_LENGTH = 56;    // 名称的最大长度
export const MAX_DESC_LENGTH = 256;   // 描述的最大长度

export function trimStr(str: string, maxLength = 8) {
    if (!str) {
        return '';
    }
    str = str.trim();
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '..';
    }
    return str;
}

export function capitalize(str: string | null) {
    if (!str) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isNumberType(type: string | undefined | null) {
    if (!type) {
        return false;
    }
    type = type.toLowerCase();
    // 针对decimal, 后端会返回 decimal(30,xxxx) 类似
    return type === 'int' || type === 'integer' || type === 'long'
        || type === 'byte' || type === 'short' || type === 'double'
        || type === 'float' || type === 'number' || type === 'uint' || type === 'bigint' || _startsWith(type, 'decimal');
}

// 将decimal(30,0)转变成react-dnd的useDrop的accept所能理解的常量decimal
export function normalizeType(type: string) {
    const parenthesisIndex = type.indexOf('(');
    if (parenthesisIndex === -1) {
        return type;
    }
    return type.slice(0, parenthesisIndex);
}

export function isTimestamp(type: string | undefined | null) {
    if (!type) {
        return false;
    }
    type = type.toLowerCase();
    return type === 'datetime' || type === 'timestamp';
}

export function isTimeRelatedType(type: string | undefined | null) {
    if (!type) {
        return false;
    }
    type = type.toLowerCase();
    return type === 'date' || type === 'datetime' || type === 'timestamp';
}

// 从数字开头的字符串中提取数字,10px
export function extractNumeric(cssString: string | null): number {
    if (!cssString) {
        cssString = '0px';
    }
    return parseInt(cssString, 10);
}

// api返回的很多数字是string类型，为了workaround这种错误行为
// 如果确实是数字类型，就转一下,如果是时间(Date)，也会被转换成数字，不是的话，使用原来的类型
export function try2ConvertToNumber(value: any) {
    if (value === '') {
        return '';
    }
    if (isNaN(value)) {// "1234a","aaa"
        return value;
    } else {
        return +value; // "123",123
    }
}

export function jsonIgnore(...attributes: string[]) {
    return (classComponent: any) => {
        const prevToJson = classComponent.prototype.toJSON;
        classComponent.prototype.toJSON = function () {
            let result = null;
            if (prevToJson) {
                result = prevToJson.call(this, arguments);
            } else {
                result = Object.assign({}, this);
            }
            return _omit(result, attributes);
        };
        return classComponent as any;
    };
}

export function mtimeSorterConfig(locale: Locales) {
    return {
        defaultSortKey: 'modifyTimestamp',
        defaultSortDirection: SortOrder.descend,
        items: [
            {
                attr: 'modifyTimestamp',
                title: getTranslation(locale, 'MTime'),
                direction: SortOrder.descend,
            },
            {
                attr: 'modifyTimestamp',
                title: getTranslation(locale, 'MTime'),
                direction: SortOrder.ascend,
            },
        ],
    };
}

/**
 * utils中通用的i18n函数
 * @param {Locales} locale
 * @param {string} key i18n的key
 * @param {object} replacer， 如果翻译中有替换字符{{a}}，定义{a:"123"」会替换他
 * @returns {any} 翻译结果
 */
export function getTranslation(locale: Locales, key: string, replacer?: object) {
    let result = null;
    if (locale === 'en') {
        result = en[key] || key;
    } else {
        result = zh[key] || key;
    }
    if (replacer) {
        for (const k of Object.keys(replacer)) {
            const value = replacer[k];
            result = result.replace('{{' + k + '}}', value);
        }
    }
    return result;
}

export function defaulGetErrorMsg(error: AxiosError): string | React.ReactNode {
    const locale = getLocale();
    const err: any = error;
    let detail: boolean = false;
    if (err.stackTrace) {
        // 丰富错误显示
        detail = true;
    }
    let code = (_get(error, 'response.data.code') || error.code || '').toString();
    code = code.toLowerCase();
    // 第一种是符合sophon规范的错误，第二种是15F workflow的legacy code的模式
    const backendDefinedMsg =
        _get(error, 'response.data.msg') || _get(error, 'response.data.errorMessage', '') || _get(error, 'response.data.message', '');
    const msg = _get(error, 'message');
    const status = _get(error, 'response.status');
    let errMsg: string | React.ReactNode = '';
    if (msg === 'Network Error') {
        errMsg = getTranslation(locale, 'Network Error');
    } else if (msg === 'Not Implemented') {
        errMsg = getTranslation(locale, 'Not Implemented');
    } else if (status === 401) {
        errMsg = getTranslation(locale, 'Token expired');
    } else if (status === 403) {
        errMsg = getTranslation(locale, 'Permission denied');
    } else if (status === 404) {
        const gatewayName = err.config.url;
        const regex = /^\/gateway\/(\w+)?\//;
        if (regex.test(gatewayName)) {
            errMsg = getTranslation(locale, 'Api Service Not Available',
                {service: RegExp.$1});
        }
    } else if (status === 504 || status === 503) {
        errMsg = getTranslation(locale, 'Server is down');
    } else if (code === 'econnaborted' && msg.indexOf('timeout') !== -1) {
        errMsg = getTranslation(locale, 'Request Timeout');
    }
    if (!errMsg) {
        errMsg = backendDefinedMsg || msg || getTranslation(locale, 'API Error not defined');
    }
    if (detail) {
        errMsg = (
            <span>
        {errMsg}，
        <span style={{cursor: 'pointer', textDecoration: 'underline'}}>
          {getTranslation(locale, 'Show Detail')}
        </span>
      </span>
        );
    }
    return errMsg;
}

export const PATH_SEPERATOR = '/';
// 一种更不容易发生冲突的分隔符
export const PATH_SEPARATOR2 = '->';
export const ROOT_PATH = '/';
export const NAME_MAX_LEN: number = 56;
export const DESC_MAX_LEN: number = 256;
export const base64Reg: RegExp =
    /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;

// 如果val是A/B/C,separator是/, 那么返回A/B/C/,A/B, A
export function getHierarchyFromString(val: string, separator: string) {
    const paths = val.split(separator);
    const result = [];
    for (let i = 0; i < paths.length; i++) {
        result.push(paths.slice(0, i + 1).join(separator));
    }
    return result;
}

/**
 * 只允许大小写字母数字，中文开头结尾，特殊符号只允许-_.,其只能出现在中间
 * 不允许: _a, aa_, .a,
 * 允许 a_1-2.3_1 啊啊.23
 * @type {RegExp}
 */
export const NAME_REG: RegExp = /^([a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5\-\_\.]*[a-zA-Z0-9\u4e00-\u9fa5]+)$|^([a-zA-Z0-9\u4e00-\u9fa5])$/; // 文件名以大小写英文或数字开头结尾，仅允许使用-_.

export const validateCharLen = (value: string, locale: Locales, prefixStr: string = '', maxLen?: number) => {
    maxLen = maxLen || DESC_MAX_LEN;
    const errors: Error[] = [];
    if (value && value.length > maxLen) {
        errors.push(new Error(`${prefixStr}${getTranslation(locale, 'Exceeded character length limit', {maxLen})}`));
    }
    return errors;
};

export const validateName = (value: string, locale: Locales, prefixStr: string = '', ways?: ValidateWay[]) => {
    ways = ways && ways.length ? ways : ['require', 'len', 'format'];
    const errors: Error[] = [];
    for (const way of ways) {
        const errs: Error[] = validateNameStr(value, locale, way, prefixStr);
        if (errs && errs.length) {
            errors.push(...errs);
            break;
        }
    }
    return errors;
};

export const validateNameStr = (value: string, locale: Locales, way: ValidateWay, prefixStr: string = '') => {
    const errors: Error[] = [];
    switch (way) {
        case 'require': {
            !value && errors.push(new Error(`${prefixStr}${getTranslation(locale, 'Cannot be empty')}`));
            break;
        }
        case 'len': {
            const errs: Error[] = validateCharLen(value, locale, prefixStr, NAME_MAX_LEN);
            errors.push(...errs);
            break;
        }
        case 'format': {
            !value.match(NAME_REG) && errors.push(new Error(`${prefixStr}${getTranslation(locale, 'Name Reg Rule')}`));
            break;
        }
    }
    return errors;
};

export function extractBasePath(path: string) {
    const index = path.lastIndexOf(PATH_SEPERATOR);
    return path.substring(0, index);
}

export function extractNameFromPath(path: string) {
    const index = path.lastIndexOf(PATH_SEPERATOR);
    return path.substring(index + 1);
}

function _parentPrefix(parentPath: string, spaceRootPath?: boolean) {
    if (isRootPath(parentPath)) {
        // return PATH_SEPERATOR;
        // 对象存储系统需要mock新建文件夹,这时创建文件夹不会调获取列表接口 根目录下创建path为 '/新建文件夹' searchTreeNodeByAttribute无法找到,导致页面报错
        return spaceRootPath ? '' : PATH_SEPERATOR;
    }
    return parentPath + PATH_SEPERATOR;
}

export function newPath(parentPath: string, name: string, spaceRootPath?: boolean) {
    return _parentPrefix(parentPath, spaceRootPath) + name;
}

// 特征管理的根目录是/，而其他api的为空字符串
export function isRootPath(path: string) {
    return path === '/' || path === '';
}

export function isFirstLevel(path: string) {
    if (path.startsWith('/')) {
        return !isRootPath(path) && path.indexOf(PATH_SEPERATOR) === path.lastIndexOf(PATH_SEPERATOR);
    } else {
        return path.indexOf(PATH_SEPERATOR) === -1;
    }
}

/**
 * message过长时，展开和收起
 * @param {ChangeMessageProps} props
 * @returns {any}
 * @constructor
 */
export function ChangeMessage(props: ChangeMessageProps) {
    const [showAll, setShowAll] = React.useState(false);
    let needCut = false;
    if (typeof props.message === 'string') {
        needCut = props.message.length > 70;
    }

    return (
        typeof props.message === 'string' ?
            <span>
            {
                needCut ?
                    showAll ?
                        <span>
                        {`${props.message} `}
                            <a onClick={() => setShowAll(false)}>
                            {getTranslation(getLocale(), 'Collapse')}
                        </a>
                    </span> :
                        <span>
                        {`${props.message.slice(0, 70)}... `}
                            <a onClick={() => setShowAll(true)}>
                            {getTranslation(getLocale(), 'Show All')}
                        </a>
                    </span> :
                    <span>{props.message}</span>
            }
        </span> : <>{props.message}</>
    );
}

export function showError(s: string | React.ReactNode, duration: number = 4, toBottom: number = 70) {
    message.destroy();
    message.config({
        top: window.innerHeight - toBottom,
        duration,
    });
    console.error(s);
    message.error(<ChangeMessage message={s}/>);
}

export function showMessage(s: string | React.ReactNode, duration: number = 2, toBottom: number = 70) {
    message.destroy();
    message.config({
        top: window.innerHeight - toBottom,
        duration,
    });
    message.success(<ChangeMessage message={s}/>);
}

export function showInfo(s: string | React.ReactNode, duration: number = 2, toBottom: number = 70) {
    message.config({
        top: window.innerHeight - toBottom,
        duration,
    });
    message.info(<ChangeMessage message={s}/>);
}

export interface LoadingEffectOptions<T> {
    loadingTargetFunc?: (...args: any[]) => LoadingTargets;
    successMsgFunc?: (self: any, result: T) => string;
    suppressErrorMsg?: boolean; // 是否取消显示默认错误信息
    duration?: number; // 显示时长，默认2秒
    toBottom?: number; // 距离viewport底部距离
    mainStoreFunc?: (self: any) => LoadableStoreImpl;
}

export function loadingEffect<T = any>(target: LoadingTargets, options?: LoadingEffectOptions<T>): FunctionVariadic;
export function loadingEffect<T = any>(options?: LoadingEffectOptions<T>): FunctionVariadic;

export function loadingEffect<T = any>(target: any, options?: any): any {
    return function (prototype: any, name: string, descriptor: PropertyDescriptor) {
        const oldValue = descriptor.value;
        descriptor.value = function (this: any) {
            let realTarget: LoadingTargets;
            let realOptions: LoadingEffectOptions<T>;
            if (typeof target !== 'string') {
                realOptions = target;
                if (!realOptions.loadingTargetFunc) {
                    throw new Error('必须提供loadingTargetFunc');
                }
                realTarget = realOptions.loadingTargetFunc!.apply(this, arguments);
            } else {
                realTarget = target as LoadingTargets;
                realOptions = options || {duration: 3, toBottom: 70};
            }

            let mainStore: LoadableStoreImpl | null = null;
            if (realOptions.mainStoreFunc) {
                mainStore = realOptions.mainStoreFunc(this)!;
            } else {
                mainStore = this.mainStore!;
            }
            mainStore!.addLoadingTarget(realTarget);
            const promise = oldValue.apply(this, arguments) as Promise<any>;
            return promise
                .then(result => {
                    // 如果返回值不是false本身，才显示成功语句
                    if (result !== false && OperationNoticeTargets.includes(realTarget)) {
                        if (!realOptions.successMsgFunc) {
                            mainStore!.displaySuccess(realTarget, realOptions);
                        } else {
                            mainStore!.displayMessage(realOptions.successMsgFunc(this, result), realOptions);
                        }
                    }
                    return result;
                })
                .catch(err => {
                    // show error to user
                    if (!realOptions.suppressErrorMsg) {
                        mainStore!.displayError(err, realOptions);
                    }
                    throw err;
                })
                .finally(() => {
                    mainStore!.finishLoading(realTarget);
                });
        };
    };
}

export function saveToLocalStorage(itemName: string, content: any, timeoutMS: number = 0): void {
    let timestamp = 0;
    // timeoutMin = 0 indicates the content will not expire forever
    if (timeoutMS > 0) {
        timestamp = timeoutMS + new Date().getTime();
    }
    const contentWithTimeOut: LocalContent = {
        content,
        timestamp,
    };
    localStorage.setItem(itemName, JSON.stringify(contentWithTimeOut));
}

export function getFromLocalStorage<T>(itemName: string): T | undefined {
    const contentString = localStorage.getItem(itemName);
    if (!contentString) {
        return;
    }
    if (contentString) {
        const {content, timestamp} = JSON.parse(contentString) as LocalContent;
        if (timestamp === 0 || new Date().getTime() < timestamp) {
            return content;
        }
        // remove item if expired
        localStorage.removeItem(itemName);
        return undefined;
    }
    return undefined;
}

export function getLocale(): Locales {
    return cacheUtils.getLocale();
}

export function saveLocale(locale: Locales) {
    cacheUtils.saveLocale(locale);
}

export function isDebugMode() {
    return document.cookie.includes('debug');
}

export function debug(...s: string[]) {
    if (isDebugMode()) {
        /* tslint:disable-next-line */
        console.debug('debug info: ', ...s);
    }
}

// 什么都不干，为了side-effect而生
export function sideEffect(...val: any) {
}

export class HandledTime {
    time: Date;

    static display(time: Date | string | number) {
        return new HandledTime(time).display();
    }

    static duration(mss: number): string {
        const days = Math.floor(mss / (1000 * 60 * 60 * 24));
        const hours = Math.floor((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((mss % (1000 * 60)) / 1000);
        return getLocale() === 'zh'
            ? (days ? days + ' 天 ' : '') +
            (hours ? hours + ' 小时 ' : '') +
            (minutes ? minutes + ' 分钟 ' : '') +
            seconds +
            ' 秒 '
            : (days ? days + ` ${days > 1 ? 'days' : 'day'} ` : '') +
            (hours ? hours + ` ${hours > 1 ? 'hours' : 'hour'} ` : '') +
            (minutes ? minutes + ` ${minutes > 1 ? 'minutes' : 'minute'} ` : '') +
            seconds +
            ` ${seconds > 1 ? 'seconds' : 'second'} `;
    }

    constructor(time: Date | string | number, public isTimestamp: boolean = true) {
        if (time instanceof Date) {
            this.time = time;
        } else if (typeof time === 'string') {
            this.time = new Date(handleTimeString(time));
        } else {
            this.time = new Date(time);
        }
    }

    padZero(value: number): string {
        return `00${value}`.slice(-2);
    }

    getMounth(): string {
        return this.padZero(this.time.getMonth() + 1);
    }

    getDate(): string {
        return this.padZero(this.time.getDate());
    }

    getHours(): string {
        return this.padZero(this.time.getHours());
    }

    getMinutes(): string {
        return this.padZero(this.time.getMinutes());
    }

    getSecond(): string {
        return this.padZero(this.time.getSeconds());
    }

    display(): string {
        if (!this.time || isNaN(this.time.getTime())) {
            return '--';
        }
        if (this.isTimestamp) {
            return `
    ${this.time.getFullYear()}/${this.getMounth()}/${this.getDate()} \
    ${this.getHours()}:${this.getMinutes()}:${this.getSecond()}`;
        } else {
            return `${this.time.getFullYear()}/${this.getMounth()}/${this.getDate()}`;
        }
    }

}

export async function waitFor(milliseconds: number) {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
    await promise;
}

// 适用于所有基础类型的比较器，重写js sort方法的默认行为
export function normalComparator(val1: any, val2: any) {
    val1 = try2ConvertToNumber(val1);
    val2 = try2ConvertToNumber(val2);
    if (val1 < val2) {
        return -1;
    } else {
        return 1;
    }
}

// cytoscape对中文id支持不好，需要通过这种方式查出来
export function filterCommonId(id: string): FILTER_ID {
    if (!id.startsWith('[id=')) {
        return `[id="${id}"]`;
    }
    return id;
}

export function downloadFile(content: any, fileName?: string) {
    const aLink = document.createElement('a');
    let blob = null;
    if (!(content instanceof Blob)) {
        blob = new Blob([content]);
    } else {
        blob = content;
    }
    const evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true,
    });
    evt.initEvent('click', false, false);
    aLink.download = fileName || '';
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
}

export function requireCss() {
    // 图标的css文件
    require('./icon-fonts/style.css');
    // 定义了全局变量和css
    require('./global.scss');
    // 重写一些默认css
    require('./reset.scss');
    // 重写样式
    require('./index.scss');
    // 重写antd样式
    require('./themes/antd_reset.scss');
}

export function scrollPipeline(scrollDimension: IPoint) {
    const background = document.querySelector('.pipeline-background') as HTMLDivElement;
    if (background) {
        background.scrollLeft = scrollDimension.x;
        background.scrollTop = scrollDimension.y;
    }
}

export function binarySearch(list: any[], value: any) {
    // initial values for start, middle and end
    let start = 0;
    let stop = list.length - 1;
    let middle = Math.floor((start + stop) / 2);

    // While the middle is not what we're looking for and the list does not have a single item
    while (list[middle] !== value && start < stop) {
        if (value < list[middle]) {
            stop = middle - 1;
        } else {
            start = middle + 1;
        }

        // recalculate middle on every iteration
        middle = Math.floor((start + stop) / 2);
    }

    // if the current middle item is what we're looking for return it's index, else return -1
    return (list[middle] !== value) ? -1 : middle;
}

function paddingValue(val: number) {
    if (val < 10) {
        return '0' + val;
    }
    return val + '';
}

// 时间精度
// 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';
export type TimePrecision = moment.DurationInputArg2;

const DATE_PART_SPLITTER = '-';
const TIME_PART_SPLITTER = ':';

// 精度度从年开始一直到秒的格式
const YEAR_FORMAT = 'YYYY';
const MONTH_FORMAT = 'YYYY-MM';
const DAY_FORMAT = 'YYYY-MM-DD';
const HOUR_FORMAT = 'YYYY-MM-DD HH';
const MINUTE_FORMAT = 'YYYY-MM-DD HH:mm';
const SECOND_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const DEFAULT_DATE_FORMAT = DAY_FORMAT;
export const DEFAULT_TIMESTAMP_FORMAT = SECOND_FORMAT;

// 推荐使用的一个form布局
export const FORM_ITEM_DEFAULT_LAYOUT = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
    colon: false,
};

// api返回的时间会有firefox无法处理的格式，毫秒前跟随的是:而不是.
// 2018-01-02 11:22:32:123(incorrect)
// 2018-01-02 11:22:32.123(correct)
// ?:代表不获取该分组，因此最后的结果有2组，一组是毫秒之前的，一组是毫秒之后的
const timeRegex = /([\w\-\s]+?(?:\w+):(?:\w+):(?:\w+))(:\w+)/;

export function handleTimeString(timeString: string) {
    return timeString.replace(timeRegex, '$1');
}

const pureDigitTimeStr = /^(\d+)$/;

// todo 用moment的format替代下面的实现
export function normalizeTimeString(timeStr: string | number, timePrecision: TimePrecision) {
    if (typeof timeStr === 'string') {
        timeStr = handleTimeString(timeStr);
    }
    const d = typeof timeStr === 'string' && pureDigitTimeStr.test(timeStr) ? new Date(+timeStr) : new Date(timeStr);
    const year = d.getFullYear();
    const month = paddingValue(d.getMonth() + 1);
    const day = paddingValue(d.getDate());
    const hour = paddingValue(d.getHours());
    const minute = paddingValue(d.getMinutes());
    const second = paddingValue(d.getSeconds());

    switch (timePrecision) {
        case 'years':
            return `${year}`;
        case 'months':
            return `${year}${DATE_PART_SPLITTER}${month}`;
        case 'days':
            return `${year}${DATE_PART_SPLITTER}${month}${DATE_PART_SPLITTER}${day}`;
        case 'hours':
            return `${year}${DATE_PART_SPLITTER}${month}${DATE_PART_SPLITTER}${day} ${hour}`;
        case 'minutes':
            return `${year}${DATE_PART_SPLITTER}${month}${DATE_PART_SPLITTER}${day} ${hour}${TIME_PART_SPLITTER}${minute}`;
        case 'seconds':
            return `${year}${DATE_PART_SPLITTER}${month}${DATE_PART_SPLITTER}${day} ${hour}${TIME_PART_SPLITTER}${minute}${TIME_PART_SPLITTER}${second}`;
        default:
            throw new Error('Unknown time precision');
    }
}

export function getFormatByPrecision(timePresicion: TimePrecision) {
    switch (timePresicion) {
        case 'years':
            return YEAR_FORMAT;
        case 'months':
            return MONTH_FORMAT;
        case 'days':
            return DAY_FORMAT;
        case 'hours':
            return HOUR_FORMAT;
        case 'minutes':
            return MINUTE_FORMAT;
        case 'seconds':
            return SECOND_FORMAT;
        default:
            throw new Error('Not supported time precision ' + timePresicion);
    }
}

export function generateTimeGapBetween(fromStr: string, endStr: string, timePrecision: TimePrecision, inclusive: boolean = true) {
    if (fromStr === endStr) {
        return [fromStr];
    }

    const format = getFormatByPrecision(timePrecision);
    const from = moment(fromStr, format);
    const to = moment(endStr, format);
    if (to.isBefore(from)) {
        throw new Error('End str should be after or equal to fromStr');
    }

    let result = [];
    let curr = from;
    while (curr.isSameOrBefore(to, timePrecision)) {
        result.push(curr.format(format));
        curr = from.add(1, timePrecision);
    }
    if (!inclusive) {
        result = result.slice(0, result.length - 1);
    }
    return result;
}

// console.log(generateTimeGapBetween("2018-03-01", "2018-03-01", "days"));
// console.log(generateTimeGapBetween("2018-03-01", "2018-03-15", "days"));
// console.log(generateTimeGapBetween("2018", "2020", "years"));
// console.log(generateTimeGapBetween("2018-03", "2018-04", 'months'));
// console.log(generateTimeGapBetween("2018-03", "2019-02", "months"));
// console.log(generateTimeGapBetween("2018-03-02 11:22", "2018-03-02 11:25", "minutes"));
// console.log(generateTimeGapBetween("2018-03-02 11:22:23", "2018-03-02 11:22:27", "seconds"));

export function nextEventLoop(func: FunctionVariadic) {
    setTimeout(func); // cytoscape需要的dom节点需要在组件load完后才能获得
}

export async function untilNextLoop() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        });
    });
}

export async function waitForDomElement(id: string) {
    const start = performance.now();
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            const now = performance.now();
            if (now - start > 3000) {
                clearInterval(intervalId);
                reject(new Error('长时间无法加载到id为' + id + '的元素，请排查bug'));
                return;
            }

            if (!!document.getElementById(id)) {
                clearInterval(intervalId);
                resolve();
                return;
            }
        }, 50);
    });
}

export function disableOsDefault(e: React.MouseEvent<any> | KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
}

export const LAYOUT_ELEMENT_PADDING = 150;

export const CYTO_FIT_PADDING = 200;

export const CYTO_MAX_ZOOM = 3;

export const CYTO_MIN_ZOOM = 0.05;

export const DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG: NewElementLayoutConfig = {
    name: 'grid',
    padding: CYTO_FIT_PADDING,
    avoidOverlapPadding: LAYOUT_ELEMENT_PADDING,
    fit: false,
    nodeDimensionsIncludeLabels: true,
    spacingFactor: 1,
    animation: false,
    animationDuration: 200,
    animationEasing: 'ease-in-out',
};

export function parseMoment(value: string, truncateTime = false): moment.Moment | null {
    value = try2ConvertToNumber(value);

    // "", null ,undefined
    if (!value) {
        return null;
    }

    let result = null;
    // 字符串类型的时间表达，如 2019-05-01 12:22:22
    if (isNaN(value as any)) {
        result = moment(value);
    } else {
        result = moment(value, 'x');
    }
    if (truncateTime) {
        result = result.startOf('day');
    }
    return result;
}

export function spacingFactor(count: number) {
    if (count < 20) {
        return 1;
    } else if (count < 50) {
        return .8;
    } else if (count < 100) {
        return .5;
    }
    return .3;
}

export function getLayoutSpecificConfigs(name: string, nodeCount: number, extraOptions?: any) {
    if (name !== 'preset') {
        const option = {
            ...DEFAULT_NEW_ELEMENT_LAYOUT_CONFIG,
            fit: true,
            spacingFactor: 1.5,
        };
        let specificOption = {};
        if (name === 'springy' || name === 'cola') {
            specificOption = {
                maxSimulationTime: 1000,
            };
        }
        if (name === 'cose') {
            specificOption = {
                componentSpacing: 500,
            };
        }

        if (name === 'cose-bilkent') {
            specificOption = {
                componentSpacing: 500,
                idealEdgeLength: 500,
                // gravity: 1,
            };
        }
        // if ((name === 'circle' || name === 'concentric')) {
        //     specificOption = {
        //         spacingFactor: spacingFactor(nodeCount),
        //     };
        // }
        return {
            ...option,
            ...specificOption,
            ...(extraOptions || {}),
            name,
        };

    } else {
        return {
            name,
            fit: false,
            ...(extraOptions || {}),
        };
    }
}

export function leaveConfirmation(locale: Locales) {
    if (confirm(getTranslation(locale, 'Exit hint'))) {
        return true;
    } else {
        return false;
    }
}

export type supportedTypes = 'smallint' | 'bigint' | 'int' |
    'float' | 'double' | 'string' | 'date' | 'decimal' |
    'short' | 'byte' |
    'timestamp' | 'boolean' | 'binary' | 'tinyint';
export type inferTypes = supportedTypes | 'self';

export interface EntityJson {
    id: string;
    name: string;
    createTimestamp: number;
    modifyTimestamp: number;
}

const timesArrayCache: Map<number, number[]> = new Map<number, number[]>();

export function genNumberArr(times: number): number[] {
    if (timesArrayCache.has(times)) {
        return timesArrayCache.get(times)!;
    } else {
        const result = [];
        for (let i = 0; i < times; i++) {
            result.push(i);
        }
        timesArrayCache.set(times, result);
        return result;
    }
}

export function type(obj: any) {
    const toString = Object.prototype.toString;
    const map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object',
    };
    return map[toString.call(obj)];
}

// 生成模型过程中需要用到的，但是cytoscape实际不需要的都过滤掉
const skipKeys = new Set<string>([
    'classSet', 'params', 'cyState',
    'note', 'tags', 'rank', 'labelType', 'manualSize',
    'edgeGroupId', 'edgeIndex', 'weight']);

export function cytoCloneObj(src: object): any {
    const obj: any = {};
    for (const key in src) {
        // 过滤掉cytoscape不需要的属性
        if (skipKeys.has(key)) {
            continue;
        }
        const value = src[key];
        if (key === 'data') {
            obj[key] = cytoCloneObj(value);
        } else if (typeof value !== 'function') {
            obj[key] = value;
        }
    }
    obj['selected'] = (src as any).selected;
    return obj;
}

export function deepClone(obj: any, level: number) {
    if (level === 0) {
        return obj;
    }
    const t = type(obj);
    let o: any;
    if (t === 'array') {
        o = [];
    } else if (t === 'object') {
        o = {};
    } else {
        return obj;
    }

    if (t === 'array') {
        for (let i = 0, ni = obj.length; i < ni; i++) {
            o.push(deepClone(obj[i], level - 1));
        }
        return o;
    } else if (t === 'object') {
        const ownKeys = Reflect.ownKeys(obj);
        for (const key of ownKeys) {
            o[key] = deepClone(obj[key], level - 1);
        }
        return o;
    }
}

export function distance(p1: IPoint, p2: IPoint) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// camelCase，snakeCase，大小写全部忽略是否相同
// person_name,_person_name_,person__name,PersonName,personName,personname被认为是一致的
export function isSimilarString(val: string, val2: string) {
    val = val.toLowerCase();
    val2 = val2.toLowerCase();

    val = val.replace(/_/g, '');
    val2 = val2.replace(/_/g, '');
    return val === val2;
}

export function useForceUpdate() {
    const [, setTick] = React.useState(0);
    const update = React.useCallback(() => {
        setTick(tick => tick + 1);
    }, []);
    return update;
}

export function useRouter<T = any>() {
    const routerContext: RouteComponentProps<T> = React.useContext(__RouterContext);
    if (!routerContext) {
        throw new Error('Router context not found, upgrade to react-router-dom@^5 or higher');
    }

    const forceUpdate = useForceUpdate();
    // 路由发生变化了就强制刷新组件
    React.useEffect(() => {
        return routerContext.history.listen(forceUpdate);
    }, [routerContext]);

    return routerContext;
}

export type VoidFunction = () => void;

export const KEY_VALUE_SEPARATOR = '@@';

// 把数据根据KeyType分类成ContentType数组的工具类
export class Classifier<KeyType = any, ContentType = any> {
    private map: Map<KeyType, ContentType[]> = new Map<KeyType, ContentType[]>();

    add(ele: KeyType, value: ContentType) {
        const array: ContentType[] = this.map.get(ele) || [];
        array.push(value);
        this.map.set(ele, array);
        return array;
    }

    getResult() {
        return this.map;
    }

    // 当结果进行key的排序，in-place操作
    sortedResult(sorter?: (key1: KeyType, key2: KeyType) => number) {
        const origResult = this.getResult();
        const sortedKeys = sortArr(Array.from(origResult.keys()));
        const result = new Map<KeyType, ContentType[]>();
        for (const key of sortedKeys) {
            result.set(key, origResult.get(key)!);
        }
        return result;
    }
}

// 把数据根据KeyType进行分类后的计数器
export class Counter<KeyType = any> {
    private map: Map<KeyType, number> = new Map<KeyType, number>();

    add(ele: KeyType) {
        const count = this.map.get(ele) || 0;
        this.map.set(ele, count + 1);
    }

    getResult() {
        return this.map;
    }

    sortedResult(sorter?: (key1: KeyType, key2: KeyType) => number) {
        const origResult = this.getResult();
        const sortedKeys = sortArr(Array.from(origResult.keys()));
        const result = new Map<KeyType, number>();
        for (const key of sortedKeys) {
            result.set(key, origResult.get(key)!);
        }
        this.map = result;
        return result;
    }

    has(key: KeyType) {
        return this.map.has(key);
    }

    get keys() {
        return this.map.keys();
    }

    get(key: KeyType) {
        return this.map.get(key);
    }
}

// 如果key是number类型的string，转换成number后再比较大小
// 如果key是时间类型的string，转换成moment后再比较大小（暂未实现）
export function SophonDefaultSorter<KeyType>(ele1: KeyType, ele2: KeyType, order: SortOrder = SortOrder.ascend) {
    if (typeof ele1 === 'string') {
        ele1 = ele1.toLowerCase() as any;
    }
    if (typeof ele2 === 'string') {
        ele2 = ele2.toLowerCase() as any;
    }
    const ele1Num = try2ConvertToNumber(ele1);
    const ele2Num = try2ConvertToNumber(ele2);
    if (order === SortOrder.ascend) {
        return ele1Num < ele2Num ? -1 : 1;
    } else {
        return ele1Num < ele2Num ? 1 : -1;
    }
}

export function sortMapByKey<Key = any, Value = any>(map: Map<Key, Value>, sorter: (key1: Key, key2: Key) => number = SophonDefaultSorter) {
    const keys = sortArr(Array.from(map.keys()));
    const result = new Map<Key, Value>();
    for (const key of keys) {
        result.set(key, map.get(key)!);
    }
    return result;
}

export function sortArr<Key = any>(arr: Key[], sorter: (key1: Key, key2: Key) => number = SophonDefaultSorter) {
    return arr.sort(sorter);
}

export function formatNumber(n: number | string) {
    const _n = try2ConvertToNumber(n);
    const localedNumber = (Math.round(_n * 1000) / 1000).toLocaleString('us');
    return localedNumber === 'NaN' ? 'N/A' : localedNumber;
}

// browser compatibility
export function isChrome() {
    return !!((window as any).chrome) && navigator.userAgent.toLowerCase().indexOf('chrome') >= 0;
}

/**
 * 非ascii字符一个字符占据的空间不等长，这里将算出一个比较合理的长度
 */
export function getShownText(text: string, limit: number, enlargeCoefficient = 2) {
    let length = 0;
    let result = '';
    // shownLength 会把非ascii码长度当做2, ascii码长度为1
    _each(text, (char) => {
        const charCode = char.charCodeAt(0);
        if (charCode < 0 || charCode > 128) {
            length = length + enlargeCoefficient;
        } else {
            length++;
        }
        if (length <= limit) {
            result += char;
        } else {
            return false;
        }
        return;
    });
    return result;
}

export type ValidateFunc = (rule: any, value: any, callback: any, source?: any, options?: any) => any;

export function camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word: string, index: number) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

/**
 * 该方法的意义和下面这个方法一致
 * 这个方法读取的是Option的内容
 */
export function selectFilter(inputValue: string, option: any) {
    return (option.props.children as string || '').toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
}

/**
 * antd的Select控件为了使得showSearch有效果，需要配合实现filterOptions
 * 这里是一个简单实现，即当前某个Option的value包含了用户输入值时返回true（忽略大小写)
 * 该方法读取的是Option中的value值
 * @param {string} input 用户输入，string类型
 * @param option Select组件中的某个Option
 * @returns {any}
 */
export function antdSelectFilterOptions(input: string, option: any) {
    const optionValue = option.props.value;
    return optionValue.toLowerCase().includes(input.toLowerCase());
}

/**
 * 只要predicate不返回null，就执行第二个函数，并且把第一个函数的返回值当做输入
 * @param {() => any} predicate
 * @param {() => any} andThen
 */
export function doIf<T, R>(predicate: () => T | null, andThen: (param: T) => R, elseFunc?: () => R) {
    const result = predicate();
    if (result !== null) {
        return andThen(result);
    } else {
        if (elseFunc) {
            return elseFunc();
        } else {
            return null;
        }
    }
}

// 将equals=> =，greater_than=> >
export function conditionToAlgebra(val: string) {
    switch (val) {
        case 'equals':
            return '=='; // 没有用===，这样可以保证数字3和字符串3一致
        case 'not_equal':
            return '!=';
        case 'greater_or_equal':
            return '>=';
        case 'lower_or_equal':
            return '<=';
        case 'lower':
            return '<';
        case 'greater':
            return '>';
        default:
            return val;
    }
}

type CSVFormatArray = React.ReactText[][];

/**
 * 导出csv文件
 * @param data 导出的数据
 * @param name 导出的文件名
 * @param formatData 是否格式话数据，默认格式化，（解决数据在csv文件里科学计数法显示的问题）
 */
export function export2csv(data: string | CSVFormatArray, name: string, formatData: boolean = true) {
    const dataType = typeof data;
    let newData = '';

    // 导出数据为数字的，通过用=""包裹数字的方式来防止其位数过长而显示成科学计数法
    function transformData(data: string, formatData: boolean = true): string {
        if (!formatData) {
            return data;
        }
        const numberExp = /,\d+[\.\d+|\.\d+e\+\-\d+]+,/g;
        return (data as string).replace(numberExp, (str: string) => {
            return `,="${str.slice(1, -1)}",`;
        });
    }

    if (dataType === 'string') {                    // data 列以,分割，行以\n分割
        newData = transformData(data as string, formatData);
    } else if (dataType === 'object') {             // data 为 [][]格式
        (data as CSVFormatArray).forEach((row: React.ReactText[]) => {
            newData += `${row.join(',')}\n`;
        });
        newData = transformData(newData, formatData);
    } else {
        console.error(getTranslation(cacheUtils.getLocale(), 'Format Wrong'));
    }
    const downloadLink = document.createElement('a');
    const blobData = new Blob(['\ufeff' + newData], {type: '.csv,application/vnd.ms-excel,charset=utf-8'}); // \ufeff是BOM头，可以让excel等识别出csv文件的编码
    downloadLink.href = window.URL.createObjectURL(blobData);
    downloadLink.download = (name || 'temp') + '.csv';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

/**
 * 导出json文件
 * @param data 导出的数据,json格式的string
 * @param name 导出的文件名
 */
export function exportJson(data: string, name: string) {
    const blobData = new Blob([data]);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blobData);
    downloadLink.download = (name || 'temp') + '.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export const NameValidateRules = [{
    required: true, message: getTranslation(cacheUtils.getLocale(), 'Name is required'),
}, {
    max: MAX_NAME_LENGTH, message: getTranslation(cacheUtils.getLocale(), 'Name length must not exceed 56'),
}, {
    validator: (rule: any, value: any, callback: any) => {
        if (value && !/^[^\s]*$/.test(value.toString())) {
            callback(getTranslation(cacheUtils.getLocale(), 'Name cannot include whiteSpace'));
        } else {
            callback();
        }
    },
}];

export const DescValidateRules = [{
    max: MAX_DESC_LENGTH, message: getTranslation(cacheUtils.getLocale(), 'Description length must not exceed 256'),
}];

export function genNewName(prefix: string, currentNameSet: Set<string>) {
    let i = 1;
    while (true) {
        const newName = prefix + i;
        if (!currentNameSet.has(newName)) {
            return newName;
        }
        i++;
        if (i === 1000) {
            throw new Error('Failed to generate a new name');
        }
    }
}

export interface CancellableResponse<T> {
    responsePromise: AxiosPromise<T>;
    canceler: Canceler;
}

export interface Cancellable<T> {
    resultPromise: Promise<T>;
    canceler: Canceler;
}

/**
 * 根据叶子节点 key, 返回从根到它的路径
 * @param {string} keyId
 * @param {TreeNodeNormal[]} treeNodes
 * @returns {string[]}
 */
export const getPathFromTreeByKey = (keyId: string, treeNodes: TreeNodeNormal[]): string[] => {
    const treeNodeMap = new Map<string, TreeNodeNormal>();
    treeNodeMap.set('', {key: '_', title: '_'});
    searchInTree(keyId, '', [...treeNodes], treeNodeMap, true);
    const paths = treeNodeMap.keys();
    for (const path of paths) {
        const pathArr = path.split('/');
        if (Array.isArray(pathArr) && pathArr[pathArr.length - 1] === keyId) {
            if (path.indexOf('/') === 0) {
                return pathArr.slice(1);
            }
        }
    }
    return [];
};

/**
 * 在树形结构中搜关键字, 返回新的树
 * @param {string} searchKey  要搜索的关键字
 * @param {TreeNodeNormal[]}  树形结构的json
 * @returns {TreeNodeNormal[]} 树形结构的json
 */
export const getSearchedTree = (searchKey: string, treeNodes: TreeNodeNormal[]): TreeNodeNormal[] => {
    const treeNodeMap = new Map<string, TreeNodeNormal>();
    treeNodeMap.set('', {key: '_', title: '_'});
    searchInTree(searchKey, '', [...treeNodes], treeNodeMap);
    return treeNodeMap.get('')!.children || [];
};

/**
 * 在树形结构中搜关键字, 返回的新树存在最后的参数tMap中
 * @param {string} sk  要搜索的关键字
 * @param {string} path  当前节点的 path = parentkey/key (也是存储在map中的key)
 * @param {TreeNodeNormal[]} nodes 树形结构的json
 * @param {Map<string, TreeNodeNormal>} tMap 以 <路径,节点>的方式存储
 * @returns {boolean} 当前节点或其子节点匹配到关键字时返回 true
 */
export const searchInTree = (sk: string, path: string, nodes: TreeNodeNormal[], tMap: Map<string, TreeNodeNormal>, searchByKey?: boolean): boolean => {
    let found = false;
    const parentNode = tMap.get(path)!;
    nodes.forEach((node: TreeNodeNormal) => {
        const currentPath = `${path}/${node.key}`;
        let cNode = tMap.get(currentPath);
        const {children, ...rest} = node;
        if (!cNode) {
            // cNode最初时去掉children存储在tMap中,如果匹配到了才挂载到父节点的children中去
            cNode = {...rest} as TreeNodeNormal;
            tMap.set(currentPath, cNode);
        }
        if (typeof node.title === 'string' && !searchByKey ? node.title!.indexOf(sk) < 0 : (node.title!['key'] ? node.title!['key']!.indexOf(sk) < 0 : node.key.indexOf(sk) < 0)) {
            // 没有找到
            if (!node.isLeaf) {
                if (searchInTree(sk, currentPath, children || [], tMap)) {
                    // 当前节点的所有子节点中，只需有一个节点匹配到就返回true, 表示当前点节要挂载到父节点
                    found = true;
                    parentNode.children ? parentNode.children.push(cNode) : parentNode.children = [cNode];
                }
            }
        } else {
            // 找到
            searchInTree(sk, currentPath, children || [], tMap);
            found = true;
            parentNode.children ? parentNode.children.push(cNode) : parentNode.children = [cNode];
        }
    });
    return found;
};

/**
 * 在树形结构中匹配路径
 * @param {string[]} path 要匹配的路径
 * @param {any[]} tree 与路径相匹配的树
 * @param {(currentPath: string, index: number) => string} transformer 每一步匹配的路径的自定义转换
 * @param {string} idProps tree中路径的key，默认为path
 * @param {string} children tree中字节点的key，默认为children
 * @returns {boolean} 匹配成功返回true
 */
export function isPathInTree(
    path: string[],
    tree: any[],
    transformer?: (currentPath: string, index: number) => string,
    idProps: string = 'path',
    children: string = 'children',
) {
    let treeData = tree;
    for (let i = 1, len = path.length; i <= len; i++) {
        const rightComparator = transformer ? transformer(path[i], i) : path[i];
        const currentData = treeData && treeData.find((item) => item[idProps] === rightComparator);
        if (!currentData) {
            return false;
        } else {
            treeData = _get(currentData, children);
        }
    }
    return true;
}

/**
 * 获取当前主题
 * @returns {SophonTheme} 返回当前的主题
 */
export function getTheme(): SophonTheme {
    const body = document.getElementsByTagName('body')[0];
    return (body.getAttribute('data-theme') || SophonTheme.DEFAULT) as SophonTheme;
}

export function identityFunc<T = any>(obj: T): T {
    return obj;
}

/**
 * 判断字符是否为中文
 * @param {string} char 要判断的字符
 * @returns {boolean} 字符为中文返回true
 */
export function isZH(char: string = '') {
    return char.match(/[^\x00-\xff]/ig) != null;
}

/**
 * 获取字符串的显示字符，中文为2显示字符，其他为1显示字符
 * @param {string} str 要判断的字符
 * @returns {number} 显示字符数
 */
export function getByteLen(str: string = '') {
    let len: number = 0;
    for (let i = 0; i < str.length; i++) {
        const a = str.charAt(i);
        len += isZH(a) ? 2 : 1;
    }
    return len;
}

/**
 * 字符串在指定最大显示字符长度的省略效果（模拟css的ellipsis）
 * @param {string} str 待转换的字符串
 * @param {number} maxLen 最大显示字符长度
 * @returns {string} 转换后的字符串
 */
export function getFormatStr(str: string = '', maxLen?: number) {
    maxLen = maxLen || 13;
    return getByteLen(str || '') > maxLen ? `${getSubByte(str, 0, maxLen)}...` : str;
}

/**
 * 获取字符串指定显示字符长度的子串
 * @param {string} str 待获取子串的字符串
 * @param {number} start 指定字符串起始位置
 * @param {number} len 显示字符长度
 * @returns {string} 指定显示字符长度的子串
 */
export function getSubByte(str: string = '', start: number, len: number) {
    let chars: string = '';
    for (let i = start; i < str.length - 1, len > 0; i++) {
        const char: string = str.charAt(i);
        len -= isZH(char) ? 2 : 1;
        chars += char;
    }
    return chars;
}

/**
 * 将路径转为子路径的array，如 a/b/c/ => [a, a/b, a/b/c]
 * @param {string} str 待处理的字符串
 * @returns {string} 路径的array
 */
export function pathToHierachy(path: string): string[] {
    const paths = path.split('/');
    return paths.reduce((pre: string[], cur: string, index: number) => {
        if (index === 0) {
            return pre.concat(cur);
        } else {
            return pre.concat(`${pre[index - 1]}/${cur}`);
        }
    }, []);
}

/**
 * 切换主题
 * @param {SophonTheme} 需切换的主题
 * @param {(t: SophonTheme) => void} 切换主题后的回调
 */
export function changeTheme(t: SophonTheme, cb?: (t: SophonTheme) => void) {
    globalStore.setTheme(t);
    cb && cb(t);
    const body = document.getElementsByTagName('body')[0];
    body.setAttribute('data-theme', t);
}
