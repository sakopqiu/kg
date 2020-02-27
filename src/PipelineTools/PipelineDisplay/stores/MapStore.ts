import {action, computed, observable} from 'mobx';
import Leaflet, {HeatMapOptions} from 'leaflet';
// @ts-ignore
import MarkerIcon from 'leaflet/dist/images/marker-icon.png';
import {ILocation} from '../../../utils';
import {HeatMapData} from '../components/complex/MapExplorer/HeatMapSettingModal';
import {DEFAULT_HEAT_MAP_CONFIG} from '../../../components/SophonMaps/utils';
import _max from 'lodash/max';

export interface MapElementParam {
    type: string;
    value: string;
}

export class MapElement {
    constructor(
        public id: string,
        public label: string,
        public type: string,
        public location: ILocation,
        public params: {[name: string]: MapElementParam},
        public icon?: string,
        ) {}
}

export class MapStore {
    @observable public mapVisible: boolean;
    @observable public heatSettingVisible: boolean;
    @observable public heatMapSelectedLabel: string;
    @observable public heatMapSelectedField: string;
    @observable public selectedElements: MapElement[] = [];
    @observable heatLayer: Leaflet.HeatLayer | null;
    public groupLayers: Map<string, Leaflet.MarkerClusterGroup> = new Map<string, Leaflet.MarkerClusterGroup>();
    public map: Leaflet.Map;

    @action
    public setMapVisible(visible: boolean) {
        this.mapVisible = visible;
    }

    @action
    public setHeatSettingVisible(visible: boolean) {
        this.heatSettingVisible = visible;
    }

    @action
    public setHeaMapSelectedLabel = (label: string) => {
        this.heatMapSelectedLabel = label;
        this.setHeatMapSelectedField('');
    }

    @action
    public setHeatMapSelectedField = (field: string) => {
        this.heatMapSelectedField = field;
    }

    public setMap = (map: Leaflet.Map) => {
        this.map = map;
    }

    public addMarkersToGroup(nodes: MapElement[]) {
        (nodes).forEach((node) => {
            const eleIcon = Leaflet.icon({
                iconUrl: node.icon || MarkerIcon,
                iconSize: node.icon ? [50, 50] : [25, 41],
                // iconAnchor:　[50, 50],
                popupAnchor: node.icon ? [0, 0] : [13, 0],
            });
            const marker = Leaflet.marker(
                {lat: node.location.latitude, lng: node.location.longitude},
                {
                    icon: eleIcon,
                },
                ).on('click', () => {
                    this.selectElement(node);
                }).bindPopup(`${node.label}-${node.id}`);
            if (!this.groupLayers.has(node.label)) {
                this.groupLayers.set(node.label, Leaflet.markerClusterGroup());
            }
            const targetGroup = this.groupLayers.get(node.label)!;
            targetGroup.addLayer(marker);
        });
    }

    public addMarkersGroupLayer() {
        this.groupLayers.forEach((layer) => {
            this.map.addLayer(layer);
        });
    }

    @action
    public addHeatLayer(result: HeatMapData[], options: HeatMapOptions = DEFAULT_HEAT_MAP_CONFIG) {
        // 　过滤错误数据
        const finalResults = result.filter(r => r.v !== undefined && r.lng !== undefined && r.lat !== undefined);
        const max = _max(finalResults.map(r => r.v))!;
        const heatLayer = Leaflet.heatLayer(finalResults.map(r => [r.lat, r.lng, r.v / max]), options);
        if (this.map) {
            if (this.hasHeatMapLayer) {
                this.map.removeLayer(this.heatLayer!); // 去除老的热力图层
            }
            this.heatLayer = heatLayer;
            this.groupLayers.forEach((layer) => {
                this.map.removeLayer(layer); // 交互要求显示热力图时，不显示其他的group和marker
            });
            this.map.addLayer(this.heatLayer);
        }
        this.clearSelection();
    }

    @action
    public removeHeatLayer() {
        if (this.map && this.hasHeatMapLayer) {
            this.map.removeLayer(this.heatLayer!);
            this.heatLayer = null;
        }
    }

    // TODO 目前只支持单选
    @action
    public selectElement(ele: MapElement) {
        this.selectedElements = [ele];
    }

    @action
    public clearSelection() {
        this.selectedElements = [];
    }

    @computed
    get hasHeatMapLayer() {
        return this.heatLayer && this.map && this.map.hasLayer(this.heatLayer);
    }

    @action
    public disposeMap() {
        this.heatLayer = null;
        this.groupLayers.clear();
        if (this.map) {
            this.map.off();
        }
        this.mapVisible = false;
        this.heatSettingVisible = false;
        this.heatMapSelectedLabel = '';
        this.heatMapSelectedField = '';
        this.selectedElements = [];
    }
}
