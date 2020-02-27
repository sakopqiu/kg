# Changelog
Sophon-utils所有变更，自1.0.68-alpha.

## [2.5.276] - 2020-02-26
**Qiu Cheng**
- TreeTransfer内部代码重构

## [2.5.275] - 2020-02-26
**Zang Hui**
- ToolButton 增加传入FileBase参数

## [2.5.274] - 2020-02-26
**Chen Biao**
- 修改export2csv方法，加入是否格式data的参数formatData

## [2.5.273] - 2020-02-26
**Qiu Cheng**
- AttributeMappingSelector数据结构重构
- 加入ComplexAttributeMapping
- kg组件引入MacroEngine

## [2.5.272] - 2020-02-25
**Zang Hui**
- NameAndDescriptionModal
- 添加id项用以在update时使用

## [2.5.271] - 2020-02-24
**Yang Qi**
- LabViewer 初始化canvas

## [2.5.270] - 2020-02-24
**Chen Biao**
- 修改SophonTable,增加headerTooltip属性，控制表头提示

## [2.5.269] - 2020-02-24
**Zang Hui**
- 找不到项目id时提示用户项目已经删除

## [2.5.268] - 2020-02-21
**Zang Hui**
- 在树结构中搜索，支持节点为元素的情况

## [2.5.267] - 2020-02-21
**Yang Qi**
- 添加CodeViewer/LabViewer组件，用以查看代码和实验流程图

## [2.5.266] - 2020-02-21
**Zang Hui**
- 在树结构中搜索，支持节点为元素的情况

## [2.5.265] - 2020-02-20
**Zang Hui**
- globalStore 中保存期一份config接口中返回的原始对象
- 一些接口会用到其中的值 

## [2.5.264] - 2020-02-19
**Hanjiang Tu**
- 优化一些画像可视化组件展示样式

## [2.5.263] - 2020-02-19
**Yi Chen**
- 试验中select 选择框选中移入时样式问题

## [2.5.262] - 2020-02-19
**Liu XianLiang**
- 文件管理系统移动文件websocket异步提醒

## [2.5.261] - 2020-02-18
**Liu XianLiang**
- fix message里的a链接颜色问题
- 文件管理系统复制文件websocket异步提醒

## [2.5.260] - 2020-02-18
**Yang Qi**
- Steps组件中的Step添加onClick事件

## [2.5.259] - 2020-02-17
**Liu XianLiang**
- CommonLayout unMount时删除editTarget

## [2.5.258] - 2020-02-13
**Hanjiang.tu**
- 更新版本解决257中256代码丢失的问题

## [2.5.257] - 2020-02-13
**Zang Hui**
- TreeMapping组件删除一项时焦点移到所剩项

## [2.5.256] - 2020-02-13
**Hanjiang.tu**
- SophonTabLayout新增destoryOnClose参数用于切换tab后销毁其他tab下的content
- 去除license接口多余的/gateway前缀

## [2.5.255] - 2020-02-12
**Gong Na**
- SimpleSessionPanel 删除 resourceUnavailableCallback 接口

## [2.5.254] - 2020-02-11
**Zang Hui**
- TreeMapping组件添加验证

## [2.5.253] - 2020-02-11
**Zang Hui**
- 添加根据叶子节点id查询路径的方法

## [2.5.252] - 2020-02-03
**Qiu Cheng**
- 移除Svg文件的UrlLoader的配置
- genkey.sh执行前chmod
- proxy_header统一
- 尝试引入redux，未来部分组件尝试用redux书写，与mobx进行对比
- webpack中spdy配置

## [2.5.251] - 2020-01-22
**Biao Chen**
- DateTimeRangePicker用Hook重构
- DateTimePicker用Hook重构
- utils.tsx 添加exportJson方法

## [2.5.250] - 2020-01-21
**Zang Hui**
- TreeMapping 增加isOne2One 是否一一对应属性
- 若是则列出标签/指标为一一对应关系，选择后需要置灰，不能重复选择

## [2.5.249] - 2020-01-21
**Biao Chen**
- 修改SqlEditor组件样式

## [2.5.248] - 2020-01-21
**Qiu Cheng**
- PipelineDisplay全选也考虑CyFindPathBeaconEdge
- 路径支持展开选中的路径的所有子路径，已经图上全量路径展开

## [2.5.247] - 2020-01-20
**Yang Qi**
- 添加pathToHierachy, 将路径转为子路径的array

## [2.5.246] - 2020-01-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- outDir should be defined in your own project...

## [2.5.245] - 2020-01-20
**Biao Chen**
- webpack配置兼容windows系统

## [2.5.244] - 2020-01-20
**Biao Chen**
- 修改SqlEditor组件样式和数据提示逻辑

## [2.5.243] - 2020-01-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- :set fileformat=unix for genkey.sh

## [2.5.241] - 2020-01-20
**Gong Na**
- SimpleSessionPanel修改初始化逻辑

## [2.5.240] - 2020-01-19
**Yi Chen**
- fix AIP-17605 没有时间属性时也需要展示closeicon

## [2.5.239] - 2020-01-19
**Gong Na**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- pipelineEditor save pipeline修改错误信息展示
- 修改缺少资源池报错提示
- 统一webpack配置

## [2.5.238] - 2020-01-19
**Biao Chen**
- 修改SophonCard,SophonScrollMenu,SophonMap,暗黑主题样式

## [2.5.237] - 2020-01-19
**Chen Yi**
- fix AIP-17227 数据展示样式问题
- fix AIP-17293 新建蓝图选择指标界面显示宽问题

## [2.5.236] - 2020-01-17
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- PipelineEditor supports noInpu, noOutput and getAllowedWidget

## [2.5.235] - 2020-01-17
** Yang Qi **
- fix ant-table的样式问题
- 添加EvaluateIcon

## [2.5.234] - 2020-01-17
**Chen Yi**
- fix AIP-17812 新建kafka 数据连接时地址端口输入只有一个时不显示deleteicon

## [2.5.233] - 2020-01-17
**Qiu Cheng**
- fix PipelineDisplay 关系样式选择无法选择的bug
- PipelineDisplay加入实体样式配置
- PipelineDisplay关系样式与实体样式支持fieldAlias

## [2.5.232] - 2020-01-16
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- ShareMemberModal and SophonModal style issue

## [2.5.230] - 2020-01-16
** Yang Qi **
- fix ant-calendar的样式问题

## [2.5.229] - 2020-01-16
**Liu XianLiang**
- fix ShareMemberModal样式错误

## [2.5.228] - 2020-01-16
**Liu XianLiang**
- 新增实时流Icon

## [2.5.227] - 2020-01-15
** Yang Qi **
- fix commonLayout布局问题

## [2.5.226] - 2020-01-15
** Yang Qi **
- 完成深色主题的配色工作

## [2.5.225] - 2020-01-15
**Qiu Cheng**
- 新增KgIndustryTermCascader
- 新增KgUnitCascader
- 新增CascaderWithInput
- CommonLayout新增isCompactStyle，如果设为true，表格周边的margin和padding会被精简
- 新增为PipelineEditor提供的PipelineFormElement
- TreeTransfer新增多个title和placeholder属性

## [2.5.224] - 2020-01-15
**Zang Hui**
- sophon-map 删除键值对时至少保保留一项
- 以免绕过非空验证

## [2.5.222] - 2020-01-15
**Biao Chen**
- 修改export2csv方法，支持更多数据量导出

## [2.5.220] - 2020-01-15
**Chen Yi**
- fix AIP-17537 Spark算法算完之后的新增字段添加

## [2.5.219] - 2020-01-14
**Zang Hui**
- 添加获取license接口
- 用以根据不同的license, 确定前端展示的功能

## [2.5.217] - 2020-01-13
**Yang Qi**
- 优化主题样式

## [2.5.216] - 2020-01-13
**Liu XianLiang**
- CommonDeletionModal 新增customDeletionContent、deletionModalWidth传参

## [2.5.215] - 2020-01-13
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 引入stylelint-order plugin

## [2.5.214] - 2020-01-13
**Gong Na**
- pipelineEditor widget新增单击
- deploy 添加部分表单的disabled

## [2.5.213] - 2020-01-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 引入stylelint

## [2.5.212] - 2020-01-10
**Yang Qi**
- 优化主题样式

## [2.5.211] - 2020-01-09
**Yang Qi**
- 优化样式

**Hanjiang Tu**
- 更改个体分析画像模板画像预览mock数据

## [2.5.210] - 2020-01-09
**Yang Qi**
- 优化主题

## [2.5.209] - 2020-01-08
**Zang Hui**
- TreeMapping增加下拉选择属性

## [2.5.208] - 2020-01-08
**Yang Qi**
- 完成新的主题架构改写

## [2.5.207] - 2020-01-08
**Yang Qi**
- 新增SophonTable组件，用以支持大数量的数据展示
- 替换SqlEditor中的antd table

## [2.5.206] - 2020-01-08
**Zang Hui**
- 添加字段映射特征组件TreeMapping

## [2.5.205] - 2020-01-07
**Hanjiang Tu**
- 画像缩略面板跳转调整
- 个体分析列表模板接口调整

## [2.5.204] - 2020-01-07
**Hanjiang Tu**
- 画像缩略面板增加跳转
- 画像interface和api调整

## [2.5.203] - 2020-01-07
**Gong Na**
- DeployModal新增代码文件上架

## [2.5.202] - 2020-01-07
**Hanjiang Tu**
- 画像组件抽离到sophon-utils
- 开发个体画像缩略面板供kg使用

## [2.5.201] - 2020-01-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- FlvPlayer 遇到后端decode错误强制刷新video...

## [2.5.199] - 2020-01-06
**Liu XianLiang**
- 文件管理api多集群相关修改
- fix s3打开一个根目录不关闭其他根目录的bug

## [2.5.198] - 2020-01-06
**Qiu Cheng**
- kg各个组件允许接收fieldsAlias属性，为field起别名
- 路径功能首节点和尾结点放大功能bugfix
- PipelineEditor的右侧Panel支持传入width
- readonlyPipeline代码修改

## [2.5.197] - 2020-01-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- FlvPlayer 增加retry on error机制

## [2.5.196] - 2020-01-06
**Zang Hui**
- TreeTransfer 继承antd中Tree组件的属性

## [2.5.195] - 2020-01-06
**Liu XianLiang**
- 修改TabLayout样式
- 文件管理解压跳转定位到文件位置

## [2.5.194] - 2020-01-05
**Qiu Cheng**
- kg的fields筛选，排序，翻译
- kg按属性分社群加入arangodb属性

## [2.5.193] - 2020-01-04
**Qiu Cheng**
- StatsAnalysis/RightTable允许fieldDisplayName

## [2.5.192] - 2020-01-04
**Qiu Cheng**
- getArangodbAlgorithmKeyFields更名为getKgFieldName
- FieldStatViewer使用getKgFieldName
- StatsAnalysis允许传入fieldDisplayName方法
- PipelineEditor的widget和link加入metaData

## [2.5.191] - 2020-01-03
**Qiu Cheng**
- PipelineEditor关于KG的序列化反序列化重写
- PipelineEditor部分属性加入Deprecated提醒

## [2.5.190] - 2020-01-03
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 修改地图交互，取消自动获取热力图数据增添刷新按钮
- arangdb特殊字符处理

## [2.5.189] - 2020-01-03
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 增加shown和position_shown处理逻辑

## [2.5.188] - 2020-01-02
**Yang Qi**
- 完善SqlEditor的exec处理

## [2.5.187] - 2019-12-30
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 和后端确认视频渲染模型结果防抖算法

## [2.5.186] - 2019-12-30
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- PipelineEditor　新增disableWidgetType

## [2.5.185] - 2019-01-02
**Zang Hui**
- fix 树形穿梭框右侧全选与搜索输入框在显示问题

