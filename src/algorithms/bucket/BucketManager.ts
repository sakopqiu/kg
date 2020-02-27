import {BucketInfo} from './BucketInfo';
import {BucketStrategy} from './strategy/BucketStrategy';
import {Transformer} from './transformer/Transformer';
import _findIndex from 'lodash/findIndex';
import _find from 'lodash/find';
import {EvenSizeStrategy} from './strategy/EvenSizeStrategy';
import {IdentityTransformer} from './transformer/IdentityTransformer';

export class BucketManager {
    bucketInfos: BucketInfo[];

    public constructor(public strategy: BucketStrategy = new EvenSizeStrategy(),
                       public transform: Transformer = new IdentityTransformer()) {

    }

    // 查看当前元素被分在了哪个bucketInfo
    public getBucketPositionForElement(val: any) {
        return _findIndex(this.bucketInfos, (info: BucketInfo) => {
            return info.has(this.transform.transform(val));
        });
    }

    public getBucketForElement(val: any) {
        return _find(this.bucketInfos, (info: BucketInfo) => {
            return info.has(this.transform.transform(val));
        });
    }

    public generateBuckets(vals: any[], bucketCount: number, type: string): BucketInfo[] {
        // 首先对值进行transform
        vals = vals.map((val: any) => {
            return this.transform.transform(val);
        });

        this.bucketInfos = this.strategy.generateBuckets(vals, bucketCount, type);
        return this.bucketInfos;
    }
}
