import TagImage from '../../../images/kg/tag.png';
import NoteImage from '../../../images/kg/note.png';
import {CyElementDefaultClass, NodeShape} from '../interfaces';
import _isNil from 'lodash/isNil';
import {action, observable, runInAction} from 'mobx';
import {NodeWithPosition, NodeWithPositionData} from './NodeWithPosition';
import {TimePropertyCache, TimePropertyCacheItem} from './TimePropertyCache';
import {normalizeTimeString, TimePrecision, trimStr} from '../../../utils';
import {CyState} from './CyState';
import {CyElementData, CyType, HasParent} from './CyElement';
import {
    BACKGROUND_IMAGE_RATIO,
    getBackgroundIcon,
    getRoundRectangleArray,
    NODE_NORMAL_SIZE,
    NUMBER_PRECISION,
    RADIUS_ITERATION,
    RECTANGLE_RADIUS,
} from '../../common/cytoscapeCommonStyle';
import {Community} from './Community';

const PLACEHOLDER = 'none';

export class CyNodeData extends NodeWithPositionData implements HasParent {
    static RANK_DEFAULT = 0.01;
    static SIZE_SMALL = NODE_NORMAL_SIZE;
    static SIZE_MAX = 180;
    // -1代表不使用用户设置的大小，使用pageRank计算出来的
    static AUTO_SIZE = -1;

    static DEFAULT_SHAPE: NodeShape = 'polygon'; // 自定义的带圆角的polygon
    static DEFAULT_BORDER_COLOR: string = 'transparent';
    public id: string;
    public name: string;
    public nodeType: string;
    @observable public rank: number = CyNodeData.RANK_DEFAULT; // page rank
    @observable public parent: string = '';

    @observable public shape: NodeShape = CyNodeData.DEFAULT_SHAPE;
    // 图标是哪个
    public labelType: string = '';
    @observable public params: Map<string, any> = new Map<string, any>();
    @observable public note?: string;
    @observable public tags: string[] = [];
    @observable public manualSize: number = CyNodeData.AUTO_SIZE; // 手动设置的大小，-1代表没有手动设置过,使用PageRank算法设置大小
    @observable public borderColor: string = CyNodeData.DEFAULT_BORDER_COLOR;

    get showLabel() {
        return !this.cyState!.canvasSetting.hideNodeLabel;
    }

    get displayLabel() {
        return !this.cyState!.canvasSetting.hideNodeLabel ? trimStr(this.name) : '';
    }

    get cyType() {
        return CyType.NODE;
    }

    setName(name: string) {
        this.name = name;
    }

    // 返回一个节点的所有时间属性的值,key为该属性的canonical表达，value为根据时间精度normalize的值，
    // 比如一个person的出生时间和入学时间存在，并且存在年龄，工作等属性，那么非时间类型会被过滤，并且返回值可能是这样一个map
    /*
     * {
     *    "person-birthDate-vertex": "2000", // 如果精度是年
     *    "person-enrollDate-vertex": "2015",
     * }
     */
    timeProperties(cache: TimePropertyCache, timePrecision: TimePrecision) {
        const result: Map<string, string> = new Map<string, string>();

        // 遍历节点的所有属性，如果是时间类型的，加入到map里
        for (const field of this.params.keys()) {
            const canonicalRepresentation = TimePropertyCacheItem.canonicalRepresentation(
                'vertex', this.nodeType, field);
            if (cache.has(canonicalRepresentation)) {
                result.set(canonicalRepresentation, normalizeTimeString(this.params.get(field)!, timePrecision));
            }
        }
        return result;
    }

    public getValue(key: string) {
        if (key === 'id') {
            return this.params.get('id') || this.id;
        }
        if (key === 'name') {
            return this.params.get('name') || this.name;
        }
        return this.params.get(key);
    }

    isCustomizedStyle() {
        return this.manualSize !== CyNodeData.AUTO_SIZE;
    }

    get borderWidth() {
        if (this.borderColor !== CyNodeData.DEFAULT_BORDER_COLOR) {
            return 4;
        }
        return 0;
    }

    get size() {
        let finalSize;
        if (this.isCustomizedStyle()) {
            finalSize = this.manualSize;
        } else {
            const percent = (this.rank - this.cyState!.MIN_RANK) / (this.cyState!.MAX_RANK - this.cyState!.MIN_RANK);
            finalSize = CyNodeData.SIZE_SMALL + percent * (CyNodeData.SIZE_MAX - CyNodeData.SIZE_SMALL);
        }
        return Number(finalSize.toFixed(NUMBER_PRECISION));
    }

    get fontSize() {
        if (this.size < CyNodeData.SIZE_SMALL) {
            return 22;
        }
        return this.size / CyNodeData.SIZE_SMALL * 22;
    }

    @action
    public setValue(key: string, value: any) {
        this.params.set(key, value);
    }

    @action
    public setNote(note: string) {
        this.note = note;
    }

    @action
    public setTag(tags: string[]) {
        this.tags = tags;
    }

    @action
    public removeNote() {
        this.note = undefined;
    }

    @action
    public removeTag() {
        this.tags = [];
    }

    @action
    removeKey(key: string) {
        this.params.delete(key);
    }

