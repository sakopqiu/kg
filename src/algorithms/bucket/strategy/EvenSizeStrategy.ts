import {BucketInfo} from '../BucketInfo';
import {BucketStrategy} from './BucketStrategy';
import {normalComparator} from '../../../utils';
import _remove from 'lodash/remove';

// EvenSize会把数字均分成多个组，比如1,3,10,1000分两组，那么[1,3],[10,1000]
export class EvenSizeStrategy extends BucketStrategy {
    public generateBuckets(vals: any[], bucketCount: number, type: string) {
        if (vals.length === 0) {
            return [];
        }
        vals.sort(normalComparator);
        const valueSet = new Set<any>(vals);
        const buckets: BucketInfo[] = [];

        if (valueSet.has(undefined)) {
            buckets.push(new BucketInfo(undefined, undefined, type));
            _remove(vals, (val) => val === undefined);
        }

        if (valueSet.has(null)) {
            buckets.push(new BucketInfo(null, null, type));
            _remove(vals, (val) => val === null);
        }

        // 开始分桶，模式一，比如有1，2，3，4，5五个值，但是分桶数为2，那么[1,2]为一桶，[3,4,5]为一桶
        if (valueSet.size > bucketCount) {
            const step = Math.floor(vals.length / bucketCount);
            // 前bucketCount-1个桶可能平均包含step个数值，组红藕一个桶包含剩余的，
            // 这种分桶办法可能导致最后一个桶数值偏多
            for (let i = 0; i < bucketCount - 1; i++) {
                const newBucket = new BucketInfo(vals[i * step], vals[i * step + step - 1], type);
                buckets.push(newBucket);
            }
            // 最后一组做接盘侠
            const lastBucket = new BucketInfo(vals[(bucketCount - 1) * step], vals.slice(-1)[0], type);
            buckets.push(lastBucket);
        } else { // 模式2， 实际分桶数大于实际种类数，比如分100个桶，而实际却只有1，2，3，4，5五个值
            vals.forEach((val: any) => {
                const newBucket = new BucketInfo(val, val, type);
                buckets.push(newBucket);
            });
        }
        return buckets;
    }
}