## [2.5.185] - 2019-01-02
**Zang Hui**
- fix 树形穿梭框右侧全选与搜索输入框在显示问题

## [2.5.184] - 2019-01-01
**Qiu Cheng**
- 蓝图构建重构，支持dataset和datamart两种模式

## [2.5.183] - 2019-12-30
**Yi Chen**
- fix AIP-16016 session会话状态显示问题

## [2.5.182] - 2019-12-31
**Yang Qi**
- 修改sophonMap校验规则

## [2.5.181] - 2019-12-30
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- enhance SophonScrollMenu组件，解决last element高度小于viewport，active状态不对的问题
- https://github.com/fisshy/react-scroll/issues/161
- 防抖solution

## [2.5.179] - 2019-12-27
**Hanjiang Tu**
- 更新AttributesMapping组件适应EP中个体分析列表模板的需求
- 优化AttributesMapping组件样式
- TreeTransfer 树形穿梭组件支持搜索节点

## [2.5.178] - 2019-12-27
**Qiu Cheng**
- 树状结构搜索抽象组件TreeStore
- 根据TreeStore重构PipelineEditor左侧的树
- 带左右两侧搜索功能，以及右侧自定义样式的TreeTransfer2

## [2.5.177] - 2019-12-27
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- flv播放器支持样式控制（子级优先，若不存在，父级就近原则）

## [2.5.176] - 2019-12-26
**Liu XianLiang**
- 文件管理新增解压websocket异步推送
- StackCommonLayout新增menuTopPlaceNode属性

## [2.5.175] - 2019-12-26
**Hanjiang Tu**
- AttributesMappingTarget组件custom的entry支持自定义slot render

## [2.5.174] - 2019-12-25
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 支持http-flv server部署播放器

## [2.5.173] - 2019-12-25
**Liu XianLiang**
fix SophonModal字体错误问题

## [2.5.172] - 2019-12-25
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- player error handle

## [2.5.171] - 2019-12-25
**Qiu Cheng**
- DatasetAttributeMapping内部结构调整，ui调整
- 加入IDIcon, NameIcon, LongitudeIcon, LatitudeIcon
- yarn start的devtool调整，提高开发效率

## [2.5.170] - 2019-12-24
**Zang Hui**
- 接口修改, SessionStatus中加入resource类型

## [2.5.169] - 2019-12-24
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- Player hook重构　memory leak
- 和视频同步绘制矩形框

## [2.5.168] - 2019-12-24
**Gong Na**
- ProjectMetaInfo添加SophonThemeSelect
- 新增主题样式common-layout-card-tag-background
- sophonCasecader下拉菜单图标图片修改为icon

## [2.5.167] - 2019-12-24
**Zang Hui**
- 接口修改, SessionStatus中的id 移到SessionStatus.sessionGroup.id

## [2.5.166] - 2019-12-24
**Liu XianLiang**
- SessionPanel切换资源池添加集群名称展示

## [2.5.165] - 2019-12-24
**Chen Biao**
- 修改SophonMapRef组件useEffect依赖

## [2.5.164] - 2019-12-23
**Zang Hui**
- 接口修改，添加interface SessionGroup

## [2.5.161] - 2019-12-23
**Qiu Cheng**
- PipelineEditor接口重构
- PipelineEditor使用fromTemplate代替isTemplate
- ParamsContainer toJson实现

## [2.5.156] - 2019-12-20
155被发布了
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 重构视频播放组件，支持视频比例自适应，加入canvas元素
- 新增cv结果渲染, 并和视频同步
- 修改开源flv.js, 支持h264 sei数据播放器 - @sophon/flvjs

## [2.5.154] - 2019-12-19
**Qiu Cheng**
- AttributeMappingTarget文字溢出fix
- 尝试更新到webpack4最新版本
- 加入BlueprintType

## [2.5.152] - 2019-12-19
**Yang Qi**
- LabelSelector全部按钮取消toggle'

## [2.5.151] - 2019-12-19
**Qiu Cheng**
- PipelineEditor支持每个tab拥有各自的数据集
- DatasetAttributeSelector bugfix

## [2.5.150] - 2019-12-18
**Chen Biao**
- 升级版本

## [2.5.149] - 2019-12-18
**Chen Biao**
- 修改SqlEditor样式在兼容性,修改数据表结果多余滚动条

## [2.5.148] - 2019-12-18
**Liu XianLiang**
- 文件管理notebook包安装进度列表

## [2.5.147] - 2019-12-18
**Hanjiang.tu**
- 解决产品webpack打包慢的问题(@types/lodash >=4.14.125会导致webpack打包缓慢，暂时锁定版本)

## [2.5.145] - 2019-12-18
**Qiu Cheng**
**Liu XianLiang**
- fix metro模式的CommonLayout报错问题
- jquery,extract-text-webpack-plugin升版本
- 加入@types/i18next

## [2.5.140] - 2019-12-17
**Qiu Cheng**
- kg图算法部分数据结构
- 加回对color的依赖，因为SophonLintPlugin需要使用

## [2.5.137] - 2019-12-17
**Chen Biao**
- 修改SqlEditor组件部分逻辑，适用Edge-Node需求

## [2.5.136] - 2019-12-16
**Qiu Cheng**
- 共同依赖移入utils中

## [2.5.135] - 2019-12-16
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- User Api　增加admins和isAdmin 接口
- CVAT 支持批量选中反选

## [2.5.134] - 2019-12-16
**Liu XianLiang**
- SessionPanel查看日志自动跳到最底层。

## [2.5.133] - 2019-12-16
**Qiu Cheng**
- 升级mobx，防止内存泄漏

## [2.5.132] - 2019-12-13
**Hanjiang Tu**
- 更改AttributesMapping组件

## [2.5.131] - 2019-12-13
**Qiu Cheng**
- 路径首尾节点变大
- BigGraph footer

## [2.5.129] - 2019-12-13
**Liu XianLiang**
- fix CommonLayout新建文件夹页面报错问题，操作栏新增ColumnProps配置。

## [2.5.128] - 2019-12-13
**Yang Qi**
- 优化session panel的样式

## [2.5.127] - 2019-12-13
**Qiu Cheng**
- fix部分内存泄漏问题

## [2.5.125] - 2019-12-12
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- CVAT ctrl　支持反选

## [2.5.124] - 2019-12-12
**Liu XianLiang**
- fix CommonLayout无法设置column rowSpan的问题

## [2.5.123] - 2019-12-12
**Qiu Cheng**
- BigGraph选中一个节点时，将节点本身添加到allSelectedNode中

## [2.5.122] - 2019-12-11
**Qiu Cheng**
- 解决chrome 63的Object.values不存在
- kg的hover-button的css类名错误
- PipelineEditor路径线段，路径发现导航线段取消方向箭头，因为api可能返回双向

## [2.5.120] - 2019-12-11
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- fixed hover buttons style
- BigGraph参数改为level1name和level2name

## [2.5.118] - 2019-12-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- Geometry - Bezier intersection
- 地图　prototype

## [2.5.117] - 2019-12-10
**Chen Biao**
- 新增SophonScrollMenu（菜单滚动定位组件）
- SophonMap组件增加title 属性

## [2.5.116] - 2019-12-10
**Qiu Cheng**
- PipelineDisplay的路径功能支持一条路径中存在双向
- 大图功能phase1

## [2.5.112] - 2019-12-10
**Liu XianLiang**
- fix SophonModal不显示bug

## [2.5.111] - 2019-12-10
**Yang Qi**
- InputWithModal 添加disabled属性

## [2.5.110] - 2019-12-09
[108/109 已被发布]
**Yang Qi**
- CommonLayout 删除时判断是否有文件夹

## [2.5.107] - 2019-12-06
**Qiu Cheng**
- SophonModal支持noShadow
- SophonSelectSearch去除不允许失去焦点限制

## [2.5.106] - 2019-12-05
**Chen Biao**
- 修改DateTimeRangePicker组件props 属性SelectorTitle为SelectorPlaceholder

## [2.5.105] - 2019-12-04
**Qiu Cheng**
- DatasetAttributeMapping支持singleton和fromMultipleDatasets

## [2.5.104] - 2019-12-03
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 增加支持双向懒加载滚动组件　SophonScroll

## [2.5.103] - 2019-12-02
**Liu XianLiang**
- SophonMoreTools清除默认选中效果

## [2.5.102] - 2019-12-02
**Chen Biao**
- DateTimeRangePicker组件新增SelectorTitle props 属性
- 修复FlvPlayer录播到最后一个片段时delete preview id 的bug

## [2.5.101] - 2019-12-02
**Yang Qi**
- 新增SqlEditor组件
- SophonModal 添加draggble属性
- 优化SophonCodeBox


## [2.5.100] - 2019-11-29
**Liu XianLiang**
- 修改ResourcePoolConfig interface

## [2.5.99] - 2019-11-27
**ZangHui**
- SophonMap 增加配置，使新增按钮可在下方显示

## [2.5.98] - 2019-11-22
**Yang Qi**
- 优化样式

## [2.5.97] - 2019-11-24
**Qiu Cheng**
- PipelineEditor内部实现大换血，将左侧的数据集，右侧的算子属性，连接属性从耦合状态拆分
- PipelineEditor左侧数据集支持树状结构，并且默认直接从API加载5层
- PipelineEditor序列化和反序列化逻辑大大简化，取消中间状态
- DatasetAttributeMapping相关组件支持多层文件架结构

## [2.5.94] - 2019-11-22
**Yang Qi**
- 修复SophonCodeBox、InputWithModal 最大化失效的bug

## [2.5.93] - 2019-11-20
**Yang Qi**
- 优化SophonCodeBox

## [2.5.91] - 2019-11-20
**Yang Qi**
- SophonMap 添加hideBtn属性，用以隐藏添加按钮，用以详情模式
- SophonCodeBox 添加ScrollToBottom属性，用以始终让编辑器处于底部，用以日志查询模式

## [2.5.90] - 2019-11-20
**Gong Na**
- fix deploy实验路径匹配问题
- 新增objectFileSystemIcon

## [2.5.89] - 2019-11-20
**Qiu Cheng**
- PipelineEditor左侧算子选择支持树状结构
- PipelineEditor左侧算子栏支持宽度改变，支持文件夹和文件的图标自定义

## [2.5.88] - 2019-11-19
**Liu XianLiang**
- getUserResourcePoolConfigs修改url

## [2.5.87] - 2019-11-19
**Gong Na**
- fix pipeline tab 名称过长问题
- fix pipeline tab删除确认modal内容溢出问题
- 模型上架项目、实验默认值被删除时清空表单并添加提示信息

## [2.5.86] - 2019-11-15
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- cvat　增加历史capacity
- cvat优化 历史变换监听仅在非viewOnly模式下启用

## [2.5.85] - 2019-11-18
**Yang Qi**
- CopyButton, 添加button模式
- 新增InputWithModal

## [2.5.84] - 2019-11-18
**Qiu Cheng**
- WidgetDef将name，desc, required设置成非强制
- 加入经纬度属性
- 路径展示逻辑优化
- 抽取BranchBreadCrumb组件

## [2.5.83] - 2019-11-15
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 支持保留旋转角度

## [2.5.82] - 2019-11-15
**Liu XianLiang**
- fix CommonLayout mockFolder自定义文件夹名称失败问题

## [2.5.81] - 2019-11-15
**Gong Na**
- DeployModal
- fix 接口设置pipeline高度问题
- fix 模型上线实例、url显示问题
- 模型服务、部署、替代模型版本默认值被删除时清空表单并添加提示信息

## [2.5.80] - 2019-11-15
**Yang Qi**
- 暂时解决theme循环引用的bug

