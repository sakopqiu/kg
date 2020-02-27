import {DimensionInterface, SophonEchartDataset, SophonEchartDatasetRow} from './bi-interface';
import {Classifier, Counter, isNumberType, sortArr, sortMapByKey} from '../../utils';
import {AggregateType, doStatsCalculation, fieldIndex, fieldType, StatsType} from '../../BiUtils';

/**
 * 将一个sophon echart数据集根据某个或者某两个字段进行分组（groupBy操作）的封装类
 * 举例
 * id name level country city
 * 1  jack   1    china  shanghai
 * 2  jean   2    america  ny
 * 3  aubrey 2    america  LA
 * 4  ligang 2    china  shanghai
 * 5  peter  3    china  beijing
 *
 * 如果根据country进行分组，对level可以进行计数，总和，平均数，最大最小值统计。
 * 这些统计中除了计数，均可以理解为是聚合值
 * 那么level的属性就为
 * china: [1,2,3]，总和聚合值=6，平均数=2
 * america: [2]，总和聚合值=2，平均数2
 * 如果要统计计数，就比较麻烦
 * china: level=1=>[jack],level=2=>[ligang],level=3>peter
 * america: level=2=>[jean, aubrey]
 *
 */

type GroupByType = string;

export class DatasetAggregation {
    /*
     groupBy最多可以根据两个条件进行分组，比如国家和性别，那么可以组合出
     指定了一个条件的=> 中国，美国，日本
     指定了2个条件的=> 中国：男，中国：女，美国：女等等
      */

    primaryField: string = '';
    secondaryField: string = '';

    constructor(public dataset: SophonEchartDataset) {

    }

    private setFields(primaryField: string, secondaryField: string) {
        this.primaryField = primaryField;
        this.secondaryField = secondaryField;
    }

    private groupByKey(row: SophonEchartDatasetRow) {
        const primaryFieldIndex = fieldIndex(this.dataset, this.primaryField);
        // 二级可以不指定
        const secondaryFieldIndex = this.secondaryField !== '' ?
            fieldIndex(this.dataset, this.secondaryField) : -1;

        if (primaryFieldIndex === -1) {
            throw new Error('请至少提供一个有效的groupBy属性');
        }
        let result = `${this.primaryField}=${row[primaryFieldIndex]}`;
        if (secondaryFieldIndex !== -1) {
            result += ':' + `${this.secondaryField}=${row[secondaryFieldIndex]}`;
        }
        return result;
    }

    // 注意targetField对应的类型需要为数字，因为只有数字类型才有aggregate的意义
    // 输入每一行，对每一行的数据根据 primaryField:secondaryField(GroupByType)进行分类
    // ，然后将row[targetField]的值根据groupKey进行分组
    // 返回值是一个map，key为groupKey，value为对应的数值数组
    private classifyData(targetField: string) {
        const targetFieldIndex = fieldIndex(this.dataset, targetField);
        const classifier: Classifier<GroupByType, number> = new Classifier<GroupByType, number>();
        for (const row of this.dataset.source) {
            const groupByKey = this.groupByKey(row);
            const value = row[targetFieldIndex];
            classifier.add(groupByKey, value as number);
        }
        return classifier.sortedResult();
    }

    count(targetField: string) {
        const targetFieldIndex = fieldIndex(this.dataset, targetField);
        const counter: Counter = new Counter();
        for (const row of this.dataset.source) {
            counter.add(row[targetFieldIndex]);
        }
        const counterResult = counter.sortedResult();
        const echartDataset: SophonEchartDataset = {
            name: targetField,
            dimensions: [
                {
                    name: targetField,
                    type: 'ordinal',
                },
                {
                    name: 'COUNT',
                    type: 'int',
                },
            ],
            source: Array.from(counterResult.entries()),
        };
        return echartDataset;
    }

    // TODO!!! aggregateType暂时不支持众数，因为他返回值可能是一个string
    // 当用户只设置了primaryField,并且targetField的类型是number时，这种情况下可以做很多统计
    aggregate1(primaryField: string, targetField: string, statsType: StatsType) {
        this.setFields(primaryField, '');
        const targetFieldType = fieldType(this.dataset, targetField);
        if (!isNumberType(targetFieldType)) {
            throw new Error('聚合统计需要针对一个数值类型进行');
        }

        const classification = this.classifyData(targetField);
        // 如果aggType是求和，结果将groupKey:[1,2,3]转换成groupKey:sum(1,2,3)的string形式（因为众数（Mode)可能有多个，输出值是以；为分隔的string格式，
        // 如1；3)
        let conversion = new Map<GroupByType, number>();
        Array.from(classification.keys()).forEach((groupKey: GroupByType) => {
            conversion.set(groupKey, doStatsCalculation(classification.get(groupKey)!, statsType as AggregateType) as number);
        });
        conversion = sortMapByKey(conversion);

        const echartDataset: SophonEchartDataset = {
            name: targetField,
            dimensions: [
                {
                    name: targetField,
                    type: 'ordinal',
                },
                {
                    name: statsType,
                    type: 'float',
                },
            ],
            source: Array.from(conversion.entries()),
        };
        return echartDataset;
    }

