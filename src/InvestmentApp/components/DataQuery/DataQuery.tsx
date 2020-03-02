import * as React from 'react';
import './index.scss';
import Input from 'antd/es/input';
import 'antd/es/input/style';
import Button from 'antd/es/button';
import 'antd/es/button/style';
import classNames from 'classnames';
import {dataQueryStore} from './DataQueryStore';
import {baseInjectHook} from '../../../business-related/utils';
import {useLoadingEffect} from '../../../components/SophonHooks/LoadingEffect';
import {fetchCompany} from '../../model/Company';
import testCanvas from '../TestCanvas';

export default baseInjectHook(function DataQuery() {
        const store = dataQueryStore;
        const doLoadCompanyMeta = React.useCallback(async (companyName: string) => {
            const company = await fetchCompany(companyName);
            store.setCompany(company);
        }, [store]);

        const [loadCompanyMeta, isLoadingMeta] = useLoadingEffect(doLoadCompanyMeta);

        const onConfirm = React.useCallback((e) => {
            const key = store.searchKey.trim();
            if (key) {
                loadCompanyMeta(key);
            }
        }, [store]);

        const updateSearchKey = React.useCallback((e) => {
            store.setSearchKey(e.target.value);
        }, [store]);

        const showBasic = store.switcher === '1';
        const showCanvas = store.switcher === '2';
        return (
            <div className='data-query'>
                <div className='search-area'>
                    <Input
                        value={store.searchKey}
                        onChange={updateSearchKey}
                        size='large' className='search-area-input'/>
                    <Button loading={isLoadingMeta} onClick={onConfirm} className='search-area-confirm' size='large'
                            type='primary'>确定</Button>
                </div>
                <div className='content-area'>
                    <Switcher/>
                    {
                        showBasic &&
                        <>
                            <CompanyMeta/>
                        </>
                    }
                    {showCanvas && testCanvas}
                </div>
            </div>
        );
    },
);

const Switcher = baseInjectHook(() => {
    const store = dataQueryStore;
    const switchContent = React.useCallback((switcher: string) => {
        store.switcher = switcher;
    }, [store]);
    return (
        <div>
            <span
                onClick={() => {
                    switchContent('1');
                }}
                className={classNames('content-switcher', {active: store.switcher === '1'})}>基本信息和重大事件</span>
            <span
                onClick={() => {
                    switchContent('2');
                }}
                className={classNames('content-switcher', {active: store.switcher === '2'})}>关联公司和关联人</span>
        </div>
    );
});

const CompanyMeta = baseInjectHook(() => {
    const store = dataQueryStore;
    return store.company ? (
        <div className='company-meta'>
            <div className='company-meta-item'>
                <span>公司名称: </span>
                <span> {store.company.name}</span>
            </div>
            {Array.from(store.company.attributes.entries()).map(([key, val]) => {
                return (
                    <div className='company-meta-item'>
                        <span>{key}:</span>
                        <span>{val}</span>
                    </div>
                );
            })}
        </div>
    ) : null;
});