## [2.5.78] - 2019-11-15
**Liu XianLiang**
- CommonLayout新增initialLoadList传参

## [2.5.77] - 2019-11-15
**Yang Qi**
- SophonThemeSelect export

## [2.5.76] - 2019-11-14
**Yang Qi**
- 修改SophonThemeSelect的实现机制，去掉cacheUtils.saveTheme和cacheUtils.getTheme

## [2.5.75] - 2019-11-14
**Qiu Cheng**
- DefaultAppWrapper启动时主题相关设置改为local下才调用

## [2.5.74] - 2019-11-12
**Chen Biao**
- 修改FlvPayer组件previewId未成功创建情况下刷新按钮报错的问题

## [2.5.73] - 2019-11-12
**Yang Qi**
- commonLayout添加hideRefreshBtn属性，用以隐藏掉刷新按钮

## [2.5.72] - 2019-11-12
**Yang Qi**
- commonLayout在customFilters时，隐藏掉刷新按钮

## [2.5.71] - 2019-11-13
**Qiu Cheng**
- 开始支持Api请求可取消，加入了Cancellable和CancellableReponse接口
- 加入makeRequestCancellable方法
- CommonCardList无数据时，由外部传入的图片存在时无法显示的bug
- useAffix代替antd的affix
- SophonInfoCard加入了labelClassName和valueClassName属性
- SophonSearchSelect代码重构，现在支持后发起的请求取消之前发起的请求，一个使用场景是取消http请求
- SophonTabLayout的url模式下支持子路径的路由
- SumperSimpleDisplayCanvas的onLoaded回调函数删除，取而代之的是afterRendering回调函数
- CyElement的构造函数可以不传入CyState作为参数

## [2.5.70] - 2019-11-12
**Yang Qi**
- 完善主题

## [2.5.69] - 2019-11-12
**Yang Qi**
- 完善主题

## [2.5.68] - 2019-11-12
**Zang Hui**
- 增加TreeSearch组件，功能是输入搜索关键字，返回匹配的新树

## [2.5.67] - 2019-11-11
**Yang Qi**
- 优化commonLayout的customFilters

## [2.5.66] - 2019-11-11
**Yang Qi**
- 完善主题

## [2.5.65] - 2019-11-08
**Yang Qi**
- 修改SophonCodeBox的主题默认值

## [2.5.63] - 2019-11-08
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 增强cvat支持自定义store
-　新增旋转功能
- SophonSelectTree
- GroupSelectTree

## [2.5.62] - 2019-11-08
**Yang Qi**
- 完善主题

## [2.5.61] - 2019-11-08
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- player　主题

## [2.5.60] - 2019-11-08
**Zang Hui**
- TreeTransfer 重构

## [2.5.59] - 2019-11-07
**Yang Qi**
- 添加echart、pipeline editor的主题

## [2.5.58] - 2019-11-07
**Yang Qi**
- commonLayout table 颜色

## [2.5.57] - 2019-11-07
**Yang Qi**
- 新增公共的主题，　包括　commonLayout 交错行、globalStore 增加 theme，以及其他

## [2.5.56] - 2019-11-07
**Gong Na**
- pipelineTool 修复算子带有动画效果的icon在低版本chrome下的定位问题

## [2.5.55] - 2019-11-07
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 新增公共的主题，　包括　ant-btn-link, ant-radio-group, ant-select tag mode, ant-input clear icon

## [2.5.54] - 2019-11-06
**Zang Hui**
- TreeTransfer 支持懒加载树

## [2.5.53] - 2019-11-06
**Yang Qi**
- 优化多处主题

## [2.5.52] - 2019-11-06
**Qiu Cheng**
- UserApi增加简易登录等处
- DefaultAppWrapper接口更改，允许用户传入自定义axios request，response的handler，允许用户传入自定义的i18n和Router

## [2.5.51] - 2019-11-06
**Liu XianLiang**
- CommonLayout mock新建文件夹相关修改

## [2.5.50] - 2019-11-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- sophon carousel 主题
- image card 主题
**Chen Biao**
- 修改SophonCard 背景颜色和title字体颜色

## [2.5.49] - 2019-11-06
**Chen Biao**
- 修改MenuCommonLayout content颜色和nav颜色
- 修改SophonCard 背景颜色和title字体颜色

## [2.5.48] - 2019-11-05
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- cvat 增加主题， sophonmodal 主题调整整，　新增　ant-input-number 以及 ant-dropdown 公共主题

## [2.5.47] - 2019-11-05
**Yang Qi**
- 完善主题

## [2.5.46] - 2019-11-05
**Chen Biao**
- MenuCommonLayout 增加dark 主题

## [2.5.45] - 2019-11-05
- FileSystemApi
- 后端api重构,修改moveOrCopyFiles
- 原moveFile用于移到到回收站, 现改成deleteToTrash

## [2.5.44] - 2019-10-31
**Liu XianLiang**
- fix SophonMoreToolsHook更新后宽度改变不重绘dom的问题

## [2.5.43] - 2019-10-30
**Zang Hui**
- cacheUtils
- commonStore 在commonLayout的willUnMount时会
- 调用resetStatus, 此时会将 currentSelectedFile 置空
- 由于autoRun的关系,同时也置空的了cacheUtils中的currentSelectedPath
- 但cacheUtils的目地就是保存currentSelectedPath, 因此在空串时不改变cacheUtils中的currentSelectedPath

## [2.5.42] - 2019-10-30
**Liu XianLiang**
- SessionPanel会话资源窗口新增刷新按钮

## [2.5.41] - 2019-10-29
**Yang Qi**
- AttributeSelector组件添加hideDrag属性

## [2.5.39] - 2019-10-29
**Yang Qi**
- 优化AttributeSelector组件

## [2.5.38] - 2019-10-28
**Zang Hui**
- TreeTransfer 增加树形穿梭框组件

## [2.5.36] - 2019-10-25
**Qiu Cheng**
- SimpleSessionPanel新增资源池无法访问的回调函数
- parseFieldString优化错误handling

## [2.5.34] - 2019-10-25
**Liu XianLiang**
- 修改名称校验规则

## [2.5.33] - 2019-10-25
**Gong Na**
- fix SimpleSessionPanel 找不到资源池报错问题

## [2.5.32] - 2019-10-25
**Qiu Cheng**
- PipelineEditor增加ignoreLinkValidation

## [2.5.30] - 2019-10-25
**Liu XianLiang**
- fix CopyMoveModal 复制移动报错问题

## [2.5.29] - 2019-10-24
**Liu XianLiang**
- 会话日志展示改用SophonCodeBox

## [2.5.28] - 2019-10-24
**Yang Qi**
- 优化SophonCodeBox

## [2.5.27] - 2019-10-24
**Gong Na**
- ant-checkbox z-index样式问题

## [2.5.26] - 2019-10-24
**Liu XianLiang**
- CopyMoveModal新增重命名校验

## [2.5.25] - 2019-10-23
**Zang Hui**
- SophonModal 补回原来的white-header样式

## [2.5.24] - 2019-10-23
**Qiu Cheng**
- 新增NameAndDescriptionModal
- 新增NameModal
- 改进parseFieldString

## [2.5.23] - 2019-10-23
**Liu XianLiang**
- fix CopyMoveModal错误报错重名的bug

## [2.5.22] - 2019-10-23
**Qiu Cheng**
- 数据集映射UI优化

## [2.5.21] - 2019-10-23
**Qiu Cheng**
- 数据集映射逻辑重构+完善

## [2.5.20] - 2019-10-22
**Yang Qi**
- CommonLayout支持customFilters功能
- 优化SophonCodeBox

## [2.5.19] - 2019-10-22
**Liu XianLiang**
- SessionPanel新增控制会话日志和查看SparkUI btn是否显示的参数

## [2.5.18] - 2019-10-22
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- project nullable

## [2.5.17] - 2019-10-21
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 更改图计算api

## [2.5.16] - 2019-10-21
**Zang Hui**
- FileSelect 再次修复遗漏请求specialLocation参数

## [2.5.15] - 2019-10-21
**YangQi**
- 完善主题及SophonCodeBox

## [2.5.14] - 2019-10-18
**Liu XianLiang**
- SessionPanel新增查看会话日志和SparkUI功能

## [2.5.13] - 2019-10-17
**Zang Hui**
- FileSelect 修复遗漏请求specialLocation参数

## [2.5.12] - 2019-10-17
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- KG 元素属性string类型编辑限制256长度

## [2.5.11] - 2019-10-16
**Yang Qi
- 添加SophonCodeBox

## [2.5.10] - 2019-10-16
**Yang Qi
- 暗黑主题phase3

## [2.5.9] - 2019-10-16
**Hanjiang Tu [联系](mailto:hanjiang.tu@transwarp.io)**
- 404未找到服务使用notification进行提示

## [2.5.8] - 2019-10-16
**Qiu Cheng [联系](mailto:guanhuichen@gmail.com)**
- 线段重置逻辑更新

## [2.5.7] - 2019-10-16
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 把公共操作dom主题的逻辑抽到 DefaultAppWrapper

## [2.5.6] - 2019-10-16
**Qiu Cheng**
- package名字改为@sophon/utils

## [2.5.5] - 2019-10-15
**Yang Qi**
- 暗黑主题phase2

## [2.5.4] - 2019-10-15
**Yang Qi**
- 暗黑主题phase1

## [2.5.3] - 2019-10-14
**Qiu Cheng**
- fix线段比较逻辑

## [2.5.1] - 2019-10-14
**Qiu Cheng**
- 版本号同步当前发布版本

## [1.0.100-alpha.40] - 2019-10-14
**Qiu Cheng**
- PipelineDisplay支持线段更多设置

## [1.0.100-alpha.39] - 2019-10-12
**Yang Qi**
- 添加export2csv方法
- 添加名称、描述的校验规则

## [1.0.100-alpha.38] - 2019-10-12
**Gong Na**
- fix 删除工作流报错问题

## [1.0.100-alpha.37] - 2019-10-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- format user api
- 优化成员穿梭框视觉

## [1.0.100-alpha.36] - 2019-10-11
**Gong Na**
- 优化接口设置表单校验及报错信息
- fix接口设置数据初始化问题

## [1.0.100-alpha.35] - 2019-10-11
**Zang Hui**
- CommonLayout
- 添加参数 notNeedRenameWhenCopy 复制时允许隐藏改名输入框

## [1.0.100-alpha.32] - 2019-10-10
**Qiu Cheng**
- PipelineDisplay支持线段字体以及颜色设置

## [1.0.100-alpha.31] - 2019-10-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonModal和hooks重构base的ShareMemberModal
- 基本逻辑保持一样，增强了loading效果

## [1.0.100-alpha.29] - 2019-10-10
**Gong Na**
- 模型上线修改deployId字段

## [1.0.100-alpha.28] - 2019-10-09
**Gong Na**
- 模型接口设置、上线新增表单校验
- fix 接口设置数据集选择未更新问题

## [1.0.100-alpha.27] - 2019-10-09
**Zang Hui**
- FileSystemApi
- fix allFiles 参数大小写拼写错误

## [1.0.100-alpha.26] - 2019-10-09
**Liu XianLiang**
- SideMenu
- fix文件夹名称过长不截断的问题

## [1.0.100-alpha.25] - 2019-10-09
**Zang Hui**
- CopyMoveModalMenu
- 避免复制移动弹窗中在其它tab下重命名文件文件夹出错的情况

## [1.0.100-alpha.24] - 2019-10-08
**Qiu Cheng**
- PipelineEditor支持输出端口
- DeploySetting中的PipelineEditor支持输出端口，缩放，viewBox恢复正常

## [1.0.100-alpha.23] - 2019-09-30
**Gong Na**
- deployModal select 新增搜索
- FsSelect 修复默认值显示错误问
- utils add camelize

