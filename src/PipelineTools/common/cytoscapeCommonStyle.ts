import _times from 'lodash/times';
import {CyTheme} from '../PipelineDisplay/model/CyState';
// TODO 动态？ require 没法动态
import Default0Image1 from '../../images/kg/theme0/default/1.png';
import Default0Image2 from '../../images/kg/theme0/default/2.png';
import Default0Image3 from '../../images/kg/theme0/default/3.png';
import Default0Image4 from '../../images/kg/theme0/default/4.png';
import Account0Image1 from '../../images/kg/theme0/account/1.png';
import Account0Image2 from '../../images/kg/theme0/account/2.png';
import Account0Image3 from '../../images/kg/theme0/account/3.png';
import Account0Image4 from '../../images/kg/theme0/account/4.png';
import Company0Image1 from '../../images/kg/theme0/company/1.png';
import Company0Image2 from '../../images/kg/theme0/company/2.png';
import Company0Image3 from '../../images/kg/theme0/company/3.png';
import Company0Image4 from '../../images/kg/theme0/company/4.png';
import Character0Image1 from '../../images/kg/theme0/character/1.png';
import Character0Image2 from '../../images/kg/theme0/character/2.png';
import Character0Image3 from '../../images/kg/theme0/character/3.png';
import Character0Image4 from '../../images/kg/theme0/character/4.png';
import Location0Image1 from '../../images/kg/theme0/location/1.png';
import Location0Image2 from '../../images/kg/theme0/location/2.png';
import Location0Image3 from '../../images/kg/theme0/location/3.png';
import Location0Image4 from '../../images/kg/theme0/location/4.png';
import Document0Image1 from '../../images/kg/theme0/document/1.png';
import Document0Image2 from '../../images/kg/theme0/document/2.png';
import Document0Image3 from '../../images/kg/theme0/document/3.png';
import Document0Image4 from '../../images/kg/theme0/document/4.png';
import Industry0Image1 from '../../images/kg/theme0/industry/1.png';
import Industry0Image2 from '../../images/kg/theme0/industry/2.png';
import Industry0Image3 from '../../images/kg/theme0/industry/3.png';
import Industry0Image4 from '../../images/kg/theme0/industry/4.png';
import Organization0Image1 from '../../images/kg/theme0/organization/1.png';
import Organization0Image2 from '../../images/kg/theme0/organization/2.png';
import Organization0Image3 from '../../images/kg/theme0/organization/3.png';
import Organization0Image4 from '../../images/kg/theme0/organization/4.png';

import Character1Image from '../../images/kg/theme1/character.png';
import Company1Image from '../../images/kg/theme1/company.png';
import Default1Image from '../../images/kg/theme1/object.png';
import Account1Image from '../../images/kg/theme1/account.png';
import Organization1Image from '../../images/kg/theme1/organization.png';
import Document1Image from '../../images/kg/theme1/document.png';
import Location1Image from '../../images/kg/theme1/location.png';
import Industry1Image from '../../images/kg/theme1/industry.png';
import {IconConfig, IconType} from '../PipelineDisplay/interfaces';
import {KEY_VALUE_SEPARATOR} from '../../utils';

// 新加入的元素一开始会被隐藏
export const TEMP_HIDDEN_CLASS = 'temp-hidden-element';
export const NODE_FONT_COLOR = '#7FA5C2';
export const LINE_FONT_COLOR = NODE_FONT_COLOR;
export const LINE_COLOR = '#999999';
export const NODE_SELECTED_FONT_COLOR = '#2096F3';
export const SELECTED_BACKGROUND_COLOR = '#CFF0FF';
export const BACKGROUND_IMAGE_RATIO = '75%';
export const NODE_TEXT_MARGIN_Y = 6;
export const COUNT_PER_ROW = 8;
export const NODE_NORMAL_SIZE = 100;
export const NODE_MEDIUM_SIZE = 150;
export const NODE_LARGE_SIZE = 200;
export const SELF_LOOP_DIRECTION = 0;
export const SELF_LOOP_STEP_SIZE = 150;
export const EDGE_NORMAL_WIDTH = 1;
export const RECTANGLE_RADIUS = 40;
// 迭代次数，次数越多越平滑
export const RADIUS_ITERATION = 40;
export const FONT_FAMILY = 'arial, Helvetica';
export const TEMP_NODE_SIZE = 1; // 解决临时节点因background-width cyto内部报错问题
export const NUMBER_PRECISION = 3; // 解决部分浮点计算问题
const SHAPE_POLYGON_POINTS_CACHE: { [index: string]: number[] } = {};

