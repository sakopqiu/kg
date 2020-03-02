import moment from 'moment';

export class Company {
    id: string;
    name: string;
    attributes: Map<string, string> = new Map();
    events: CompanyEvent[] = [];
}

export class CompanyEvent {
    public constructor(
        public company: Company,
        public id: string,
        public time: moment.Moment,
        public type: string,
        public content: string) {
    }
}

export async function fetchCompany(name: string): Promise<Company> {
    const mock = new Company();
    mock.id = '1';
    mock.name = '南方中金环境股份有限公司';
    const attrs = mock.attributes;
    attrs.set('公司英文名称', 'Nanfang Zhongjin Environment Co.Ltd');
    attrs.set('上市市场', '深圳证券交易所');
    attrs.set('发行价格', '37.8');
    attrs.set('主承销商', '光大证券股份有限公司');
    attrs.set('成立日期', '1991-08-31');
    attrs.set('注册资本', '120215万元');
    attrs.set('机构类型', '其他');
    attrs.set('组织形式', '民营企业');
    attrs.set('证券简称更名历史', '中金环境');
    attrs.set('董事会秘书', '沈梦辉');
    attrs.set('公司电话', '0571-123455689');
    attrs.set('董秘电话', '13822001234');
    attrs.set('公司传真', '12345');
    attrs.set('董秘传真', '22332');
    attrs.set('公司电子邮箱', 'a@b.com');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mock);
        }, 500);
    });
}