## [1.0.100-alpha.22] - 2019-09-29
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 基于path的文件选择首目 onlyDirectory起作用问题
- 指定path情况下，有可能没有数据的处理方式

## [1.0.100-alpha.19] - 2019-09-29
**Gong Na**
- projectApi新增fetchProjects

## [1.0.100-alpha.18] - 2019-09-29
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- FileSelect 懒加载对文件后缀类型filter问题

## [1.0.100-alpha.17] - 2019-09-27
CopyMoveModal
新增自定义title

## [1.0.100-alpha.16] - 2019-09-27
- 升级utils的antd

## [1.0.100-alpha.15] - 2019-09-27
- 初始化失败时的Error界面
- 将loading界面移入utils进行管理

## [1.0.100-alpha.14] - 2019-09-27
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 解决cyto radius 因浮点精度导致的负数问题
- 解决路径发现临时节点backgroud-width计算导致的内部错误问题

## [1.0.100-alpha.13] - 2019-09-27
**Liu XianLiang**
TabLayout
- 新增tabChangeCallback回调函数

## [1.0.100-alpha.12] - 2019-09-27
**Gong Na**
- deploymodal 新增readonly状态
- fix icon font

## [1.0.100-alpha.11] - 2019-09-26
**Liu XianLiang**
- websocket path添加basename前缀

## [1.0.100-alpha.10] - 2019-09-26
**Qiu Cheng**
- SuperSimpleDisplayCanvas组件

## [1.0.100-alpha.9] - 2019-09-26
**Qiu Cheng**
- addInnerPaths抽离成方法，支持对一个起点-终点重复添加path
- 支持节点，边，path混合添加

## [1.0.100-alpha.8] - 2019-09-26
**Yang Qi**
- SophonMap 优化只对map对应的item做校验

## [1.0.100-alpha.7] - 2019-09-26
**Liu XianLiang**
- FileSystem上传文件进度获取改为从websocket推送
- exportLink新增showName

## [1.0.100-alpha.6] - 2019-09-25
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- FileSelect 支持个个层级懒加载
- FileSelect 支持从某个path开始

## [1.0.100-alpha.5] - 2019-09-25
**Hanjiang.tu**
- 增加sophon-ep需要用到的LoadingTargets

## [1.0.100-alpha.4] - 2019-09-25
**Yang Qi**
- SophonMap fix key值重复并不重新校验的bug

## [1.0.100-alpha.3] - 2019-09-24
**Yang Qi**
- CommonLayout 添加deletion.deletionTitle属性，自定义删除modal的title

## [1.0.100-alpha.2] - 2019-09-24
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- enhance FileSystemApi, 是否recursion以及path参数

## [1.0.100-alpha.1] - 2019-09-24
**Qiu Cheng**
ComplexDisplay
- 重构内部addMixture方法，现在添加路径和添加普通节点边合并成了一个操作
- 允许用户同时添加多个节点，多条边以及多条路径
- 路径支持自环

- useLoadingEffect只在返回值为非false时弹出成功信息

## [1.0.99-alpha.69] - 2019-09-23
**Zang Hui**
- 创建History对象时传入从cookie里获取的 basename

## [1.0.99-alpha.68] - 2019-09-23
**Liu XianLiang**
CopyMoveModal
- fix 移动或复制到根目录时出现错误的bug

## [1.0.99-alpha.67] - 2019-09-23
**Gong Na**
- commoncard 修改tag样式
- simplesession 添加readonly属性

## [1.0.99-alpha.66] - 2019-08-30
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
AnnotationTools
- 移动或者resize标注框，隐藏圆点（resize handlers），避免多余的遮挡

## [1.0.99-alpha.65] - 2019-09-23
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
PipelineDisplay
- 联合查询 重构部分代码以致能复用

## [1.0.99-alpha.64] - 2019-09-23
**Gong Na**
- commonlayout 修改排序下拉菜单图标、card主题下title、description样式
- pipelinetools 修改tabs、底部工具栏样式

## [1.0.99-alpha.63] - 2019-09-23
**Liu XianLiang**
SessionPanel
- 无实例启动时新增提示
EllipsisText
- dimension模式时，默认textOverflow为ellipsis

## [1.0.99-alpha.62] - 2019-09-22
**Qiu Cheng**
ComplexPipelineDisplay
- 允许用户配置边的字体大小
- 清除节点样式功能恢复
- doStatsCalculation将数据尝试转化为数字

## [1.0.99-alpha.60] - 2019-09-20
**Liu XianLiang**
- fix CommonLayout 在火狐浏览器的兼容性问题

## [1.0.99-alpha.59] - 2019-09-20
**Yang Qi**
- SophonModal 添加最大化事件的dispatch
- DeployModal 添加对SophonModal最大化操作的响应
- CommonLayout 添加hideOperation属性

## [1.0.99-alpha.57] - 2019-09-20
**Qiu Cheng**
- CanvasTabStore新增closeTabById

## [1.0.99-alpha.55] - 2019-09-19
**Zang Hui**
- CommonLayout 移动弹窗为支持群移，去除重命名输入框

## [1.0.99-alpha.54] - 2019-09-18
**Qiu Cheng**
- Pipeline相关组件实现tab空间不足时出现MoreBtn
- 后端版本信息容错处理
- PipelineEditor切换tab后更新svg元素的位置信息

## [1.0.99-alpha.52] - 2019-09-18
**Hanjiang Tu**
- Remove font-family `monospace` in AceEditor style, avoid style conflict with sophon-web

## [1.0.99-alpha.51] - 2019-09-16
**Liu XianLiang**
- 移除CommonLayout notAutoUpdateList、listReloaded、inFolderLoadList 传参
- CommonLayout 新增loadChildrenList传参，用于按需加载列表内容。

## [1.0.99-alpha.50] - 2019-09-17
**Qiu Cheng**
- CommonLayout重命名逻辑修改
- Resource Config不强制

## [1.0.99-alpha.47] - 2019-09-17
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- commonlayout tools 被antd tooltip包一层disabled的时候会被覆盖一层span, 导致padding double

## [1.0.9-alpha.44] - 2019-09-17
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Gong Na**
- Model upload modal 增加自定义validator
- common card 描述去除多余的tooltip

## [1.0.99-alpha.43] - 2019-09-12
**Hanjiang Tu**
- add AceEditor component

## [1.0.99-alpha.42] - 2019-09-12
**Liu XianLiang**
SessionPanel
- 修改样式
TableHeader
- 新增filter过多折叠功能
SophonMoreToolsHook
- 新增隐藏所有选项

## [1.0.99-alpha.41] - 2019-09-12
**Gong Na**
- fix模型上架上线组件在编辑模式下api服务数据丢失问题

## [1.0.99-alpha.40] - 2019-09-12
**Qiu Cheng**
- CanvasStore相关泛型优化

## [1.0.99-alpha.39] - 2019-09-11
**Zang Hui**
- CommonLayout 组件添加 inFolderLoadList 属性
数据集支持懒加载children,
在中间目录点刷新时需要只请求当前目录下的children

## [1.0.99-alpha.39] - 2019-09-11
**Zang Hui**
- CommonLayout 组件添加 inFolderLoadList 属性
数据集支持懒加载children,
在中间目录点刷新时需要只请求当前目录下的children

## [1.0.99-alpha.38] - 2019-09-11
**Qiu Cheng**
- DefaultAppWrapper加入render参数

## [1.0.99-alpha.36] - 2019-09-11
**Gong Na**
- 模型上架上线组件新增数据回填
- utils接口报错新增message路径
- globalcss force-fullscreen新增background

## [1.0.99-alpha.35] - 2019-09-11
**Qiu Cheng**
- commonlayout .ant-layout-content去除flex-direction: row !important

## [1.0.99-alpha.34] - 2019-09-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 统一sophon status icon以及color

## [1.0.99-alpha.33] - 2019-09-10
**Liu XianLiang**
FileSystemApi
- 新增移动文件接口

## [1.0.99-alpha.32] - 2019-09-10
**Qiu Cheng**
PipelineDisplay
- 升级cytoscape到最新版本
- layout selected bugfix
- 时间序列关闭按钮
- deleteSelected bugfix

## [1.0.99-alpha.30] - 2019-09-10
**Qiu Cheng**
- CommonLayout样式和sophonweb里的.layout .ant-layout-content冲突
- PipelineEditor切换时npe的修复

## [1.0.99-alpha.28] - 2019-09-06
**Qiu Cheng**
- 修改defaultGetErrorMsg关于403和404的处理

## [1.0.99-alpha.26] - 2019-09-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonTextEditor 解决在base项目css被覆盖问题

## [1.0.99-alpha.25] - 2019-09-09
**Qiu Cheng**
- SvgBackground onResize bugfix
- yarn dev => yarn start

## [1.0.99-alpha.24] - 2019-09-06
**Tu Hanjiang**
- SOPHON_MODULE_NAMES 增加 DATAMART/FEATURE, 删除DATA_MART/AUTO_FEATURE

## [1.0.99-alpha.23] - 2019-09-06
**Qiu Cheng**
- PipelineEditor的tab相关配置增加:tabNonSwitchable和tabNonSwitchHint
- SophonFormStepModal新增beforeNext回调函数
- 修改DeployModal初始化PipelineEditor的时机
- global.scss加入force-fullscreen

## [1.0.99-alpha.20] - 2019-09-06
**Liu XianLiang**
- FileSystemApi新增彻底删除接口

## [1.0.99-alpha.19] - 2019-09-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonTextEditor input元素 css important防止被全局覆盖

## [1.0.99-alpha.18] - 2019-09-06
**Zang Hui**
-globalStore 增加获取resource的config配置

## [1.0.99-alpha.17] - 2019-09-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- fileSystemApi 增加 getNFSFolders api
- 修改版本创建form items 样式
- 修改 $common_layout_modal_z_index 的值为1041

Sophon-utils所有变更，自1.0.68-alpha.1开始记录
## [1.0.99-alpha.16] - 2019-09-05
**Qiu Cheng**
PipelineEditor新建一个Pipeline逻辑调整

## [1.0.99-alpha.15] - 2019-09-05
**Chen Biao**
-globalStore 增加versions字段
-globalStore.config修改数据获取，miscApi.getConfig增加返回类型定义

## [1.0.99-alpha.14] - 2019-09-05
**Liu XianLiang**
- SessionPanel样式bug修改

新## [1.0.99-alpha.12] - 2019-09-04
**Qiu Cheng**
SophonTabLayout的css调整

## [1.0.99-alpha.11] - 2019-09-04
**Qiu Cheng**
**Yang Qi**
- 加入了ProjectMetaInfo组件，用于在开发环境下显示用户名，语言切换等
- 模型上架组件

## [1.0.99-alpha.10] - 2019-09-03
**Qiu Cheng**
- SOPHON_MODULE_NAMES新增cv，数据市场，自动特征，画像
- 暴露scripts文件夹
- 抽取baseInjectHook，baseInjectAllHook
- baseInjectAllHookProps新增pid属性

## [1.0.99-alpha.5] - 2019-09-02
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
AnnotationTool
- 增添自定义在svg上onWheel事件
- export ChangeMessage 组件

## [1.0.99-alpha.3] - 2019-09-02
**Qiu Cheng**
**Yang Qi**
- i18n-scanner插件抽取到utils
- 删除对rsync的依赖，使用copy-resource-files.js进行编译时资源复制

## [1.0.99-alpha.1] - 2019-09-01
**Qiu Cheng**
将原来散落在各个项目的所有通用逻辑抽取进sophon-utils
- 将所有项目通用的初始化外层包裹DefaultAppWrapper
- onAppLanded除了初始化api信息外，新增了初始化locale，enhance所有axios实例,以及Websocket
- 简化WebsocketProcessor的逻辑
- i18nnext初始化代码抽取
- i18n-scanner的option对象抽取

