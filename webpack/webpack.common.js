const path = require('path');
const {CheckerPlugin} = require('awesome-typescript-loader');
const StylelintPlugin = require('stylelint-webpack-plugin');
const SophonLintPlugin = require('../plugins/sophon-lint-plugin/sophon-lint-plugin');

module.exports = {
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx'],
        // utils禁止使用alias配置！
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            // 每一个项目都需要配置根目录下的tsconfig.json, 继承tsconfigBase
                            configFileName: './tsconfig.json',
                            useCache: true,
                        }
                    }
                ],
                exclude: [/\/node_modules\//, /\\node_modules\\/], // 加/\\node_modules\\/ 是为了兼容windows系统，下同
                include: [/\/src\//, /\/test_cases\//, /\\src\\/, /\\test_cases\\/], // test_cases is specific for utils...
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    configFile: path.resolve(__dirname, './tslint.json'),
                    emitErrors: true,
                    failOnHint: true
                }
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [/\/node_modules\//, /\\node_modules\\/]
            },
            {test: /\.eot$/, use: 'file-loader'},
            {test: /\.(woff|woff2)$/, use: 'url-loader'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader'},
            // {
            //     test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            //     include: [/\/src\/(images|img|imgs|image)\//, /\\src\\(images|img|imgs|image)\\/],
            //     use: 'url-loader'
            // },
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader'},
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                    },
                ],

            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require("dart-sass")
                        }
                        // options: {
                        //     data: "$env:oem;"
                        // }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {
                        loader: 'less-loader',
                        options: {javascriptEnabled: true},
                    },
                ],
                include: [/\/node_modules\/antd\/es\//, /\\node_modules\\antd\\es\\/],
            },

        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                commons: { //commons优先级默认比vendor高
                    chunks: 'initial',
                    name: 'commons',
                    minSize: 0, //只要超出0字节就生产新的包
                },
            },
        },
    },
    plugins: [
        new CheckerPlugin(),
        new StylelintPlugin({
            configFile: path.resolve(__dirname, './.stylelintrc'),
            files: './{src,test_cases}/**/*.scss'
        }),
        new SophonLintPlugin(['./src', './test_cases'], {
            'load-on-demand': ['antd', 'antv', 'lodash', 'echarts'],
            'use-react-hook': true
        }),
        // TODO utils circular dependency exists!!!
        // 其他项目按需自己添加
        // new CircularDependencyPlugin({
        //     // exclude detection of files based on a RegExp
        //     exclude: /node_modules/,
        //     // add errors to webpack instead of warnings
        //     failOnError: true,
        //     // set the current working directory for displaying module paths
        //     cwd: process.cwd(),
        // }),
    ]
};