    get backgroundImage() {
        const backgroundImage = [];
        // background image array - 依次占位 background image, note image, tag image
        // order is important since it's layering one on top of each other.
        backgroundImage[0] = getBackgroundIcon(this.labelType, this.cyState!.theme);

        if (this.note) {
            backgroundImage[1] = NoteImage;
        } else {
            backgroundImage[1] = PLACEHOLDER;
        }

        if (!_isNil(this.tags) && this.tags.length) {
            backgroundImage[2] = TagImage;
        } else {
            backgroundImage[2] = PLACEHOLDER;
        }
        return backgroundImage;
    }

    get roundRectangleArray() {
        if (this.shape !== 'polygon') {
            // shape-polygon-points 只在 polygon模式下work
            return [];
        }
        return getRoundRectangleArray(RECTANGLE_RADIUS, this.size, RADIUS_ITERATION);
    }

    private decoratorIconSize() {
        return Number((24 * this.size / CyNodeData.SIZE_SMALL).toFixed(NUMBER_PRECISION));
    }

    get backgroundX() {
        // 位移需要多移动border的一半，不然超出bounds的image会被border覆盖
        return ['50%', '20%', '80%']; // array 依次对应background, border, note, tag
    }

    get backgroundY() {
        return ['50%', '80%', '20%']; // 只有note或者tag的时候都放在右上角
    }

    get backgroundSize() {
        return [BACKGROUND_IMAGE_RATIO, this.decoratorIconSize(), this.decoratorIconSize()];
    }

    // get boundsExpansion() {
    //     // 根据border大小自动调节bounds 大小，防止被border覆盖或者超出bounds
    //     return 20 * this.size / CyNodeData.SIZE_SMALL + this.borderWidth / 4;
    // }
    //
    // get backgroundX() {
    //     // 位移需要多移动border的一半，不然超出bounds的image会被border覆盖
    //     return ["50%", this.size + this.borderWidth / 2, this.size + this.borderWidth / 2]; // array 依次对应background, border, note, tag
    // }
    //
    // get backgroundY() {
    //     if (this.backgroundImage.indexOf(PLACEHOLDER) >= 0) {
    //         return ["50%", "20%", "20%"]; // 只有note或者tag的时候都放在右上角
    //     } else {
    //         return ["50%", "80%", "20%"]; // array 依次对应background, border, note, tag
    //     }
    // }
    //
    // get backgroundSize() {
    //     return [BACKGROUND_IMAGE_RATIO, this.boundsExpansion, this.boundsExpansion];
    // }

    static fromJSON(json: any, cyState: CyState, copyParams: boolean = true): CyNodeData {
        const data = new CyNodeData(cyState);
        runInAction(() => { // 一个一个赋值，比起Object.assign(data, json)性能高不少
            data.name = json.name;
            data.parent = json.parent;
            data.id = json.id;
            data.tags = json.tags.filter((tag: string) => {
                if (!tag) {
                    return false;
                }
                return tag.trim().length > 0;
            });
            data.note = json.note;
            data.borderColor = json.borderColor;
            data.manualSize = json.manualSize;
            data.labelType = json.labelType;
            data.nodeType = json.nodeType;
            data.rank = json.rank;
            data.shape = json.shape;
            if (copyParams) {
                CyElementData.copyParams(json.params, data);
            }
        });

        return data;
    }

}

export class CyNode extends NodeWithPosition {
    static defaultClass = CyElementDefaultClass.NORMAL_NODE;
    public data: CyNodeData = new CyNodeData(this.cyState);

    // 用于从api序列化的数据反序列化，和api的数据结构定义无关系，完全是cyState自己的结构
    static fromJSON(json: any, cyState: CyState, copyParams: boolean = true): CyNode {
        const cyNode = new CyNode(cyState);
        cyNode.initClassSet(json.classSet);
        cyNode.position = {...(json.position || {x: 0, y: 0})};
        cyNode.selected = json.selected || false;
        cyNode.data = CyNodeData.fromJSON(json.data, cyState, copyParams);
        return cyNode;
    }

    // 不需要copy params，因为param的显示都是从cyState拿，这样做能获取更好性能
    static clone(json: any, cyState: CyState) {
        return CyNode.fromJSON(json, cyState, false);
    }

    public resetClassSet() {
        this.classSet.clear();
        this.classSet.set(CyNode.defaultClass, 1);
    }

    public transparentize() {
        this.addClass('low-priority-node');
    }

    public get ancestors() {
        const result: Community[] = [];
        let startId = this.data.parent;
        while (startId) {
            const community = this.cyState!.getCommunityById(startId)!;
            result.push(community);
            startId = community.parent;
        }
        return result;
    }

    getValue(key: string) {
        return this.data.getValue(key);
    }

    isHidden(): boolean {
        if (this.data.id === 'nodefind-path-temp') {
            return false;
        }
        const cyState = this.cyState!;

        const nodeTypeConfig = cyState.nodeTypeConfigs.get(this.data.nodeType)!;
        // 隐藏不被显示的元素
        if (!nodeTypeConfig.show) {
            return true;
        }
        if (cyState.isRelationFilterEnabled()) {
            if (!cyState.relationFilterEndpoints.has(this.data.id)) {
                return true;
            }
        }

        // 过滤掉不被显示的社群的子元素
        if (this.data.parent) {
            const community = this.cyState!.getCommunityById(this.data.parent)!;
            return !community.show;
        }

        return false;
    }

}