## [1.0.98-alpha.45] - 2019-08-30
**Liu XianLiang**
FileSystemApi
- 新增解压HDFS和NFS压缩文件的接口

## [1.0.98-alpha.44] - 2019-08-30
**Zang Hui**
config 读取配置接口去除base前缀

## [1.0.98-alpha.41] - 2019-08-29
**Qiu Cheng**
**Gona na**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 增加VersionButton控件
- HandleTime处理空的情况不显示
- 随机颜色 增加 luminosity

## [1.0.98-alpha.39] - 2019-08-29
**Qiu Cheng**
- enhanceAxiosInstance从各个项目中抽取汇总
- 改造onAppLanded

## [1.0.98-alpha.38] - 2019-08-29
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonCarousel 根据交互更改样式

## [1.0.98-alpha.37] - 2019-08-29
**Liu XianLiang**
fix SessionPanel配置名过长显示不完整问题

## [1.0.98-alpha.36] - 2019-08-29
**Zang Hui**
添加微服务路径 user

## [1.0.98-alpha.35] - 2019-08-29
**Yang Qi**
SophonMap
- 优化validate

## [1.0.98-alpha.34] - 2019-08-29
**Liu XianLiang**
SideMenu
- 新增Menu点击回调
CopyMoveModal
- 新增Menu点击回调，修复Menu样式不对齐问题
CommonLayout
- 新增是否自动刷新列表的选项

## [1.0.98-alpha.33] - 2019-08-28
**Zang Hui**
SessionPanel
- Notebook 资源面板添加刷新按钮，获取实时资源使用情况
**Qiu Cheng**
- 加入众多和Workflow相关的Icon
- 将getShownText从EllipsisText抽取到utils.tsx
PipelineEditor
- WidgetDef支持传入icon和iconStyle

## [1.0.98-alpha.32] - 2019-08-27
**Zang Hui**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
SessionPanel
- Notebook 资源面板重构，显示当前实例的状态
- SophonCarousel

## [1.0.98-alpha.31] - 2019-08-27
**Qiu Cheng**
PipelineEditor
- 算子加入onClicked回调函数
- 涉及绘制的回调函数参数列表调整，都接受一个WidgetModelStatus类型的参数
- updatePipeline清空currentWidgets

## [1.0.98-alpha.30] - 2019-08-27
**Qiu Cheng**
PipelineEditor
- Lock相关逻辑写反了，更新alpha.27
- 在SimplePipelineModel中加入了tempConfig和easyTempConfig，用于存放临时数据
- WidgetRectangle的render方法支持第三个参数isHovered

## [1.0.98-alpha.29] - 2019-08-27
**Yang Qi**
CommonLayout
- 添加hideSearch属性

## [1.0.98-alpha.27] - 2019-08-26
**Qiu Cheng**
PipelineEditor
- WidgetModel增加remove方法
- 只读模式下右击菜单隐藏，如果用户传了自定义MenuItem则显示
- defaultErrorMsg支持JobManager的格式
- WidgetRectangle支持None，RUNNING，FAILED，SUCCESS四种图标状态
- EditModePipeline支持locked属性, 以及tempMap
- 支持onPipelineFirstTimeRendered回调函数


SReact
- Phase 1

## [1.0.98-alpha.23] - 2019-08-23
**Qiu Cheng**
PipelineEditor
- beforeSave回调函数
- onWidgetsCopied回调函数
- WidgetModel加入状态，并且修改WidgetRectangle(未完待续）

## [1.0.98-alpha.21] - 2019-08-22
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonTimeElapsed 控件

## [1.0.98-alpha.20] - 2019-08-22
**Yang Qi**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonTextEditor修改样式
- SophonFormStepsModal 自定义title和confirmButtonText

## [1.0.98-alpha.19] - 2019-08-22
**Qiu Cheng**
- SophonIcon传入hint时使用Tooltip
- moduleRootUrl增加workflow

## [1.0.98-alpha.18] - 2019-08-22
**Qiu Cheng**
PipelineEditor
- WidgetModel时间允许是number

## [1.0.98-alpha.16] - 2019-08-22
**Yang Qi**
Steps
-- 修改判断steps结束的逻辑

## [1.0.98-alpha.15] - 2019-08-21
**Qiu Cheng**
PipelineEditor
- removeEventListener,keydown typo
- 无法删除字符bugfix
PipelineDisplay
- 找路径，只找最短路径选项隐藏

## [1.0.98-alpha.14] - 2019-08-21
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Biao.Chen**
- 新增 SophonFormStepsModal
- 新增 SophonTextEditor （视觉上不会看到字体大小变化）
SophonInfoCard
- IotCard更名为SophonInfoCard
- 使用ReactHook重写，增加控制label和value的style,增加默认没有hover效果
- WebSocketHandler
-1.修改websocket，添加连接错误事件，
-2.回调函数增加返回参数，返回socket.io具体的消息

## [1.0.98-alpha.13] - 2019-08-20
**Qiu Cheng**
**Gong Na**
FileSystemApi
- Revert alpha.10的修改
PipelineEditor
- EditModeCanvasStore新增updatePipeline方法
- WidgetRectangle的名字使用props.label进行加工
- 增加onWidgetDblClick回调函数
- SimpleSessionPanel修复bug

## [1.0.98-alpha.10] - 2019-08-20
**Gong Na**
FileSystemApi
- FileListOption接口新增config

## [1.0.98-alpha.9] - 2019-08-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Yang Qi**
SophonMap
- 添加SophonMap组件，与Antd中的Form配合使用，展示形式为key-value的形式
- SophonMap添加required、uniqueKey验证
- 新增SophonTag
- 模型上架部分通用组件及定义通用interface

## [1.0.98-alpha.8] - 2019-08-19
PipelineEditor
- 左侧数据集被删除时移除相应的算子和边

## [1.0.98-alpha.6] - 2019-08-16
PipelineEditor
- SvgBackground历史监听从onScroll移动至componentDidmount（之前是typo）
- 为iot数据迁移做准备

## [1.0.98-alpha.4] - 2019-08-15
**Qiu Cheng**
PipelineEditor
- 新增drag模式，不再依赖滚动条调整流程图的viewBox，使用体验更接近于cytoscape
- 算子能够接受多个输入了（以前只有一个）
- 支持前进后退功能（原来只有基于cytoscape的版本才支持）
- 增加WidgetRectangle的自定义绘制，自定义菜单项
- 允许隐藏WidgetPanel
- 修复算子放下时往右偏移的bug
- 微调了接口，删除了不用的属性，为一些属性做了分组

## [1.0.98-alpha.4] - 2019-08-14
**Qiu Cheng**
**Gona Na**
- 新增SimpleSessionPanel，解耦于API
- 新增NoteBookConfigurer

## [1.0.98-alpha.3] - 2019-08-13
**Liu XianLiang**
- 调整SophonModal最大化显示时的大小

## [1.0.97-alpha.11] - 2019-08-12
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Yang Qi**
- fixed common layout name column font color issue
- fixed common layout card title multiple lines issue
- fixed common layout expanded icon color white issue
- Sophon steps css issue
- shortcut key case sensitive
- tabLayout forceRender false as default

## [1.0.97-alpha.8] - 2019-08-13
**Qiu Cheng**
- SophonEchart没有dataZoom时bottom调整
- 调整一些class为export
- build-local命令更改为build-module
- SqlRule时间被置空时的bugfix，以及HumanReadableString的逻辑fix
- 加入全局的SOPHON_HISTORY
- 为Sophon产品模块化做准备

PipelineDisplay
- WordTab里Style的几个icon在disable时也可以展开的bug
- 统计分析里的英语翻译简化

## [1.0.97-alpha.5/6] - 2019-08-12
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- global cross missing issue
- image card css adjust

## [1.0.97-alpha.3] - 2019-08-07
**Qiu Cheng**
- 为BI项目做准备，加入SophonEchart组件，提供简单的echart封装
- 高度抽象的统计分析组件（和api完全解耦)
- SophonModal width的bug

PipelineDisplay
- 修复添加路径时，api传过来的每一条子路径里的nodes和edges顺序不一致的问题（前端测试数据之前都模拟的是一致的顺序）
- SelectionService剔除deprecated的代码
- 修复递归展开社群时，社群物理节点不存在的情况
- Add Path时，动画的效果更平顺
- 简单分析时支持搜索条件框的收起
- Add Neighbor padding增大
- 边的箭头扩大
- 调整导航栏的顺序，优化自定义导航栏的逻辑

## [1.0.96-alpha.24] - 2019-08-08
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 矩形框支持global cross， 辅助画图

## [1.0.96-alpha.20] - 2019-08-06
**Liu XianLiang**
- 解决SophonModal右上角关闭按钮在sophon-web中存在的位置偏移问题

## [1.0.96-alpha.19] - 2019-08-06
**Liu XianLiang**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- SophonModal组件新增最大化功能
- 恢复复位功能

## [1.0.96-alpha.18] - 2019-08-05
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 文件api新增参数 onlyDirectory

## [1.0.96-alpha.17] - 2019-08-05
**Qiu Cheng**
PipelineDisplay
- EdgeGroup高级统计排序
- 支持修改RelationFilter的时间范围
- 删除节点时，把和它相关的CyBeaconEdge也删除
- 菜单顺序调整

## [1.0.96-alpha.16]
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- sophon confirm modal 新增disallowCloseOnHitShadow和hideCross
- fix firefox 标注兼容问题

## [1.0.96-alpha.15]
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- css 修改以及快捷键和checkbox冲突问题

## [1.0.96-alpha.14]
**Zang Hui**
- 增加图标installIcon

## [1.0.96-alpha.13] - 2019-08-02
**Liu XianLiang**
- 修改ResourcePoolConfig数据类型

## [1.0.96-alpha.11/12] - 2019-07-31
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- performance tested and improved
- 交互反馈优化
- 新增sophon zoom input
- 新增 useElementRef hook
- 增加隐藏，锁定快捷键

## [1.0.96-alpha.9/10] - 2019-07-31
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 修复 chrome 73+ onwheel + ctrl 会造成整个屏幕缩放问题
- image增加边框 优化视觉

## [1.0.96-alpha.8] - 2019-07-29
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 支持复位快捷键
- 增加dirty flag
**Yang Qi**
- 添加sophon-lint-plugin

## [1.0.96-alpha.7] - 2019-07-29
**Liu XianLiang**
- 文件系统上传文件api新增allfiles参数

## [1.0.96-alpha.6] - 2019-07-29
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- 修改react-dnd相关的版本信息

## [1.0.96-alpha.5] - 2019-07-26
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
CVAT
- 更新icons
- fix 矩形框 从左下角往右上角resize bug
- 增加了绘制状态显示， 增加了右键取消绘制， 移动状态显示， 全屏

## [1.0.96-alpha.3] - 2019-07-26
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 关系筛选打开后不相关的节点不显示
- 关系筛选的时间如果是00：00：00，就把时间部分省略

## [1.0.96-alpha.2] - 2019-07-26
**Liu XianLiang**
FileSelect
- 组件新增style props

## [1.0.96-alpha.1] - 2019-07-26
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- React-dnd更新到最新的version 9，开始使用useDrag，useDrop
- 添加AttributeMappingTarget
- 添加DatasetAttributeMapping
- 添加DatasetAttributeSelector

## [1.0.95-alpha.11] - 2019-07-24
**Zang Hui**
FileSelect
- 监听excludes stringfy 以后的字符串变化以，以防止定义时直接写对象，每次都初始化

## [1.0.95-alpha.10] - 2019-07-24
**Yang Qi**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
CVAT
- 新增label支持以及redo undo
- 优化Steps组件

