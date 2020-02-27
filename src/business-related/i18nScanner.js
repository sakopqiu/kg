// 需要使用自动扫描翻译功能的默认配置项
exports.getI18nScannerOptions = function (nss) {
    const result = {
        // debug: true,
        func: {
            list: ['this.t', 'this.t!', 't', 'props.t', 'props.t!', 'this.props.t', 'this.props.t!', 'i18next.t', 'i18n.t', 'props.i18n!.t', 'this.translate'],
            extensions: ['.ts', '.tsx'],
        },
        lngs: ['en', 'zh'],
        ns: nss,
        defaultLng: 'zh',
        resource: {
            loadPath: 'src/translations/{{lng}}/{{ns}}.json',
            savePath: '{{lng}}/{{ns}}.json',
            jsonIndent: 2,
            lineEnding: '\n',
        },
        nsSeparator: ':', // namespace separator
        keySeparator: false, // key separator
        interpolation: {
            escapeValue: false, // not needed for react!!
            prefix: '{{',
            suffix: '}}',
        },
    };
    console.log("i18nScannerConfig", result);
    return result;
}
