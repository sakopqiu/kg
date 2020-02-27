import {CyElement, CyElementData, CyType} from './CyElement';
import {ElementGroup} from 'cytoscape';
import {FindPathInnerPath} from '../kg-interface';
import {computed, observable} from 'mobx';
import {CyState} from './CyState';
import {getTranslation} from '../../../utils';
import {CyNode} from './CyNode';
import {CyEdge} from './CyEdge';
import {CyElementDefaultClass} from '../interfaces';
import {AssortedInnerPathId, calculatePathId} from '../../PipelineEditor/cyto/cyto-utils';
import _flatten from 'lodash/flatten';

/**
 * 一条PathBeaconEdge代表了节点A->B的一条虚拟路径，虚拟路径中可以包含多条子路径(CyAssortedInnerPath)，
 * 每条子路径起始节点相同，但中间的边的名字不同，如
 * A->B的某条虚拟路径包含了两条子路径
 * A->transfer->transfer->B
 * A->knows->knows->B
 * CyFindPathBeaconEdge的唯一标识由起点和终点共同决定，详见CyFindPathBeaconEdge.idFor方法
 *
 * 但是某条子路径内，又包含了真实的路径，比如A->transfer->transfer->B这样一条子路径中，A与B实际发生过100次类似的转账关系，
 * 那么子路径(CyAssortedInnerPath)的realEdges中就是包含了这100条数据
 *
 */
export class CyFindPathBeaconEdge extends CyElement {
    static defaultClass = CyElementDefaultClass.FIND_PATH_BEACON;

    public data: CyFindPathBeaconEdgeData;

    get group(): cytoscape.ElementGroup {
        return 'edges' as ElementGroup;
    }

    static idFor(src: string, target: string) {
        return src + ' - ' + target;
    }

    static getSrcAndTarget(beaconId: string) {
        return beaconId.split('-').map(id => id.trim());
    }

    public constructor(public cyState: CyState, source?: CyNode, target?: CyNode, innerPaths?: FindPathInnerPath[]) {
        super(cyState);
        this.data = new CyFindPathBeaconEdgeData(cyState);
        if (source && target && innerPaths) {
            this.data.id = CyFindPathBeaconEdge.idFor(source.data.id, target.data.id);
            this.data.source = source.data.id;
            this.data.target = target.data.id;
            this.addInnerPaths(innerPaths);
        }
    }

    public addInnerPaths(innerPaths: FindPathInnerPath[]) {
        innerPaths.forEach((innerPath) => {
            const pathId = calculatePathId(innerPath);
            let assortedPath = this.data.assortedInnerPathMap.get(pathId);
            if (!assortedPath) {
                assortedPath = new CyAssortedInnerPath(pathId);
                assortedPath.vertices = [];
                // 确保vertices按照边的顺序进行排序（API返回的不排序）
                // const vids = innerPathVertexIds(innerPath);
                // for (const vid of vids) {
                //     assortedPath.vertices.push(innerPath.vertices.find(v => v.data.id === vid)!);
                // }
                //  API现在已经会对vertex正确排序了，原来的逻辑可以简化,以防万一原来逻辑暂时不删除
                assortedPath.vertices = [...innerPath.vertices];
                assortedPath.edgeNames = innerPath.edges.map((e) => e.data.name);
                this.data.assortedInnerPathMap.set(pathId, assortedPath);
            }
            assortedPath.realEdges.push(innerPath.edges);
        });
        this.data.originalPathsCount = this.data.assortedInnerPathMap.size;
    }

    isHidden() {
        if (this.cyState.drawService.timeFilterService.showTimeFilter) {
            return true;
        }
        const visibleNodesId = this.cyState.drawService.dataDriverProcessor.allVisibleNormalNodeIds;
        if (!visibleNodesId.has(this.data.source)) {
            return true;
        } else if (!visibleNodesId.has(this.data.target)) {
            return true;
        }
        return false;
    }

    toJSON() {
        // 不需要getter数据就用Object.assign
        const dataJSON = this.data.toJSON();
        const obj: any = Object.assign({}, this);
        obj.data = dataJSON;
        delete obj.classSet;
        delete obj.cyState;
        // delete obj.selected;
        delete obj.data.cyState;
        return obj;
    }

    selfLoopSetup() {
        if (this.data.source === this.data.target) {
            this.addClass(CyElementDefaultClass.SELF_LOOP);
        }
    }