## [1.0.95-alpha.9] - 2019-07-22
**Zang Hui**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
FileSelect
- 管理员可以查看所有用户私有的hdfs情况下的目录,所以需要传入特定的请求路径

## [1.0.95-alpha.8] - 2019-07-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
CVAT
- 调整视觉，增加shortcut
- shape resize 不允许flip

## [1.0.95-alpha.7] - 2019-07-19
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 增加展开所有社群
- 增加递归展开某个社群
- 展开社群时位置优化
- 显示路径时自动展开相关社群

## [1.0.95-alpha.6] - 2019-07-18
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
CVAT
- 优化cvat工具
- 增添 SophonColorSelect

## [1.0.95-alpha.5] - 2019-07-178
**Yang Qi**
SophonConfirmModal
- 增加hideIcon属性

## [1.0.95-alpha.4] - 2019-07-17
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
CVAT
- 增加cvat工具, phase 1

## [1.0.95-alpha.3] - 2019-07-17
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 新增全图搜索
- 对当前混乱的文件分层做了重构

## [1.0.95-alpha.2] - 2019-07-16
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- 新增SophonSimpleCollapse组件,支持左右两侧显示toggler
PipelineDisplay
- 修改selectElementsById的内部实现
- 社群支持嵌套，以及相应的内部模型的修改

## [1.0.94-alpha.37] - 2019-07-15
**Zang Hui**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
FileSelect
- 增加disabled属性
PipelineDisplay
- 时间选择器莫名消失bugfix

## [1.0.94-alpha.35] - 2019-07-12
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 时间过滤bugfix

## [1.0.94-alpha.33] - 2019-07-11
**Zang Hui**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- fix CommonLayout 复制移动弹窗新建目录后，把复制的文件放到些新目录后再点击确定报错
PipelineDisplay
- 时间过滤功能优化

## [1.0.94-alpha.32] - 2019-07-12
**Yang Qi**
- 增加Icon

## [1.0.94-alpha.31] - 2019-07-11
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 优化FileSelect性能

## [1.0.94-alpha.30] - 2019-07-11
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- card 模式增添image

## [1.0.94-alpha.27] - 2019-07-11
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 路径发现结果优化
- 多出代码重构于优化，体现在更简洁的接口，去除了某些不必要的参数

## [1.0.94-alpha.24/25] - 2019-07-08
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Zang Hui**
- CommonLayout 在复制移动弹窗内新增添加文件夹及重命名方法.
- FileSelect and TabLayout

## [1.0.94-alpha.23] - 2019-07-05
**Biao Chen [联系](mailto:943634218@qq.com)**
- CommonLayout 增加 onSearch 方法，自定义搜索框内容.

## [1.0.94-alpha.22] - 2019-07-02
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- fix mini map缩放问题以及node resize问题
- 简易分析基本完成

## [1.0.94-alpha.20] - 2019-07-01
**Yang Qi**
**Zang Hui**
- CommonLayout添加隐藏NameColumn以及Pagination的功能
- CommonLayout添加复制移动同时修改名称的功能

## [1.0.94-alpha.19] - 2019-06-28
**Yang Qi**
- CommonLayout 支持 onExpand 事件

## [1.0.94-alpha.18] - 2019-06-27
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Liu XianLiang**
PipelineDisplay
- 简易搜索功能完善，包括细粒度的边合并展开控制，toolbar调整

## [1.0.94-alpha.16] - 2019-06-26
**Yang Qi**
- commonLayout 支持NameColumn自定义表头名、校验方式，以及NameEditor添加pressEnter触发方式

## [1.0.94-alpha.15] - 2019-06-25
**Yang Qi**
- Steps hookify

## [1.0.94-alpha.14] - 2019-06-21
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Liu XianLiang**
- SophonMoreToolsHook实现，支持windowOnResize，支持more中内容自定义
- showMessage,showError中内容过多时支持折叠

## [1.0.94-alpha.13] - 2019-06-21
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 多个组件脱离原来currentActiveStore的管理，改为外部传入mainStore
- 高级统计里的分类过滤id属性

## [1.0.94-alpha.10] - 2019-06-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- sophon seach select 增添 allowLoadMore flag
- 修复主题对应线段颜色不对问题

## [1.0.93-kg.14/1.0.94-alpha.9] - 2019-06-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 增添useOnChangeHandler解决State updates from the useState() and useReducer() Hooks don't support the second callback argument
- 增加统计N/A处理以及部分css issues

## [1.0.93-kg.13] - 2019-06-19
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- add more group by tests

## [1.0.93-kg.12] - 2019-06-18
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 合并边统计支持group by
- 美式数字显示, 以及修复统计NaN问题

## [1.0.93-kg.11/1.0.94-alpha.8] - 2019-06-18
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 新增四种icon类型，机构，行业，位置，文档, 以及支持icon多样式

## [1.0.93-kg.10/1.0.94-alpha.7] - 2019-06-14
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- timefilter 在detail面板展开隐藏时显示错误问题
- global.scss - antd tab 去除不必要的animation
- EdgeGroupStats 增添 decimal(xxx)的统计
- 去除红色warning
- 查看只读蓝图类型不对

## [1.0.93-kg.9] - 2019-06-13
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- timefilter 在detail面板展开隐藏时显示错误问题
- 快速分析 crashed问题

## [1.0.93-kg.8/1.0.94-alpha.6] - 2019-06-12
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- sqlrule timestamp and date issue
- animation issue
- timefilter issue

## [1.0.94-alpha.5] - 2019-06-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 键盘删除widgets, widgets 仍存在 currentWidgets 问题

## [1.0.94-alpha.4] - 2019-06-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- Widgets 复杂 含有线段也一起复制

## [1.0.94-alpha.1] - 2019-06-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
PipelineDisplay
- 建议 kg2.3版本发布的时候打上 --tag kg2.3, 默认是latest
- 默认latest会导致其他项目可能被强制装上了kg版

## [1.0.93-alpha.6] - 2019-06-07
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 动画重复播放检测
- fixed built

## [1.0.93-alpha.5] - 2019-06-06
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 节点和边选择相关逻辑重构，删除了EdgeLink

## [1.0.93-alpha.4/1.0.93-kg.4] - 2019-06-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- self loop config for latest cyto

## [1.0.93-kg.3/1.0.93-alpha.3] - 2019-06-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- sophon shadwo overflow auto

## [1.0.93-alpha.2/1.0.93-kg.2] - 2019-06-06
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 右击事件bugfix
- EditModeCanvasTabStore null pointer

## [1.0.92-alpha.53] - 2019-06-05
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- EdgeGroup数值统计增加更多统计值

## [1.0.92-alpha.52] - 2019-06-05
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- EdgeGroup支持选中状态保存
- Collapsed社群支持选中状态保存
- 右击元素时逻辑优化
- HistoryService加入了profiling信息

## [1.0.92-alpha.51] - 2019-06-05
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 解决chrome tab hidden情况下video buffer满导致视频停止播放
- 解决后端视频服务推送速度 大于 video播放速度导致的延迟以及buffer满视屏停止问题
- 通过引入 delayTolerance 以及 定期更新currentTime来解决
- flvjs 存在的共同问题， 相关issue https://github.com/Bilibili/flv.js/issues/274
- https://github.com/bilibili/flv.js/issues/108

## [1.0.92-alpha.50] - 2019-06-04
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
PipelineEditor
- 右边栏属性增添搜索功能
- 增添合并边模式下统计模式

## [1.0.92-alpha.49] - 2019-06-04
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineEditor
- 构建时跳来跳去的奇怪bugfix

## [1.0.92-alpha.48] - 2019-06-04
**Qiu Cheng [联系](mailto:454519934@qq.com)**
PipelineDisplay
- 选择逻辑优化，选择状态被记录进历史，而且不会导致不必要的重绘

## [1.0.92-alpha.47] - 2019-06-03
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- CircleLayout algorithm

## [1.0.92-alpha.46] - 2019-05-31
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 再次重构参数面板，并且对现有ElementAttributeViewer进行模块化重构
- EdgeGroup聚合统计功能

## [1.0.92-alpha.44] - 2019-05-30
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 修改flvjs config 尝试性修复视频latency以及播放速度慢于流推送速度造成的buffer full问题
- cytype import问题

## [1.0.92-alpha.43] - 2019-05-29
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**

PipelineDisplay
- 切换tab，离开编辑器时合理释放内存
- cyto-resize关闭不必要的listener注册，新增destroy方法用来释放内存

## [1.0.92-alpha.40] - 2019-05-25
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- 属性视觉重构
- 邻居节点动画效果展示
- 历史最多30条
- axiosInstance和baseAxiosInstance区别

## [1.0.92-alpha.38] - 2019-05-24
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Zanghui**
PipelineEditor
- 重名检测逻辑优化，并修复了大小写不区分的bug
- API开始进行微服务化，部分API加入/base前缀

## [1.0.92-alpha.36] - 2019-05-21
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- fixed menu栏里添加笔记失败issue
- allow tab tooltip hidden
PipelineDisplay
- 邻居选择时，如果是一个锚点，维持原状，concentric布局，如果有多个
锚点，每个锚点都进行grid layout
- 反向选择bugfix
- 选择叶节点位置偏差bugfix
- cytoscape，开发pipelineEditor时应该使用最新版本，因为需要dragfree事件，开发pipelineDisplay时
暂时使用3.2.22
- 闪屏问题彻底修复

## [1.0.92-alpha.30/32] - 2019-05-20/21
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- fixed cytoscape self loop damn bug

## [1.0.92-alpha.28] - 2019-05-16
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
- 蓝图转换到Pipeline（反之亦然）的结构调整，原来只涉及fieldName和fieldType，现在fieldNameInDF也开始启用

## [1.0.92-alpha.28] - 2019-05-16
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- ReactHook example

### 修改项
- useLoadingEffect成功信息的微调
- AIP-2560

## [1.0.92-alpha.26] - 2019-05-15
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- SessionStore, GlobalStore单例写法修改
- SophonModal逻辑优化
- PipelineEditor的只读模式属性栏ui优化

## [1.0.92-alpha.17] - 2019-05-14
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Yangqi**
### 修改项
- SessionPanel增加Notebook模块
- CommonLayout增加customTooltip属性

## [1.0.92-alpha.9] - 2019-05-10
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- kg 属性 首字母不进行大写处理
- metro action column css issue
- kg相关fields定义修改

## [1.0.92-alpha.7] - 2019-05-08
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- antd按需载入语法修改
- Edit模式Pipeline的field改变
- 使用awesome-typescript-loader

## [1.0.90-alpha.3] - 2019-05-07
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Yangqi**
### 增加项
- useLoadingEffect hooks
- AntdCommonModal
### 修改项
- remove hard code graph algorithm
- getAvatar api method

## [1.0.90-alpha.1] - 2019-05-06
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Yangqi**
### 增加项
- sophon params support bool type
### 修改项
- fix sophon collapse issue caused by upgrading antd
- table字体上移fix

## [1.0.89-alpha.4] - 2019-04-30
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
- 加强sophon params组件 目前支持 string， number 和integer
- 视觉更新 主要是icon

## [1.0.89-alpha.1] - 2019-04-29
**Qiu Cheng [联系](mailto:454519934@qq.com)**
- 实体样式修改后popover不自动关闭bugfix
- 添加了主题0和1之间的切换
- PipelineDiff的图例切换时会消失的bug
- TimeFilter逻辑移入TimeFilterService
- TimeFilter图例选择项不会随着切换频率或者切换tab而改变
- 移除Reconciliator
- 升级typescript，react，react-dom，antd版本
- 尝试使用内部registry

## [1.0.87-alpha.16] - 2019-04-24
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- sophon param
- KG 图计算参数相关结构定义
- 抽取了Session相关的store，SessionPanel，SessionStatus,对逻辑进行饿了深度重构
- fix边在layout后消失的bug
- revert yarn.lock为之前的配置
- confirm modal

