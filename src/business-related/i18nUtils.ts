import i18n from 'i18next';
import {reactI18nextModule} from 'react-i18next';
import _unique from 'lodash/uniq';

export interface I18nNamespaceConfig {
    ns: string;
    lng: string;
    content: any;
}

export const lngs = ['en', 'zh'];

// 注意这个方法和getI18nScannerOptions的区别
// 这个方法是用来初始化全局i18n对象，告诉他该去哪些地方找翻译文件的，
// 而getI18nScannerOptions则是在开发时需要用到编译时自动探测翻译信息的插件，才会使用到
export function initI18nNext(i18nNsConfigs: I18nNamespaceConfig[]) {
    const nss = _unique(i18nNsConfigs.map(config => config.ns));

    const i18nConfig: any = {
        resources: {},
        fallbackLng: 'zh',
        // have a common namespace used around the full app
        ns: nss,
        // defaultNS: 'App', // 由于所有项目会合成一个，最好不指定defaultNS
        debug: true,
        interpolation: {
            escapeValue: false, // not needed for react!!
        },
        react: {
            wait: true,
        },
    };

    console.log('i18nConfig is', i18nConfig);
    i18n
        .use(reactI18nextModule)
        .init(i18nConfig);

    for (const config of i18nNsConfigs) {
        i18n.addResourceBundle(config.lng, config.ns, config.content);
    }
}
