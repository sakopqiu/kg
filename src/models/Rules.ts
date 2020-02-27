import {action, computed, observable} from 'mobx';
import _remove from 'lodash/remove';
import {RuleGuardDirection} from '../AttributeSelector/RuleGuard';
import _findIndex from 'lodash/findIndex';
import {AttributeSelectorStore} from '../stores/AttributeSelectorStore';
import {globalStore} from '../business-related/stores/GlobalStore';
import {SophonTheme} from '../components/SophonThemeSelect/interface';

export abstract class RuleBase {
    parent: RuleGroup | null;
    public id: string;

    constructor(public mainStore: AttributeSelectorStore) {
    }

    @action
    public remove() {
        if (this.parent) {
            _remove(this.parent.ruleChildren, (c: RuleBase) => c === this);
            return this;
        }
        return this;
    }

    @action
    public move(referenceObj: RuleBase, direction: RuleGuardDirection) {
        // 先从本身的父节点中去除，然后设置新的父节点（好比设置一个新家）
        this.remove();
        const newHome = referenceObj.parent!.ruleChildren;
        this.parent = referenceObj.parent;
        if (direction === RuleGuardDirection.UPPER) {
            newHome.unshift(this);
        } else if (direction === RuleGuardDirection.LOWER) {
            const refObjIndex = _findIndex(newHome, (c) => c === referenceObj);
            newHome.splice(refObjIndex + 1, 0, this);
        } else if (direction === RuleGuardDirection.FIRST_CHILD) {
            (referenceObj as RuleGroup).ruleChildren.push(this);
            this.parent = (referenceObj as RuleGroup);
        }
    }

    abstract get withOutline(): boolean;

    @computed
    get hasUpwardOutline() {
        return this.withOutline && !this.isFirstChild;
    }

    @computed
    get hasDownwardOutline() {
        return this.withOutline && !this.isLastChild;
    }

    @computed
    get isFirstChild() {
        return this.parent && this.parent.ruleChildren[0] === this;
    }

    @computed
    get isLastChild() {
        return this.parent && this.parent.ruleChildren[this.parent.ruleChildren.length - 1] === this;
    }

    @computed
    get isSingleChild() {
        return this.parent && this.parent.ruleChildren.length === 1;
    }

    public toJson(): any {
        throw new Error('children should implement this');
    }

}

export class Rule extends RuleBase {
    static genId = 0;
    public parent: RuleGroup;

    constructor(parent: RuleGroup) {
        super(parent.mainStore);
        this.id = '' + Rule.genId++;
        this.parent = parent!;
    }

    @computed
    get withOutline(): boolean {
        return !this.isSingleChild;
    }
}

export enum AndOr {
    'AND' = 'and',
    'OR' = 'or',
}

export abstract class RuleGroup extends RuleBase {
    static genId = 0;
    public parent: RuleGroup | null;
    @observable public andOr: AndOr = AndOr.AND;
    @observable ruleChildren: RuleBase[] = [];

    constructor(parent: RuleGroup | null, mainStore: AttributeSelectorStore) {
        super(mainStore);
        this.id = '' + Rule.genId++;
        this.parent = parent;
    }

    @action
    public addChild(c: RuleBase) {
        this.ruleChildren.push(c);
    }

    @action
    public flip() {
        if (this.andOr === AndOr.AND) {
            this.andOr = AndOr.OR;
        } else {
            this.andOr = AndOr.AND;
        }
    }

    @computed
    get withOutline(): boolean {
        return !this.isRoot && !this.isSingleChild;
    }

    @computed
    get isRoot() {
        return this.parent === null;
    }

    @computed
    get isEmpty() {
        return this.ruleChildren.length === 0;
    }

    @computed
    get backgroundColor() {
        let count = 0;
        let curr: RuleGroup = this;
        while (curr.parent) {
            curr = curr.parent;
            count++;
        }
        if (count % 2 === 0) {
            return globalStore.theme === SophonTheme.DEFAULT ? '#f8fbff' : '#242933';
        } else {
            return globalStore.theme === SophonTheme.DEFAULT ? 'white' : '#171C22';
        }
    }

    // copy previous rule abstract method to support auto fill functionality;
    abstract copyPreviousRule(destination: Rule, target: Rule): void;
}