## [1.0.87-alpha.10] - 2019-04-18
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- 增加了sophon running bar
- 增加了 sophon notification
- 增加了 session panel 和 session status
- 增加了 公共的api
### 修改项
- 修改了 websockethandle transparent 一定是默认值的issue
- 更改了 tag not icon
- 更新左边栏icon样式

## [1.0.87-alpha.9] - 2019-04-18
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
PipelineDisplay
- 统一了修改note，tag，删除节点，更新属性的接口调用
- loadingEffect接口新增一个overload
- 防止新元素闪屏
- sophon构建使用cytoscape 3.3.0(因为dragfree开始被支持)，对kg仍然使用3.2.22(线段显示混乱的bug在这个版本没有)

## [1.0.87-alpha.6] - 2019-04-16
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
PipelineDisplay
- 路径发现和最短路径支持tab上的选择方式
- 根据zxy的反馈修改了新节点加入到图谱后图谱元素的相对位置
- 统计分析中遇到undefined或者null页面会崩溃的bug

## [1.0.87-alpha.5] - 2019-04-15
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
PipelineDisplay
- 禁用删除属性选项
- 增加实体样式名称和关系样式名称
- TimeFilter增加半透明/隐藏选项

## [1.0.87-alpha.2/4] - 2019-04-09/10
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
PipelineDisplay
- SimplePipelineDisplay实现
- 图谱分享
### 修改项
PipelineDisplay
- fix 属性操作不work issue
- update GraphDataJson
- 优化邻居展示
- 对findPath和findNeighbor做了更好的封装，重构了相关代码
- context menu over the right boundary issue
- 临时把删除属性disable

### 修改项
PipelineDisplay
- 反向选择不考虑边
- 增加叶节点选中功能
- SophonWordTab间距调整
- 之前的onCanvasRendered废除，改为pipelineFirstTimeRendered
即每一个pipeline第一次打开在tab中时进行调用

## [1.0.86-alpha.36] - 2019-04-07
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- 定向分析起始终止视觉优化
- 修复众在存在社群的时候无法一次性取消边的选中
- 修复timeFilter模式下右侧选中拦效果不准确
- 修复小屏幕上图标显示异常
- 修复右侧节点和边属性显示不出
- 图谱上大多数html元素的user-select设置为none
- CanvasEventService大重构
- cytoscape降回3.2.22，很多线段不显示的问题自然消失
- firefox min-height issue

## [1.0.86-alpha.27] - 2019-04-02
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- sophon search select component
### 修改项
- sophon search select支持load more
- 去除白色边框
- 修改sql component 支持 simple 模式和 autofill
- PipelineDisplay新ui
- 完善版本对比的详细信息模态框

## [1.0.86-alpha.28] - 2019-04-04
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- 时间对比
### 修改项
- diff 视觉更新

## [1.0.86-alpha.25] - 2019-04-01
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
- 版本对比模块初始阶段
### 修改项
- PipelineDisplay新界面继续增加
- 允许展示StellarDB的blueprint

## [1.0.86-alpha.23] - 2019-03-27
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- PipelineDisplay新界面

## [1.0.86-alpha.20] - 2019-03-21
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- kg图标，bugfix
- 支持主题定制
- 构图圆形边界改为圆角矩形
- metro table修改样式
- font family arial, Helvetica

## [1.0.86-alpha.18] - 2019-03-14
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- minimap组件以及cytoscape minimap实现
### 修改项
- 图谱构建icon重构并提取cytoscape common style
- 反向选择不包含线段