    static fromJSON(json: any, cyState: CyState) {
        const result = new CyFindPathBeaconEdge(cyState);
        result.data = CyFindPathBeaconEdgeData.fromJSON(json.data, cyState);
        result.selected = json.selected || false;
        return result;
    }
}

export class CyFindPathBeaconEdgeData extends CyElementData {
    source: string;
    target: string;
    originalSrcId: string;
    originalTargetId: string;

    // 路径会随着用户的操作而减少，因此需要记录一下最早生成路径的时候的总量
    public originalPathsCount: number;

    // 一条路径可能是 a=>knows=>b=>transfers=>c，这里node虽然相同，边的名字也相同，但是中间的边可能都是不同的
    // key为路径的人可读的格式，value是一条CyAssortedInnerPath
    @observable public assortedInnerPathMap: Map<AssortedInnerPathId, CyAssortedInnerPath>
        = new Map<AssortedInnerPathId, CyAssortedInnerPath>();

    @computed
    get assortedInnerPaths() {
        return Array.from(this.assortedInnerPathMap.values());
    }

    /**
     * 一条虚拟路径下的所有节点和边
     * 虚拟路径包含多条子路径，每条子路径又包含多条真实路径
     * @returns {{vertices: any; edges: any}}
     */
    @computed
    get allVerticesAndEdges() {
        const vertexMap: Map<string, CyNode> = new Map();
        const edgeMap: Map<string, CyEdge> = new Map();
        for (const innerPath of this.assortedInnerPaths) {
            for (const v of innerPath.vertices) {
                vertexMap.set(v.data.id, v);
            }
            for (const e of innerPath.edges) {
                edgeMap.set(e.data.id, e);
            }
        }
        const vertices = Array.from(vertexMap.values());
        const edges = Array.from(edgeMap.values());
        return {vertices, edges};
    }

    toJSON() {
        return {
            id: this.id,
            source: this.source,
            target: this.target,
            originalPathsCount: this.originalPathsCount,
            innerPaths: Array.from(this.assortedInnerPathMap.values()),
        };
    }

    static fromJSON(json: any, cyState: CyState) {
        const r = new CyFindPathBeaconEdgeData(cyState);
        r.id = json.id;
        r.source = json.source;
        r.target = json.target;
        r.originalPathsCount = json.originalPathsCount;

        // 从历史中读取时
        if (json.innerPaths) {
            json.innerPaths.forEach((p: any) => {
                const path = new CyAssortedInnerPath(p.id);
                path.vertices = p.vertices.map((v: any) => CyNode.fromJSON(v, cyState));
                path.edgeNames = p.edgeNames;
                path.realEdges = p.realEdges.map((edges: any[]) => {
                    return edges.map((e: any) => CyEdge.fromJSON(e, cyState));
                });
                r.assortedInnerPathMap.set(path.id, path);
            });
        } else {
            r.assortedInnerPathMap = json.assortedInnerPathMap;
        }
        return r;
    }

    get cyType(): CyType {
        return CyType.PATH_BEACON_EDGE;
    }

    get width() {
        return 2;
    }

    get selectedWidth() {
        return this.width * 2;
    }

    get displayLabel() {
        const locale = this.cyState!.drawService.canvasStore.locale;
        return getTranslation(locale, 'Paths', {count: this.assortedInnerPathMap.size});
    }
}

export class CyAssortedInnerPath {
    constructor(public id: AssortedInnerPathId) {
    }

    // 确保初始化vertices的时候，顺序和edges任意一条边的顺序一致
    public vertices: CyNode[] = [];

    // addMixture时，需要把realEdges中的所有边全部加入
    public get edges() {
        return _flatten(this.realEdges);
    }

    public edgeNames: string[] = [];
    // peter=>转账=》john=》认识=》jean
    // 这样一条路径，API返回可能包含多条，但是每条边内部的属性不一定相同

    /**
     *  比如有这样一条路径:
     *  john=>转账=》jean=>存钱=》中国银行（路径）
     *  其中vertices=john, jean, 中国银行
     *  然后存在两条realEdges
     *  john =>转账（id=1,日期2006）=》jean=>存钱（id=1,日期2007）=》中国银行
     *  john =>转账（id=2,日期2008）=》jean=>存钱（id=2,日期2008）=》中国银行
     */

    public realEdges: CyEdge[][] = [];

}