    /**
     *
     * @param {string} primaryField
     * @param {string} targetField
     * 当用户只设置了primaryField，且targetField为非number类型时，需要作出每种子类型的统计
     *
     * 假设根据国家聚合,对人工作的所属行业进行统计
     * 第一步，生成一个以国家为key, value为Counter<string|date|timestamp>的Map
     * 美国: Counter{第一产业:2, 第二产业：3}
     * 中国: Counter{第二产业：3，第一产业:5,第三产业:10}
     *
     * 第二步，生成数据集的dimension，其中dimension的第一列为国家名，后面的列为所有counter的key，即第一产业~第三产业，此处可以对列进行排序
     * 国家 第一产业 第二产业 第三产业
     *
     *
     * 第三步，生成数据集的rows，每一行以国家民做为索引，
     * 国家 第一产业 第二产业 第三产业
     * 美国 2  3 0(无数据）
     * 中国 5  3 10
     */

    aggregate11(primaryField: string, targetField: string) {
        this.setFields(primaryField, '');
        const dataset = this.dataset;
        // 第一步
        const primaryKeyIndex = fieldIndex(dataset, primaryField);
        const targetKeyIndex = fieldIndex(dataset, targetField);

        const outerMap = new Map<any, Counter>();
        for (const row of dataset.source) {
            const primaryKey = primaryField + '=' + row[primaryKeyIndex];
            const counter = outerMap.get(primaryKey) || new Counter();
            if (row[targetKeyIndex]) {// 空值直接不统计了
                counter.add(`${targetField}=${row[targetKeyIndex]}`);
            }
            outerMap.set(primaryKey, counter);
        }

        // 第二步，生成数据集的dimension，其中dimension的第一列为国家名，后面的列为所有counter的key，即第一产业~第三产业
        const dimensions: DimensionInterface[] = [
            {name: primaryField, type: 'ordinal'},
        ];
        const dynamicDimensionKeys: Set<string> = new Set<string>();
        // 对innerMap里的所有key做遍历，找出所有的年龄值
        for (const key of outerMap.keys()) {
            const counter = outerMap.get(key)!;
            for (const key of counter.keys) {
                dynamicDimensionKeys.add(key);
            }
        }
        // 对列进行排序
        const keys = sortArr(Array.from(dynamicDimensionKeys.keys()));

        for (const dKey of keys) {
            dimensions.push({
                name: dKey,
                type: 'int', // 都是统计计数，所以int足够了
            });
        }

        // 第三步，生成数据集的rows，每一行以国家民做为索引，
        const rows = [];
        for (const key of outerMap.keys()) {
            const row = [];
            row[0] = key;
            const counter = outerMap.get(key)!;
            for (let i = 1; i < dimensions.length; i++) {
                row[i] = counter.has(dimensions[i].name) ? counter.get(dimensions[i].name) : 0;
            }
            rows.push(row);
        }

        const echartDataset: SophonEchartDataset = {
            name: `${primaryField}=>${targetField}`,
            dimensions,
            source: this.sortRows(rows),
        };
        return echartDataset;
    }

