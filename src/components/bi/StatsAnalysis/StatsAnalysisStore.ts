import {SophonEchartDatasetRow} from '../bi-interface';
import {ColumnDefinition, EDimensionInterface, StatsAnalysisDataset} from './StatsAnalysisInterface';
import {action, computed, observable, ObservableMap, runInAction} from 'mobx';
import _every from 'lodash/every';
import {StatsType, typeConversion} from '../../../BiUtils';
import {isNumberType} from '../../../utils';

interface DatasetState {
    selectedAttributes: ObservableMap<string, any>;
    fieldSearchString: string;
    primaryField: string; // 分类1
    secondaryField: string; // 分类2
}

interface TabState {
    datasetName: string;
    datasetStateMap: ObservableMap<string, DatasetState>;
}

export class StatsAnalysisStore {

    datasets: StatsAnalysisDataset[] = [];

    setNewDatasets(datasets: StatsAnalysisDataset[], datasetType: string) {
        this.datasetType = datasetType;
        this.datasets = datasets;
        this.defaultDatasetType = datasetType;
        this.resetStore();
    }

    @action
    public resetStore() {
        this.tabStateMap.clear();
        this.clearAnalysisResult();
        this.datasets.forEach(d => {
            let tabState = this.tabStateMap.get(d.type);
            if (!tabState) {
                tabState = {
                    datasetName: d.name,
                    datasetStateMap: new ObservableMap<string, DatasetState>(),
                };
                this.tabStateMap.set(d.type, tabState);
            }
            tabState.datasetStateMap.set(d.name, {
                selectedAttributes: new ObservableMap<string, any>(),
                fieldSearchString: '',
                primaryField: '',
                secondaryField: '',
            });
        });
    }

    // 每个字段计算完之后都要++
    completeCount = 0;
    @observable isBeingComputed = false;

    @observable datasetType: string = '';
    // 因为datasetType会随着用户切换tab改变，而这个值只在调用setDatasets时设置，作为默认出现在左侧的tab
    defaultDatasetType: string = '';
    @observable tabStateMap: Map<string, TabState> = new Map<string, TabState>();
    @observable computedDataset: ComputedDataset | null; // 点击确认分析后，计算出来的所有统计表，准备喂给右侧

    @computed
    get currentDatasetName() {
        return this.currentTabState.datasetName;
    }

    @computed
    get currentDatasetState() {
        const tabState = this.currentTabState;
        return tabState.datasetStateMap.get(tabState.datasetName)!;
    }

    @computed
    get currentSelectedDatasetAttributes() {
        const datasetState = this.currentDatasetState;
        return datasetState.selectedAttributes;
    }

    @computed
    get currentFieldSearchString() {
        return this.currentDatasetState.fieldSearchString;
    }

    @computed
    get isCheckboxAll() {
        return _every(this.currentAvailableFieldNames, (name) => this.currentSelectedDatasetAttributes.has(name));
    }

    // 如果有筛选条件的话，去除筛选条件剩下的名字
    @computed
    get effectiveSelectedAttributes() {
        return Array.from(this.currentSelectedDatasetAttributes.keys())
            .filter(n => this.currentAvailableFieldNames.find(name => name === n));
    }

    @computed
    get isCheckboxIndeterminate() {
        return this.effectiveSelectedAttributes.length !== 0 && !this.isCheckboxAll;
    }

    @computed
    get currentTabState() {
        return this.getTabState(this.datasetType);
    }

    @computed
    get currentDataset(): StatsAnalysisDataset {
        const state = this.getTabState(this.datasetType);
        return this.datasets.find(d => d.name === state.datasetName)!;
    }

    @computed
    get currentAvailableFields(): ColumnDefinition[] {
        const searchString = this.currentDatasetState.fieldSearchString.toLowerCase().trim();
        return this.currentDataset.columnDefinitions.filter(c => {
            if (c.skipAnalysis) {
                return false;
            }
            if (this.currentPrimaryField === c.name || this.currentSecondaryField === c.name) {
                return false;
            }
            // 当选择两个统计条件时，暂时只支持数字类型的统计字段
            if (this.currentPrimaryField && this.currentSecondaryField && !isNumberType(c.type)) {
                return false;
            }
            if (searchString) {
                return c.name.toLowerCase().indexOf(searchString) !== -1;
            }
            return true;
        });
    }

