import {inferTypes, Locales, supportedTypes} from '../../utils';
import {getRuleDef} from './rule_def';

export class ControlType {
    public name: string;
    public translation: string;
    public includes: supportedTypes[]; // [int, string...]
    public inferType: inferTypes;
    public onlyInComplexMode: boolean = false;

    constructor(json: any) {
        this.name = json.name;
        this.translation = json.translation;
        this.includes = json.includes;
        this.inferType = json.inferType;
        this.onlyInComplexMode = json.onlyInComplexMode;
    }
}

export class ConditionType {
    public name: string;
    public translation: string;
    public includes: supportedTypes[]; // [int, string...]
    public onlyInComplexMode: boolean = false;

    constructor(json: any) {
        this.name = json.name;
        this.translation = json.translation;
        this.includes = json.includes;
        this.onlyInComplexMode = json.onlyInComplexMode;
    }
}

const EnglishVersion = getRuleDef('en');
const ChineseVersion = getRuleDef('zh');

export class RuleDef {
    public supportTypes: supportedTypes[] = [];
    public controlTypes: ControlType[] = [];
    public conditionTypes: ConditionType[] = [];

    // 测试使用的数据
    public static engInstance = new RuleDef(Locales.en, false, EnglishVersion);
    public static engSimpleInstance = new RuleDef(Locales.en, true, EnglishVersion);
    public static chineseInstance = new RuleDef(Locales.zh, false, ChineseVersion);
    public static chineseSimpleInstance = new RuleDef(Locales.zh, true, ChineseVersion);

    public constructor(public locale: Locales,
                       public isSimple: boolean,
                       json: any) {
        this.supportTypes = json.supportTypes;
        this.controlTypes = json.controlTypes.map((t: any) => new ControlType(t));
        this.conditionTypes = json.conditionTypes.map((t: any) => new ConditionType(t));
    }

    public getControlInferredType(controlTypeName: string): inferTypes {
        for (const ct of this.controlTypes) {
            if (ct.name === controlTypeName) {
                return ct.inferType;
            }
        }
        throw new Error('Cannot find controlType configuration for ' + controlTypeName);
    }

    // 传入一个类型，返回他可以使用的操作
    // 比如说传入一个int，那么他可以使用的操作有[value(对自身取值),sin,cos
    // 传入一个string,可以取值length,
    public getAvailableControlTypes(type: supportedTypes): ControlType[] {
        return this.controlTypes.filter(ct => {
            if (!ct.includes.includes(type)) {
                return false;
            }
            return this.isSimple ? !ct.onlyInComplexMode : true;
        });
    }

    // 传入一个类型，返回他可以用于比较的运算
    // 比如说传入一个int，那么他可以用来做equals,lt,gt,gte等
    // 传入一个string,可以用作equals,lt,contains,not contains
    public getAvailableConditionTypes(type: supportedTypes): ConditionType[] {
        return this.conditionTypes.filter(ct => {
            if (!ct.includes.includes(type)) {
                return false;
            }
            return this.isSimple ? !ct.onlyInComplexMode : true;
        });
    }
}
