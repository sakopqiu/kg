import {action, observable} from 'mobx';
import {Company} from '../../model/Company';

class DataQueryStore {
    @observable searchKey = '';
    // 1代表基本信息，2代表关联公司和人
    @observable switcher: string = '1';
    @observable company: Company | null = null;

    @action
    setSearchKey(val: string) {
        this.searchKey = val;
    }

    @action
    setSwitcher(val: string) {
        this.switcher = val;
    }

    @action
    setCompany(val: Company | null) {
        this.company = val;
    }

}

export const dataQueryStore = new DataQueryStore();