export function getKgIconConfig(iconString: string): IconConfig {
    if (iconString) {
        // 规定存在graph meta里的icon string format 是 IconType@@Icon, 第一个值是IconType，第二个值是image folders下icon的文件名, 不包含后缀
        const [category, icon] = iconString.split(KEY_VALUE_SEPARATOR);
        return {
            category: category as IconType,
            icon: icon || '0', // 向下兼容， icon没给值默认取第一个icon样式
        };
    } else {
        return {
            category: 'default',
            icon: '0',
        };
    }
}

export function getIconImage(theme: CyTheme, iconType: IconType, value: string) {
    if (theme === 0) {
        return THEME_0_ICON_IMAGES[iconType][value] || Default0Image1;
    } else if (theme === 1) {
        return THEME_1_IMAGE_MAP[iconType];
    } else {
        throw new Error('Theme ' + theme + ' is not supported');
    }
}

export const THEME_0_ICON_IMAGES = {
    default: [Default0Image1, Default0Image2, Default0Image3, Default0Image4],
    account: [Account0Image1, Account0Image2, Account0Image3, Account0Image4],
    company: [Company0Image1, Company0Image2, Company0Image3, Company0Image4],
    person: [Character0Image1, Character0Image2, Character0Image3, Character0Image4],
    location: [Location0Image1, Location0Image2, Location0Image3, Location0Image4],
    document: [Document0Image1, Document0Image2, Document0Image3, Document0Image4],
    industry: [Industry0Image1, Industry0Image2, Industry0Image3, Industry0Image4],
    organization: [Organization0Image1, Organization0Image2, Organization0Image3, Organization0Image4],
};

// TODO theme 1还不支持 多样式
export const THEME_1_IMAGE_MAP = {
    default: Default1Image,
    person: Character1Image,
    company: Company1Image,
    account: Account1Image,
    location: Location1Image,
    organization: Organization1Image,
    industry: Industry1Image,
    document: Document1Image,
};

// TODO 构图目前不支持主题
export const DEFAULT_ICON_OPTIONS = (theme: CyTheme): IconOption[] => {
    return Object.keys(THEME_0_ICON_IMAGES).map((type) => ({
        category: type as IconType,
        icons: THEME_0_ICON_IMAGES[type].map((image: string, index: number) => ({
            value: `${index}`,
            image,
        })),
    }));
};

export interface IconOption {
    category: IconType;
    icons: Array<{
        value: string;
        image: string;
    }>;
}

export function getBackgroundIcon(iconString: string, theme: CyTheme = 0) {
    const iconConfig = getKgIconConfig(iconString);
    return getIconImage(theme, iconConfig.category, iconConfig.icon);
}

export function generateRadiusArray(radius: number, size: number, iteration: number, xSign: number, ySign: number) {
    const ratio = radius / size;
    let result: number[] = [];
    // + 1 是因为双闭区间
    _times(iteration + 1, (next) => {
        const segment = ratio * next / iteration;
        // x^2 + y^2 = ratio^2
        // js 浮点精度问题 会导致 y^2 是负数, 精度小于
        let yPower2 = ratio * ratio - segment * segment;
        if (Math.abs(yPower2) < Math.pow(0.1, NUMBER_PRECISION)) {
            // 小于误差值 认为等于0
            yPower2 = 0;
        }
        const point = [xSign * (1 - ratio + segment), ySign * (1 - ratio + Math.sqrt(yPower2))];
        // 乘积为-1需要转换 x， y坐标
        result = result.concat(xSign * ySign > 0 ? point : point.reverse());
    });
    return result;
}

export function getRoundRectangleArray(radius: number, size: number, iteration: number) {
    const cacheKey = `${radius}-${iteration}`;
    const cacheArray = SHAPE_POLYGON_POINTS_CACHE[cacheKey];
    if (cacheArray) {
        return cacheArray;
    }
    const leftBottomRadiusArray = generateRadiusArray(radius, size, iteration, -1, -1);
    // 对角只需要所有坐标乘以-1, 不用重新计算
    const rightTopRadiusArray = leftBottomRadiusArray.map((item) => item * -1);
    const leftTopRadiusArray = generateRadiusArray(radius, size, iteration, -1, 1);
    // 对角只需要所有坐标乘以-1, 不用重新计算
    const rightBottomRadiusArray = leftTopRadiusArray.map((item) => item * -1);
    const result = leftBottomRadiusArray.concat(rightBottomRadiusArray).concat(rightTopRadiusArray).concat(leftTopRadiusArray);
    SHAPE_POLYGON_POINTS_CACHE[cacheKey] = result;
    return result;
}
