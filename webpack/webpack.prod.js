const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'cheap-module-source-map',
    plugins: [
        new CleanWebpackPlugin('./build'), //build前清空dist文件夹
        new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
    ]
};
