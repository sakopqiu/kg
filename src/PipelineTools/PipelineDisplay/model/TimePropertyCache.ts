import _isNil from 'lodash/isNil';
import {CyElementData} from './CyElement';
import _every from 'lodash/every';
import {ElementType} from '../interfaces';

export class TimePropertyCache {
    // key是每个series的名字，比如 人-入学时间(vertex)， 购买-价格(edge)
    private innerMap: Map<string, TimePropertyCacheItem> = new Map<string, TimePropertyCacheItem>();

    public addItem(key: string, item: TimePropertyCacheItem) {
        this.innerMap.set(key, item);
    }

    public getItem(key: string): TimePropertyCacheItem | undefined {
        return this.innerMap.get(key);
    }

    public has(key: string) {
        return this.innerMap.has(key);
    }

    get seriesNames() {
        return Array.from(this.innerMap.keys());
    }

    public get items() {
        return Array.from(this.innerMap.values());
    }
}

// 该文件与echarts的显示有关，和cytoscape中的canvas显示无关
// 时间属性统计
export class TimePropertyCacheItem {
    public constructor(public type: ElementType, // 是边还是节点
                       public objName: string, // 节点类型或者边类型的名字，
                       public property: string) {// 比如雇员或者认识 节点或边的某个属性
    }

    // key是时间
    // 对于一个节点/边内的某个时间属性，比如学生的入学时间属性，可能存在2006，2007等多个数值，这个变量
    // 存储了 时间:数量 的键值对
    private innerMap: Map<string, CyElementData[]> = new Map<string, CyElementData[]>();

    get timeValues() {
        return Array.from(this.innerMap.keys());
    }

    public elementForTime(time: string) {
        const elements = this.innerMap.get(time);
        return elements ? elements : [];
    }

    public elementsForTime(time: string): CyElementData[] {
        return this.innerMap.get(time) || [];
    }

    get canonicalName() {
        return TimePropertyCacheItem.canonicalRepresentation(this.type, this.objName, this.property);
    }

    fill(time: string, ele: CyElementData) {
        let arr = this.innerMap.get(time);
        if (_isNil(arr)) {
            arr = [];
            this.innerMap.set(time, arr);
        }
        arr.push(ele);
    }

    static canonicalRepresentation(type: string, objName: string, property: string): string {
        return `${objName}:${property} (${type})`;
    }

    // 解析canonical名字
    static parseCName(cName: string) {
        const parts = cName.split(' ');
        const [objName, property] = parts[0].split(':');
        const type = parts[1].replace(/\(|\)/g, '') as ElementType;
        return {
            objName,
            property,
            type,
        };
    }
}

export class Series {
    public data: CyElementData[][] = [];

    constructor(public seriesName: string) {

    }

    get isEmpty() {
        return _every(this.data, (ele: CyElementData[]) => ele.length === 0);
    }
}
