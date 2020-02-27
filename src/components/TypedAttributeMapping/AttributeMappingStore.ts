import {genNewName, isSimilarString} from '../../utils';
import {action, computed, observable} from 'mobx';
import uuidv1 from 'uuid/v1';
import _remove from 'lodash/remove';
import {IMappingTargetEntry} from './interface';
import {TreeFile, TreeFileAttribute} from '../../stores/TreeStore/TreeStoreModels';

export class AttributeMappingStore {
    @observable targetEntryStates: IMappingTargetEntry[] = [];

    @action
    setTargetEntryStates(val: IMappingTargetEntry[]) {
        this.targetEntryStates = val;
    }

    // 在singleton模式下，如果一个attribute被选择过了，不能再次被选择
    isAttributeAvailable(datasetId: string, attribute: TreeFileAttribute) {
        for (const state of this.targetEntryStates) {
            if (state.defaultTableId === datasetId && state.defaultTableAttr === attribute.name) {
                return false;
            }
        }
        return true;
    }

    @computed
    get allExistingNames() {
        return new Set(this.targetEntryStates.map(state => state.name));
    }

    // 空的，没有任何映射的
    @action
    startFromBrandNewMappingsEntries() {
        const results: IMappingTargetEntry[] = [];
        for (const r of this.targetEntryStates) {

            const newEntry = {...r};
            newEntry.defaultTableId = '';
            newEntry.defaultTableAttr = '';
            newEntry.defaultTableName = '';
            if (r.isCustom) {
                newEntry.type = '';
            }
            results.push(newEntry);
        }
        this.targetEntryStates = results;
    }

    @action
    remove(entry: IMappingTargetEntry) {
        _remove(this.targetEntryStates, (e) => e.name === entry.name);
    }

    @action
    addCustomEntry() {
        const newEntry = {
            customId: uuidv1(), name: '', type: '',
            defaultTableId: '',
            defaultTableAttr: '',
            defaultTableName: '',
            isCustom: true,
        } as IMappingTargetEntry;
        newEntry.name = genNewName('attr', this.allExistingNames);
        this.targetEntryStates.push(newEntry);
    }

    @action
    autoMapping(dataset: TreeFile) {
        const results: IMappingTargetEntry[] = [...this.targetEntryStates];

        for (let i = 0; i < results.length; i++) {
            const entry = results[i];
            let isMatch = false;

            for (const attr of dataset.attributes) {
                if (attr.type === entry.type && isSimilarString(attr.name, entry.name)) {
                    const newEntry = {...entry};
                    newEntry.defaultTableName = dataset.name;
                    newEntry.defaultTableAttr = attr.name;
                    newEntry.defaultTableId = dataset.key;
                    results[i] = newEntry;
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                const newEntry = {...entry};
                newEntry.defaultTableName = '';
                newEntry.defaultTableAttr = '';
                newEntry.defaultTableId = '';
                newEntry.type = '';
                if (newEntry.isCustom) {
                    results[i] = newEntry;
                }
            }
        }
        this.targetEntryStates = results;
    }
}
