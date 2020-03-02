const path = require('path');
const merge = require('webpack-merge');
const devCommon = require('./webpack/webpack.dev');
const common = require('./webpack/webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let customConfig = null;
try {
    customConfig = require('./dev.server.config');
} catch (e) {
    console.error('无法在本地找到dev.server.config.js文件，请以本地的dev.server.config.template为基础，创建一份');
    process.exit(-1);
}
console.log('customConfig is ' + JSON.stringify(customConfig, null, 2));

const port = 3006;
const proxyBaseConfig = devCommon.getProxyBaseConfig(customConfig.proxyUrl);

const result = merge.smart(common, devCommon.config, {
    entry: {
        index: [
            './src/InvestmentApp/components/InvestmentApp.tsx',
        ]
    },
    devServer: {
        port: port,
        contentBase: path.join(__dirname, 'share'),
        https: false,
        proxy: merge.smart(proxyBaseConfig, {
            '/cyto-api': {
                target: 'http://localhost:3003',
            },
            '/api-manager': {
                target: 'https://172.26.0.42:8044',
                pathRewrite: {'^/api-manager': ''},
                secure: false,
                changeOrigin: false,
                headers: {
                    'X-Forwarded-Proto': 'https',
                },
            },
        })
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Sophon util components library',
            template: './index.html',
            filename: 'index.html',
            inject: true,
        }),
    ],
});

module.exports = result;
