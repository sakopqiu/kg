开发时：
npm run dev,可以修改webpack.dev.js中的entry来测试。

发布
npm run release，忽略node_modules中typescript的错误。
release之前切记先push和build代码

本地版本发布时
1. npm run build 因为本地链接其实还链到lib目录下的内容,所以要先build
2. npm link
3. 进入到sophonweb(或者sophon的其他项目里),执行npm link sophon-utils

webpack 配置方法
1）项目各自的tsconfig.json 继承 tsconfig.base.json
2) 项目各自的webpack.dev.js 请merge.smart(webpack.common, webpack.dev.common, {项目自定义})
3) 项目webpack.prod.js 请merge.smart(webpack.common, webpack.prod.common, {项目自定义})
4) webpack.common 定义了公共的loaders， 优化方法， plugins
5）webpack.dev.common 定义了开发公共需要的配置，比如proxy，证书等，仅开发需要的plugins
6）webpack.prod.common 定义了生产环境公共配置，仅生产需要的plugins
7) server.config.template 替换成server.config.js
8) 具体配置可以参考utils的配置

config获取方式
```
const webpackCommon = require('@sophon/utils/webpack/webpack.common')
const webpackDev = require('@sophon/utils/webpack/webpack.dev')
const webpackProd = require('@sophon/utils/webpack/webpack.prod')
```

