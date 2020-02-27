import _groupBy from 'lodash/groupBy';
import _toPairs from 'lodash/toPairs';
import _compact from 'lodash/compact';

// data 为原始数据, iteratee 为groupby properties, separator为multi properties group by 分隔符
export function groupBy(data: any[], iteratee: string[], separator: string = '/') {
    // 去除无用 iteratee
    return helper(_compact(iteratee), {'': data}, separator);
}

function helper(iteratee: string[], result: {}, separator: string): {} {
    if (iteratee.length === 0) {
        return result;
    }

    const pairs = _toPairs(result);
    const tempResult = pairs.reduce((tmp: any, pair: GroupPair) => {
        const subGroup = _groupBy(pair[1], iteratee[0]);
        const subPair = _toPairs(subGroup);
        subPair.forEach((sub) => {
            // group key 不存在 lodash 返回key为undefined
            // 使用时要注意
            const newKey = pair[0] ? `${pair[0]}${separator}${sub[0]}` : sub[0];
            tmp[newKey] = sub[1];
        });
        return tmp;
    }, {});

    return helper(iteratee.slice(1), tempResult, separator);
}

export type GroupPair = [string, any[]];
