const path = require('path');
const webpack = require('webpack');
const ip = require('ip');
const execSync = require('child_process').execSync;
const fs = require('fs');
const platform = require('os').platform();

const gatewayPrefix = 'gateway';
const ipAddress = ip.address();

const proxyHeaders = {
    'X-Forwarded-Proto': 'https',
    'X-Forwarded-For': ipAddress,
};

const sourceMapVal = process.env.SOURCE_MAP || 'cheap-module-eval-source-map';
const devtool = sourceMapVal === 'false' ? false : sourceMapVal;
console.log("devtool is " + devtool);

console.log("开始生成本地公私钥和CA证书");
// TODO 临时方案 先让程序运行起来，后续修改sh脚本，兼容windows和linux(ps：windows和linux的路径在shell脚本不一样）
let keyGeneratorPath = platform === 'win32' ? path.resolve(__dirname, './genkeywin.sh') : path.resolve(__dirname, './genkey.sh');
try {
    execSync(`chmod +x ${keyGeneratorPath}`);
} catch (e) {
    console.error(e);
}
execSync(keyGeneratorPath);

const ssl = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
    ca: fs.readFileSync('./ca.crt'),
    spdy: {
        protocols: ['http1.1'],
    },
};

function getProxyBaseConfig(proxyUrl) {
    // api的nginx配置，socketio指向8720端口
    const websocketProxyUrl = proxyUrl.replace(/:(\d+)?$/, ':8720');
    return {
        '/gateway': {
            target: proxyUrl,
            pathRewrite: function (path) {
                if (path.startsWith(gatewayPrefix)) {
                    let newPath = path.substr(gatewayPrefix.length);
                    console.log(`替换${path}为${newPath}`);
                    return newPath;
                } else {
                    return path;
                }
            },
            secure: false,
            changeOrigin: false,
            headers: proxyHeaders,
        },
        '/api': {
            target: proxyUrl,
            secure: false,
            logLevel: 'debug',
            headers: proxyHeaders,
        },
        '/socket.io': {
            target: websocketProxyUrl,
            secure: false,
            changeOrigin: false,
        },
    }
}

const result = {
    mode: 'development',
    devtool: devtool,
    devServer: {
        host: ipAddress,
        inline: true,
        historyApiFallback: true,
        hot: true,
        overlay: {
            warnings: true,
            errors: true,
        },
        stats: 'errors-only',
        https: {
            ...ssl,
        },
        headers: proxyHeaders,
    },

    plugins: [
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // both options are optional
        //     filename: '[name].css',
        //     chunkFilename: '[name].css',
        // }),
        new webpack.HotModuleReplacementPlugin(),
    ],
};

module.exports = {
    config: result,
    getProxyBaseConfig,
    proxyHeaders,
};