## [1.0.86-alpha.17] - 2019-03-12
**Yang Qi [联系](mailto:iamyangqi@sina.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Hanjiang Tu [联系](mailto:994418277@qq.com)**
### 修改项
- SEditor 添加 initialValue 属性
- PipelineTool添加timeFilter的是否添加时间gap的功能
- AttributeSelector的SqlRuleComponent引入date和timestamp控件
- CommonLayout Metro Table样式问题

## [1.0.86-alpha.16] - 2019-03-11
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
PipelineDisplay
- 在utils加入handleTimeString方法对时间进行预处理
- 修复firefox上显示的各种bug

## [1.0.86-alpha.15] - 2019-03-08
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
PipelineDisplay
- bounds expansion support, fix self loop issue, icons rollback and clean code
- 时间筛选功能重新实现，引入了toolbox.brush代替dataZoom

## [1.0.86-alpha.14] - 2019-03-07
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
- PipelineEditor支持cytoscape作为background

## [1.0.86-alpha.12/13] - 2019-03-05
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Hanjiang Tu**
### 修改项
- PipelineEditor支持只读模式
- 将sophonweb和kg共通的地方抽取到utils
- PipelineDisplay时间筛选打开时，不仅高亮/仅展示符合条件的元素，同时对他们进行select，方便在右侧栏观察
- 视觉更新, icon 更新
- utils中优化了名字校验方法
- 改了实体大小， label添加白底, 文字margin

## [1.0.86-alpha.8] - 2019-03-01
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- icon大换血

## [1.0.86-alpha.7] - 2019-02-26
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- PipelineEditor只读模式
- Pipeline加入退出提醒

## [1.0.86-alpha.6] - 2019-02-26
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Hanjiang Tu**
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 修改项
- graph card ui
- CommonLayout名字校验
PipelineTool
- entity size config
- 实体大小视觉更新
- SimplePipelineModel重构支持多个parents
- 性能优化，尽可能复用当前cytoscape实例

## [1.0.86-alpha.4] - 2019-02-26
**Hanjiang Tu**
### 修改项
- MetroTable

## [1.0.86-alpha.3] - 2019-02-26
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- 修改线段颜色 #888788

## [1.0.86-alpha.2] - 2019-02-25
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- 修改节点颜色
- 线段粗细/颜色深浅
- shortcut 支持 enter

## [1.0.86-alpha.1] - 2019-02-22
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- 重构PipelineTool
- 增加蓝图图标

## [1.0.85-alpha.12] - 2019-02-21
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- 增加了蓝图粗体和细体的图标
- 增添sophon collapse
### 修改项
- graph branch to case refactor
- graph card css 修改

## [1.0.85-alpha.11] - 2019-02-13
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
PipelineTool
- 和群豪，姬哥一起微调了样式

## [1.0.85-alpha.10] - 2019-02-13
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
PipelineTool
- 标签批量添加

### 修改项
PipelineTool
- 关联实体 关系checkbox bug以及一些小优化
- addNodes,addMixture重构，废弃长参数列表，改用配置对象，老元素是否选中或者高亮由配置对象决定
- 元素高亮后的视觉优化
- layout 选项 hover增添title
- 移除cytoscape.forceLayout

## [1.0.85-alpha.9] - 2019-02-10
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- 降级cytoscape到3，2，2，修复一些ui的不美观

## [1.0.85-alpha.8] - 2019-02-10
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- 升级cytoscape，修复一些ui的不美观

## [1.0.85-alpha.7] - 2019-02-02
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 添加sophon modal footer 自定义
### 修改项
- sophon modal body flex 属性值
- canvas setting 重构
PipelineTool
- PipelineDisplay自环显示不美观的优化

## [1.0.85-alpha.6] - 2019-02-01
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 添加项
PipelineTool
- 添加了关闭时候的警告图标
### 修改项
- 整个CanvasDisplay的UI
- 时间序列的ui

## [1.0.85-alpha.5] - 2019-01-31
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- 水平时间轴 hover 颜色调整。
- graph card css 调整。

## [1.0.85-alpha.2] - 2019-01-31
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Zang Hui [联系](mailto:313535256@qq.com)**
### 添加项
AnimationMount
- 添加动画效果装饰器类
### 修改项
- 修改SophonModal相关弹窗的视觉和属性。
- SophonModal相关弹窗配置方式。


## [1.0.85-alpha.1] - 2019-01-30
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Yang Qi [联系](mailto:iamyangqi@sina.com)**

### 添加项
PipelineDisplay
- 添加时间属性统计，以按需加载的方式引入了Echarts
### 修改项
- 将helperService中的函数改成了getter，为性能提升做准备
- 修改Name的文案。
- 修改commonLayout中不能打开的文件的鼠标行为。

## [1.0.84-alpha.2] - 2019-01-24
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Chen Biao [联系](mailto:943634218@qq.com)**
### 修改项
- 修改WebSocketHandler,移除事件回调函数可传可不传。
- 重构PipelineDisplay的addNodes，移除addEdges，该为addMixture
- PipelineDisplay的菜单根据设计重新设计

## [1.0.84-alpha.1] - 2019-01-22
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- 引入模块按需加载
- 重构整个PipelineTool代码

### 删除项
- 删除不使用的文件，以及不使用的css代码

## [1.0.83-alpha.1] - 2019-01-18
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 算法文件夹中添加了BucketManager，以及多种strategy和transformer，并对原来的PipelineTool中的分桶做了重构
- 更换tag，属性值可选
### 删除项
- 删除algorithms文件夹下的大多数没有用到的算法

## [1.0.82-alpha.15] - 2019-01-17
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
PipelineTool
- 搜索框新增全选和反选按钮

## [1.0.82-alpha.14] - 2019-01-16
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Chen Biao [联系](mailto:943634218@qq.com)**
### 添加项
PipelineTool
- 增加背景注释，文字注释
- 增加根据名字/id搜索节点功能
- 加入了多个svg图标
### 修改项
- CommonLayout 修改删除确认框 删除icon 居中

## [1.0.82-alpha.13] - 2019-01-15
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- common card 增添 graph 主题
- common neighbors only flag for finding neighbors

## [1.0.82-alpha.12] - 2019-01-11
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
PipelineTool
- 节点样式设置
- 社群分组后显示"社群分组依据"，区别于自定义社群

## [1.0.82-alpha.9] - 2019-01-08
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
PipelineTool
- 修复AIP-41,50,43
- 上述jira issue对应的是对当前菜单混乱的重构
- 对SophonIcon加入onMouseEnter，onMouseLeave,使其满足antd对Tooltip和Popover的接口要求（不然hover上去没有效果）

## [1.0.82-alpha.8] - 2019-01-08
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
PipelineTool
- 画布信息处Node和Edge不再使用Switch调整是否显示，统一使用设置图标
- 线的颜色更加统一
- 统计Bar数字最多显示小数点后5位
- 社群手动探索中选类型后，属性未更新的bugfix
- 将清除功能（不包括删除）加入到submenu中
- ColorSquare禁用透明模式
- 提取上下文菜单公共css样式，并重构所有上下文菜单，包括编辑模式的widget，link菜单，canvas模式的上下文菜单
- 去除webpack中的alias配置，将所有绝对路径设置为相对路径，为按需加载做准备

## [1.0.82-alpha.5] - 2019-01-07
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 修改项
- 属性显示优化 以及 移除前进后退默认buttons
- layout后自动fit
- 统计Bar数字最多显示小数点后3位
- 颜色选择器ColorSquare支持透明色选择
- PipelineTool部分代码简化（引入了CommonService）

## [1.0.82-alpha.4] - 2019-01-05
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**QunHao Song**
### 修改项
- 社群菜单简化
- 取消节点的背景色，社群的背景色，增加统一的选中色
- PipelineTool的翻译
- 垂直时间轴ui更新
- 画布工具栏视觉更新

## [1.0.82-alpha.3] - 2019-01-04
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- PipelineTool添加反选功能, 是否只显示最短路径
- PipelineTool加入了图的fit功能
### 修改项
- PipelineTool边右击不弹出菜单问题的修复
- PipelineTool合并实体视觉更新
- PipelineTool tab切换时如果是空白canvas，仍旧渲染上一个tab的内容的bugfix


## [1.0.82-alpha.1] - 2019-01-03
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 添加合并实体功能

## [1.0.81-alpha.1] - 2018-12-29, 2019-01-02
### 修改人
**Chen Biao [联系](mailto:943634218@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 添加项
- 增添 WebsocketHandler.ts 封装socket.io 测试需要启动服务（socketIoServer.js）
- utils中加入了downloadFile工具函数
- 加入了更多的图标，如NewIcon，SnapshotIcon，SaveIcon，SaveAsIcon
### 修改项
- KG 视觉更新
- KG有机菜单使用antd的menu重写原来的div实现

## [1.0.80-alpha.1] - 2018-12-28
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- 重构社群
- 视觉更新

## [1.0.79-alpha.1] - 2018-12-26
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 新增 klay， cola， spread布局
### 修改项
- 修复更新布局，查看属性页面崩溃的问题


## [1.0.78-alpha.1] - 2018-12-26
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 属性增删改
### 修改项
- 调整 vertical timeline css
- fix 添加 节点造成的白屏error， 主要问题是 cynode 的params改为observable

## [1.0.77-alpha.1] - 2018-12-26
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 增添 server side rendering,当前实现暂不支持layout，显示都是grid layout，需要以后dig一下

### 修改项
- 删除bucket或者删除某个节点导致某个bucket中无任何节点时，删除bucket
- 清除图谱后删除所有bucket的bug
- 在cytoConfig中增加图谱性能优化参数，当元素超过200个时启用
- 重构右击菜单的代码
- 右击元素时选中元素，并清除其他元素的选中，最后的效果是"删除选中"的上下文显得逻辑更加统一

## [1.0.76-alpha.5] - 2018-12-24
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 增添 vertical timeline

### 修改项
- 隐藏显示类型，社群时的bugfix，由于cytoscape本身的bug，存在社群的时候，如果把社群或者类型隐藏，然后改变layout，再次点击显示时会显示不出，
现在改为在显示后，强制用当前内存中的数据刷新一遍界面
- 交互更新，单击统计bar进入详情，hover上去可以编辑元信息
- windows中右击默认上下文菜单的禁用
- i18n不统一修正
- 去除多余note操作

## [1.0.75-alpha.1] - 2018-12-20
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 添加项
- add ‘Find shortest path’
- 添加路径发现
- 加入左侧hoverButtons
### 修改项
- update tags
- 更新右侧属性框的整体功能，现在只有2个tab
- 超出下方的菜单不再隐藏不见

## [1.0.74-alpha.8] - 2018-12-19
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**

### 添加项
- PipelineTool增加onTabSwitched事件
### 修改项
- Horizontal Timeline label rotate被遮挡问题,
- PipelineTool的pipeline对象引入可选的parentName和parentId属性
- 解决删除节点的npe


## [1.0.74-alpha.4] - 2018-12-18
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 新增findNeighbor功能
### 修改项
- Horizontal Timeline 添加 label rotate 及 plain 模式,
- PipelineTool区分隐藏元素类型，隐藏边类型，隐藏社群类型
- PipelineTool去除Bucket的渲染
- PipelineTool属性tab布局的调整

## [1.0.74-alpha.2] - 2018-12-18
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- remove  "sophon-utils": "file:.yalc/sophon-utils",

## [1.0.74-alpha.1] - 2018-12-18
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- 增添 Horizontal Timeline 组件

## [1.0.73-alpha.1] - 2018-12-17
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 添加项
- PipelineTool选取多个元素，显示他们的统计信息

## [1.0.72-alpha.3] - 2018-12-13
### 修改人
**Qi Yang [联系](mailto:iamyangqi@sina.com)**
### 添加项
- 添加Steps组件

## [1.0.72-alpha.1] - 2018-12-12
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 添加项
- node 添加 note 功能

## [1.0.71-alpha.2] - 2018-12-11
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### fix bug
- Fix bug 点击名称列(默认显示列)触发两次openFile调用

## [1.0.71-alpha.1] - 2018-12-11
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com    )**
### 新增项
- PipelineTool新增历史前进后退，以及保存恢复功能
### 修改项
- 底层实现重构，现在所有状态都可以在下一次重绘时保持
- Commonlayout card 模式下 不给 icon 报错问题

## [1.0.70-alpha.47] - 2018-12-10
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### fix bug
- Fix bug cardList(卡片列表)状态时自定义按钮不显示

## [1.0.70-alpha.46] - 2018-12-10
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### fix bug
- Fix bug 树形节点选择后当前前需重置为1

## [1.0.70-alpha.45] - 2018-12-06
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### fix bug
- Fix bug 卡形式列表展示缺少分享按钮


## [1.0.70-alpha.44] - 2018-12-05
### 修改人
**Qi Yang [联系](mailto:iamyangqi@sina.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
- PipelineTool的canvas渲染中，增加了图的保存于恢复
- ColorSquare控件，用于筛选颜色

### 修改项
- SEditor 优化代码
- 重构了PipelineTool关于canvas渲染的实现机制，已经支持修改类型颜色，修改分桶颜色。


## [1.0.70-alpha.41] - 2018-12-03
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### 修改项
- Fix bug 工具栏添加分享按钮

## [1.0.70-alpha.37] - 2018-11-30
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
- Commonlayout table 支持 expandable row
- 增加了NumericInput控件
- PipelineTool配色增加到80个
- PipelineTool增加边，节点过滤。
- PipelineTool增加数字类型分桶功能

### 修改项
- PipelineTool社群颜色bugfix
- PipelineTool右击判断背景的bugfix
- 给所有图上节点的id设置为canonicalId

## [1.0.70-alpha.35] - 2018-11-30
### 修改人
**Qi Yang [联系](mailto:iamyangqi@sina.com)**
### 修改项
- SEditor 修改样式

## [1.0.70-alpha.22] - 2018-11-28
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 修改项
- Menucommonlayout icon 颜色更改
- PipelineTool增加了边设置，节点设置，权重，cluster分组

## [1.0.70-alpha.20] - 2018-11-28
### 修改人
**Qi Yang [联系](mailto:iamyangqi@sina.com)**
### 增加项
- commonlayout column 增添 checkDisabled 选项，禁止单行选中
- 添加SEditor测试页面

## [1.0.70-alpha.19] - 2018-11-28
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 增加项
- commonlayout column 增添 stopPop 选项
### 修改项
- FlvPlayer 样式修改， 缩小 全屏icon 右边距离
- PipelineTool LPA开始支持（还不完善）

## [1.0.70-alpha.18] - 2018-11-27
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### 增加项
- commonlayout 操作列阻止冒泡

## [1.0.70-alpha.17] - 2018-11-27
### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**
### 修改项
- Chrome tab 隐藏，直播视频会paused 导致的延迟问题，当visible的时候 充值 currentTime
- Chrome autoplay policy改变导致的 刷新页面 直播视频画面卡住问题
- FlvPlayer 引入 autoplay props

## [1.0.70-alpha.16] - 2018-11-26
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
### 增加项
- PipelineTool Canvas有机菜单允许自定义选项canvasContextMenuOptions
- PipelineTool的singleton模式，当采取这个模式时，所有新算子的名字不能和已经存在的算子名字重复，算子可以通过点击复制来克隆出一个对象，该对象与当前
算子的属性保持同步。只要算子名字一样，他们的属性就保持同步

## [1.0.70-alpha.14] - 2018-11-23
### 修改人
**Zang Hui [联系](mailto:313535256@qq.com)**
### 增加项
- 整行点击事件,默认与点击首列一致

### 修改项
- pipelineTool增大线条的响应面积，方便交互

## [1.0.70-alpha.11] - 2018-11-22
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- PipelineTool支持表单验证
- PipelineTool的Canvas支持最短路径，A*算法

### 修改项
- 错误弹出框默认展示时间从2秒修改为4秒

## [1.0.70-alpha.9] - 2018-11-20
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**
**Yang Qi[联系](mailto:iamyangqi@sina.com)**

### 增加项
- Customized SEditor，支持富文本编辑(By Yang Qi)
- PipelineTool的Canvas支持dfs,bfs搜索，以及Page Ranking

### 修改项
- PipelineTool的连接的name从params中移动到了顶层属性

## [1.0.70-alpha.5] - 2018-11-20
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- 增加了PipelineTool在displayMode下，提供renderAsCanvas选项，即展示使用Canvas，背后使用了
cytoscape类库，提供grid,circle,concentric和dagre四种布局

### 修改项
- 修改PipelineTool放大缩小的逻辑，之前的实现是错误的
- 更新react-dnd,react-dnd-html5backend的所有版本

## [1.0.69-alpha.13] - 2018-11-15
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- 增加AttributeSelector组件的callbacks，在添加/删除规则时，回调函数会被调用
- 增加了yarn build-local命令，用于本地通过yarn link将sophon-utils发布给其他sophon产品使用,
yarn build-local和yarn build基本是一致的，只是前者有sourceMap,方便本地调试。
- yarn build命令编译出来的产品不再有sourceMap。

## [1.0.69-alpha.10] - 2018-11-14
### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- 增加sql规则控件

### 修改项
- 将所有组件内部的ReactDND的依赖全部移除，未来希望sophon的项目自己
管理自己的ReactDND组件

## [1.0.69-alpha.7] - 2018-11-12

### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**

### 修改项
- 对 uitls 进行瘦身， 对 react， antd等不进行bundle

## [1.0.69-alpha.6] - 2018-11-12

### 修改人
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**

### 修改项
- 修复mobx@5.5.2，delete property操作带来的stackoverflow 问题

## [1.0.69-alpha.5] - 2018-11-09

### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 修改项
- pipelineTool在编辑模式和展示模式下openPipeline函数的实现
- 将所有的测试都是移入iot_test
- 升级ts-loader

## [1.0.69-alpha.4] - 2018-11-09

### 修改人
**Chen Biao [联系](mailto:943634218@qq.com)**
**Guanhui Chen [联系](mailto:guanhuichen@gmail.com)**

### 修改项
- 对DateTimePicker支持国际化。 Biao
- PLayer 和 DeviceModel 解耦，并修复 切换 location不更新视频bug - Guanhui


## [1.0.69-alpha.2] - 2018-11-08
- initPieline方法增加@action注解

## [1.0.69-alpha.1] - 2018-11-08

### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- 增加了PipelineTool的只读选项displayMode，当提供displayMode为true时，需要提供类型为IPipelineJson的pipeline属性，用于展示一个完整的图，
在展现模式下，左侧的WidgetPanel会被隐藏，右侧的属性Panel只显示不可编辑的Key:Value对。
- 当displayMode为false，即编辑模式时，左侧的WidgetPanel需要一个标题，因此增加了widgetPanelTitle属性

### 修改项
- 对PipelineTool的callback属性做出调整，即编辑模式需要提供，只读模式不需要提供。

## [1.0.68-alpha.1] - 2018-11-08

### 修改人
**Qiu Cheng [联系](mailto:454519934@qq.com)**

### 增加项
- 增加了SophonModal组件，并借此机会引入了styled-components库，
SophonModal代码和使用都非常直观，建议使用。
- 为PipelineTool组件添加了脏检查，当一个pipeline为dirty时(比如移动了一个widget的位置，
移动了scrollBar，更变了ratio大小，或者修改了任意的widget或者link的属性)，并且当用户试图关闭时，
会弹出Modal提醒（使用SophonModal编写）
- 为PipelineTool添加了onTabsClear的属性，该属性是必填属性，用于指明当tabs全部关闭时应该拥有的行为，
一种常见的做法是跳回到Pipeline列表。
- PipelineTool增加算子（Widget）的搜索功能。
- 增加了PipelineTool左下角的状态栏参数statusArea,使用者可以传入一个React.ReactNode类型来自定义这块区域的展示。
