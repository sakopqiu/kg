import {BucketInfo} from '../BucketInfo';

export abstract class BucketStrategy {
    public abstract generateBuckets(vals: any[], bucketCount: number, type: string): BucketInfo[];
}