    /*
     * @param {string} primaryField
     * @param {string} secondaryField
     * @param {string} targetField
     * @param {statsType} StatsType
     * 假设根据国家和年龄进行聚合,对收入进行求最小值统计
     * 第一步，生成一个以国家为key，年龄Map<age,ageValue[]>为value的嵌套value，
     * 美国: {20岁:[$25,$30,$30],12岁:[$21,$22,$30],}
     * 中国: {12岁:[$11,$12,$15], 22岁:[$28,$32,$37]}
     *
     * 第二步，对每个嵌套的数组进行聚合操作，这里求最小值
     * 美国: {20岁:$25, 12岁:$21}
     * 中国: {12岁:$11, 22岁:$28}
     *
     * 第三步，生成数据集的dimension，其中dimension的第一列为国家名，后面的列为嵌套数组中所有的key，即年龄,并进行排序
     * 国家 12岁 20岁 22岁
     *
     *
     * 第四步，生成数据集的rows，每一行以国家民做为索引，
     * 国家 12岁 20岁 22岁(第三部生成的dimension，此处做辅助参考）
     * 美国 $21  $25 $0(无数据）
     * 中国 $11  $0  $22
     */
    aggregate2(primaryField: string, secondaryField: string, targetField: string, statsType: StatsType) {
        this.setFields(primaryField, secondaryField);
        const targetFieldType = fieldType(this.dataset, targetField);
        if (!isNumberType(targetFieldType)) {
            throw new Error('聚合统计需要针对一个数值类型进行');
        }

        const dataset = this.dataset;
        // 第一步
        const primaryKeyIndex = fieldIndex(dataset, primaryField);
        const secondaryKeyIndex = fieldIndex(dataset, secondaryField);
        const targetKeyIndex = fieldIndex(dataset, targetField);

        // 这里的内层map有number或者number[]是因为第一步中保存的是数组，第二步扁平化后变成了单一数值，为了
        // 提升性能，防止不必要的新对象重建与拷贝，这里共同使用同一个数据结构
        const outerMap = new Map<any, Map<any, number[] | number>>();
        for (const row of dataset.source) {
            const primaryKey = row[primaryKeyIndex];
            const innerMap = (outerMap.get(primaryKey) || new Map<any, number[]>()) as Map<any, number[]>;
            const secondaryKey = secondaryField + '=' + row[secondaryKeyIndex]; // echart希望dimension里的key都是string
            const innerArray = innerMap.get(secondaryKey) || [];
            // 如果缺失，就设置为0
            innerArray.push((row[targetKeyIndex] || 0) as number);
            innerMap.set(secondaryKey, innerArray);
            outerMap.set(primaryKey, innerMap);
        }

        // 第二步
        // 先拿到国家，这里的key是国家
        for (const key of outerMap.keys()) {
            const innerMap = outerMap.get(key) as Map<any, number[]>; // 中国: {12岁:[$11,$12,$15], 22岁:[$28,$32,$37]}
            for (const innerKey of innerMap.keys()) {
                const values = innerMap.get(innerKey) as number[]; // [$11,$12,$15]
                const flattenedValue = doStatsCalculation(values, statsType as AggregateType); // 这一步将数据扁平化
                innerMap.set(innerKey, flattenedValue as any);
            }
        }

        // 第三步，生成dimension,第一列为primaryField，例子里为国家
        const dimensions: DimensionInterface[] = [
            {name: primaryField, type: 'ordinal'},
        ];
        const dynamicDimensionKeys: Set<string> = new Set<string>();
        // 对innerMap里的所有key做遍历，找出所有的年龄值
        for (const key of outerMap.keys()) {
            const innerMap = outerMap.get(key) as Map<any, number>;
            for (const innerKey of innerMap.keys()) {
                dynamicDimensionKeys.add(innerKey);
            }
        }

        const keys = sortArr(Array.from(dynamicDimensionKeys.keys()));
        for (const dKey of keys) {
            dimensions.push({
                name: dKey,
                type: 'float',
            });
        }

        const rows: SophonEchartDatasetRow[] = [];
        // 第四步，对每一个outer key进行遍历（美国，中国），然后对dimension定义的每一列去看对应是否存在innerKey，存在就设置上，不存在就设置为0
        for (const key of outerMap.keys()) {
            const row = [];
            row[0] = key;
            const innerMap = outerMap.get(key) as Map<string, number>;
            for (let i = 1; i < dimensions.length; i++) {
                row[i] = innerMap.has(dimensions[i].name) ? innerMap.get(dimensions[i].name) : 0;
            }
            rows.push(row);
        }

        const echartDataset: SophonEchartDataset = {
            name: `${primaryField}-${secondaryField}=>${targetField}`,
            dimensions,
            source: this.sortRows(rows),
        };
        return echartDataset;
    }

    // 每一行第一列是x轴，后几列都对应y轴，所以需要以第一列的值为参考，进行行排序
    sortRows(rows: SophonEchartDatasetRow[]) {
        const map: Map<any, SophonEchartDatasetRow> = new Map<any, SophonEchartDatasetRow>();
        for (const row of rows) {
            map.set(row[0], row);
        }
        const sortedRowKeys = sortArr(Array.from(map.keys()));
        const result: SophonEchartDatasetRow[] = [];
        for (const key of sortedRowKeys) {
            result.push(map.get(key)!);
        }
        return result;
    }

}
