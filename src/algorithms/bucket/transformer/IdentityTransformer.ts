import {Transformer} from './Transformer';

export class IdentityTransformer extends Transformer {
    transform(val: any): any {
        return val;
    }
}