    @action
    switchGroupByFields() {
        const currentDatasetState = this.currentDatasetState;
        [currentDatasetState.primaryField, currentDatasetState.secondaryField] = [currentDatasetState.secondaryField, currentDatasetState.primaryField];
    }

    @computed
    get currentPrimaryField() {
        return this.currentDatasetState.primaryField;
    }

    @computed
    get currentSecondaryField() {
        return this.currentDatasetState.secondaryField;
    }

    @computed
    get currentAvailableFieldNames() {
        return this.currentAvailableFields.map(c => c.name);
    }

    getTabState(type: string) {
        return this.tabStateMap.get(type)!;
    }

    @action
    setDatasetType(val: string) {
        this.datasetType = val;
    }

    @action
    setDatasetName(val: string) {
        const state = this.currentTabState;
        state.datasetName = val;
    }

    @action
    setFieldSearchString(val: string) {
        const state = this.currentDatasetState;
        state.fieldSearchString = val;
    }

    @action
    setPrimaryField(val: string) {
        const state = this.currentDatasetState;
        state.primaryField = val;
    }

    @action
    setSecondaryField(val: string) {
        const state = this.currentDatasetState;
        state.secondaryField = val;
    }

    @action
    addSelectedAttribute(attrs: string) {
        const state = this.currentDatasetState;
        state.selectedAttributes.set(attrs, 1);
    }

    @action
    deleteSelectedAttribute(attrs: string) {
        const state = this.currentDatasetState;
        state.selectedAttributes.delete(attrs);
    }

    @action
    checkAll() {
        const state = this.currentDatasetState;
        const columnNames = this.currentAvailableFieldNames;
        state.selectedAttributes.clear();
        for (const c of columnNames) {
            state.selectedAttributes.set(c, 1);
        }
    }

    @action
    uncheckAll() {
        const state = this.currentDatasetState;
        state.selectedAttributes.clear();
    }

    @action
    clearAnalysisResult() {
        this.computedDataset = null;
        this.completeCount = 0;
        this.isBeingComputed = false;
    }

    @action
    analyze() {
        this.completeCount = 0;
        this.isBeingComputed = true;

        setTimeout(() => {
            runInAction(() => {
                const currDataset = this.currentDataset;
                let primaryField: string, secondaryField: string;
                if (this.currentPrimaryField && !this.currentSecondaryField) {
                    primaryField = this.currentPrimaryField;
                    secondaryField = '';
                } else if (this.currentPrimaryField && this.currentSecondaryField) {
                    primaryField = this.currentPrimaryField;
                    secondaryField = this.currentSecondaryField;
                } else if (!this.currentPrimaryField && this.currentSecondaryField) {
                    primaryField = this.currentSecondaryField;
                    secondaryField = '';
                } else {
                    primaryField = '';
                    secondaryField = '';
                }

                const fieldsToBeAnalyzedMap = new Map<string, StatsType>();
                for (const field of this.effectiveSelectedAttributes) {
                    fieldsToBeAnalyzedMap.set(field, 'COUNT');
                }
                this.computedDataset = {
                    name: currDataset.name,
                    fieldsToBeAnalyzedMap,
                    primaryField,
                    secondaryField,
                    dimensions: currDataset.columnDefinitions
                        .map(c => (
                            {
                                key: c.name,
                                skipAnalysis: c.skipAnalysis,
                                name: c.name,
                                type: typeConversion(c.type),
                                origType: c.type,
                            } as EDimensionInterface
                        )),
                    source: currDataset.rows,
                };
            });
        }, 500);
    }

    @action
    checkOrSetCompleted() {
        if (this.completeCount === this.computedDataset!.fieldsToBeAnalyzedMap.size) {
            this.completeCount = 0;
            this.isBeingComputed = false;
        }
    }

}

export interface ComputedDataset {
    name: string;
    fieldsToBeAnalyzedMap: Map<string, StatsType>;
    primaryField: string;
    secondaryField: string;
    dimensions: EDimensionInterface[];
    source: SophonEchartDatasetRow[];
}
