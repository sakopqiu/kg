import {CommonService} from './CommonService';
import {observable, action} from 'mobx';
import {IRectMeta} from '../../../components/SophonMiniMap';
import _each from 'lodash/each';
import {debug, getLayoutSpecificConfigs} from '../../../utils';
import {cytoStyle} from './style';
import cytoscape from 'cytoscape';
import {LoadingTargets} from '../../../stores/LoadableStoreImpl';

export const CYTO_MINIMAP_HEIGHT = 250;

export class MiniMapService extends CommonService {
    @observable public miniMapWidth: number; // make sure the minimap w/h ratio same with canvas
    @observable public miniMapRectMeta: IRectMeta; // minimap里的有效矩形区间
    @observable public miniMapVisible: boolean;

    // minimap cyto
    public cyMiniMap?: any | null;

    @action
    public setMiniMapRectMeta(rect: IRectMeta) {
        this.miniMapRectMeta = rect;
    }

    @action
    public setMiniMapVisible(value: boolean) {
        this.miniMapVisible = value;
        if (this.miniMapVisible) {
            this.drawService.canvasStore!.addLoadingTarget(LoadingTargets.LOADING_MINI_MAP);
            this.setMiniMapWidth(CYTO_MINIMAP_HEIGHT * this.cy.width() / this.cy.height());
            // settimeout 等 minimap 的container加载好
            setTimeout(() => {
                const miniMapConfig: any = {
                    style: cytoStyle,
                    container: document.getElementsByClassName('cyto-minimap'),
                    elements: [],
                    layout: getLayoutSpecificConfigs('preset', 0, {fit: true}),
                    userPanningEnabled: false,
                    userZoomingEnabled: false,
                    autolock: true,
                };
                const cyMiniMap = cytoscape(miniMapConfig);
                this.cyMiniMap = cyMiniMap;
                // (window as any).cm = cyMiniMap;
                this.updateMiniMap();
            });
        } else {
            this.dispose();
        }
    }

    @action
    public setMiniMapWidth(value: number) {
        this.miniMapWidth = value;
    }

    public updateMiniMap() {
        if (this.cyMiniMap) {
            const json: any = {...this.cy.json()};
            delete json.maxZoom;
            delete json.minZoom;
            json.userPanningEnabled = false;
            json.userZoomingEnabled = false;
            json.panningEnabled = true;
            json.zoomingEnabled = true;
            _each((json.elements.nodes || []).concat((json.elements.edges || [])), (element) => {
                element.selectable = false;
                element.drabbable = false;
                element.selected = false;
            });
            this.cyMiniMap.batch(() => {
                this.cyMiniMap.elements().remove();
                this.cyMiniMap.json(json);
            });
            this.cyMiniMap.fit();
            this.onCanvasViewportChange();
            this.drawService.canvasStore!.finishLoading(LoadingTargets.LOADING_MINI_MAP);
        }
    }

    public onCanvasViewportChange() {
        if (this.cyMiniMap) {
            const canvasPan = this.cyState.pan;
            const canvasZoom = this.cyState.zoom;
            const miniZoom = this.cyMiniMap.zoom();
            const miniPan = this.cyMiniMap.pan();
            this.setMiniMapRectMeta({
                x: miniPan.x - canvasPan.x * miniZoom / canvasZoom,
                y: miniPan.y - canvasPan.y * miniZoom / canvasZoom,
                w: this.transformByCyto(this.miniMapWidth),
                h: this.transformByCyto(CYTO_MINIMAP_HEIGHT),
            });
        }
    }

    public handleMiniMapChange = (rect: IRectMeta, old: IRectMeta, mapWidth: number, mapHeight: number) => {
        const canvasFitExpectedZoom = this.canvasFitExpectedZoom();
        // 通过矩形所占比例推算canvas应该的zoom大小，都是以两个cyto fit为基准进行换算
        const canvasExpectedZoom = (mapWidth / rect.w) * canvasFitExpectedZoom;
        const miniMapExtent = this.cyMiniMap.extent();
        // 计算所有元素的模型中心
        // cy zoom 和 cy panBy会触发 cy的 onPanning事件会去更改 rectangle
        const centerPoint = {
            x: miniMapExtent.x1 + miniMapExtent.w * (rect.x + rect.w / 2) / mapWidth,
            y: miniMapExtent.y1 + miniMapExtent.h * (rect.y + rect.h / 2) / mapHeight,
        };
        if (rect.w !== old.w) {
            // 长度不一样表示 进行了zoom操作，应该以当前白色矩形中心对应在canvas上的点为基点进行zoom
            this.cy.zoom({level: canvasExpectedZoom, position: {...centerPoint}});
        } else {
            // panning 操作只需要进行delta平移
            const miniZoom = this.cyMiniMap.zoom();
            const canvasZoom = this.stateService.cy.zoom();
            // 为了提高精度，很多步骤都合在一起运算
            // const delta = {x: (rect.x - old.x) / miniZoom, y: (rect.y - old.y) / miniZoom};
            this.cy.panBy({
                x: -((rect.x - old.x) * canvasZoom / miniZoom),
                y: -((rect.y - old.y) * canvasZoom / miniZoom),
            });
        }
    }

    public dispose() {
        if (this.cyMiniMap) {
            this.cyMiniMap.destroy();
            this.cyMiniMap = null;
            this.miniMapRectMeta = {x: 0, y: 0, w: 0, h: 0};
            debug('old minimap disposed');
        }
    }

    public transformByCyto(value: number): number {
        // 计算和canvas match情况下 minimap里长度大小
        const canvasFitExpectedZoom = this.canvasFitExpectedZoom();
        return value * canvasFitExpectedZoom / this.cy.zoom();
    }

    // 外层在fit的状态下，外面的zoom值
    public canvasFitExpectedZoom() {
        // 基本换算思想都是以 elements 的 boundingBox 在两个坐标系里fit模式下进行换算
        const elementsBounds = this.cy.elements().boundingBox();
        if (elementsBounds.h !== 0) {
            if (elementsBounds.w / elementsBounds.h >= this.cy.width() / this.cy.height()) {
                return (this.cy.width()) / elementsBounds.w;
            } else {
                return (this.cy.height()) / elementsBounds.h;
            }
        } else {
            // 当前画布没有元素的时候
            return 1;
        }
    }
}
