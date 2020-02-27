import {BucketInfo} from '../BucketInfo';
import {BucketStrategy} from './BucketStrategy';
import _times from 'lodash/times';
import _max from 'lodash/max';
import _min from 'lodash/min';

// EvenRange会把数字按照数值均分成多个组，比如1，3，10，1000，计算过程为
// (1000 - 1) / 2 = 499.5,小于499.5的一组，大于等于499.5的一组，[1,3,10],[1000]
export class EvenRangeStrategy extends BucketStrategy {
    public generateBuckets(vals: number[], bucketCount: number, type: string) {
        if (vals.length === 0) {
            return [];
        }
        const min = _min(vals)!;
        const max = _max(vals)!;

        const bucketsize = (max - min) / bucketCount;
        return _times(bucketCount, (index) => {
            return new BucketInfo(min + index * bucketsize, min + (index + 1) * bucketsize, '');
        });
    }
}
