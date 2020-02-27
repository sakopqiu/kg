export interface IMappingTargetEntry<ExtraInfo = any> {
    name: string;
    customId?: string; // 对于用户自定义entry，由于没有固定的name或者attr去进行表示，可能两个entry的name都为空，这时候需要一个id来生成react的key，进行diff算法
    isCustom: boolean; // 是否是用户自定义
    type: '' | string; // 未映射上时为空字符串，否则为元素类型
    desc?: string;
    specialBackgroundColor?: string; // 如果定义了specialBackgroundColor，那么title上的背景颜色和普通的不一样，以示区别
    specialColor?: string; // 如果定义了specialColor，那么title上的字体颜色和普通的不一样，以示区别
    specialIcon?: React.ReactNode; // 位置建议为position:absolute,icon位置相对于entry的body设置
    defaultTableName: string; // 初始化值，映射上的表的表明
    defaultTableId: string; // 初始化值，映射上的表id
    defaultTableAttr: string; // 初始化值，映射上的表属性
    extraInfo?: ExtraInfo; // 存额外信息的
}
