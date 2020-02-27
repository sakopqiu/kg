import React, {useEffect} from 'react';
import Leaflet from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat';
import './index.scss';
import {bottomRight, leftTop, SophonMaps} from '../../../../../components/SophonMaps';
import {HoverButtons} from '../HoverButtons/HoverButtons';
import {SwitchIcon} from '../../../../../icons/SwitchIcon';
import {MapElement, MapStore} from '../../../stores/MapStore';
import {getTranslation, Locales} from '../../../../../utils';
import { MapExplorerContext } from './Context/MapExplorerContext';
import {
    HeatMapConfig,
    HeatMapSettingModal,
} from './HeatMapSettingModal';
import {MapIcon} from '../../../../../icons/MapIcon';
import {observer} from 'mobx-react-lite';
import {CloseIcon} from '../../../../../icons/CloseIcon';
import {MapDetailPanel} from './MapDetailPanel';
import {ResetIcon} from '../../../../../icons/ResetIcon';
import {useLoadingEffect} from '../../../../../components/SophonHooks/LoadingEffect';
import Icon from 'antd/es/icon';
import 'antd/es/icon/style';
// import 'proj4';
// import 'proj4leaflet';
// import {BAIDU_CRS, BAIDU_TILE_LAYER} from "../../../../../components/SophonMaps/CRS/Baidu";

interface IMapExplorerProps {
    mapStore: MapStore;
    locale: Locales;
    heatMapConfig: HeatMapConfig;
    initialMapElements?: MapElement[];
}

export const MapExplorer = observer((props: IMapExplorerProps) => {
    const tiles = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    const [getHeatData, getHeatLoading] = useLoadingEffect(async () => {
        const mapStore = props.mapStore;
        const results = await props.heatMapConfig.onConfirm(
            mapStore.heatMapSelectedLabel,
            mapStore.heatMapSelectedField,
            mapStore.map.getBounds(),
        );
        mapStore.addHeatLayer(results);
    });

    useEffect(() => {
        // Leaflet.control.layers(
        //     {
        //         "百度地图": BAIDU_TILE_LAYER({ layer: 'vec' }).addTo(props.mapStore.map),
        //     },
        // ).addTo(props.mapStore.map);
        props.mapStore.addMarkersToGroup(props.initialMapElements || []);
        props.mapStore.addMarkersGroupLayer();
        return () => {
            props.mapStore.disposeMap();
        };
    }, []);

    const allTools = [
        {icon: <SwitchIcon />, title: getTranslation(props.locale, 'Close Map'), onClick: () => {props.mapStore.setMapVisible(false); }},
        {icon: <MapIcon />, title: getTranslation(props.locale, 'Heat Map'), onClick: () => {props.mapStore.setHeatSettingVisible(true); }},
    ];

    if (props.mapStore.hasHeatMapLayer) {
        allTools.push(...[
            {
                icon: getHeatLoading ? <Icon type='loading' /> : <ResetIcon />,
                title: getTranslation(props.locale, 'Refresh'),
                onClick: getHeatData,
            },
            {
                icon: <CloseIcon />,
                title: getTranslation(props.locale, 'Close Heat'),
                onClick: () => {
                    props.mapStore.removeHeatLayer();
                    props.mapStore.addMarkersGroupLayer();
                },
            }]);
    }

    return (
        <MapExplorerContext.Provider value={{
            mapStore: props.mapStore,
            locale: props.locale,
        }}>
            <div className={'map-wrapper'} >
                <SophonMaps
                    getMapInstance={props.mapStore.setMap}
                    mapOptions={{
                        maxZoom: 18,
                        minZoom: 4,
                        center: [(leftTop.lat + bottomRight.lat) / 2, (leftTop.lng + bottomRight.lng) / 2],
                        layers: [tiles],
                        zoomControl: false,
                        zoom: 6,
                        // crs: BAIDU_CRS,
                    }}
                    mapElementId={'map-explorer'}
                />
                <HoverButtons
                    upperHoverButtons={allTools}
                />
                {props.mapStore.selectedElements.length > 0 &&
                <MapDetailPanel
                    locale={props.locale}
                />}
                <HeatMapSettingModal config={props.heatMapConfig} />
            </div>
        </MapExplorerContext.Provider>
    );
});
