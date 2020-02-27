// 分桶用的临时对象
import {isNumberType, try2ConvertToNumber} from '../../utils';
import _isNil from 'lodash/isNil';

export class BucketInfo {
    size = 0;
    elements: any[]; // 相关联的对象，可存可不存

    constructor(public from: any, public to: any, public type: string) {
    }

    has(val: any) {
        if (_isNil(val) && _isNil(this.from) && _isNil(this.to)) {
            return true;
        }
        return val >= this.from && val <= this.to;
    }

    toString() {
        if (this.from === this.to) {
            return this.trim(this.from ? this.from.toString() : 'undefined');
        } else {
            return this.trim(this.from.toString()) + '~' + this.trim(this.to.toString());
        }
    }

    // 如果是数字，最多只保留三位
    private trim(val: string) {
        if (isNumberType(this.type)) {
            const num = try2ConvertToNumber(val);
            return (Math.round(num * 100000) / 100000).toString();
        } else {
            return val;
        }
    }
}
