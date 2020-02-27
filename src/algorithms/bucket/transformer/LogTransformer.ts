import {Transformer} from './Transformer';

export class LogTransformer extends Transformer {

    constructor(public base: number = 2) {
        super();
    }

    transform(val: number): number {
        return Math.log(val) / Math.log(this.base);
    }
}
