import React, {CSSProperties, useEffect, useRef} from 'react';
import Leaflet, {MapOptions} from 'leaflet';
// @ts-ignore
import MarkerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import MarkerShadow from 'leaflet/dist/images/marker-shadow.png';
import './index.scss';

// TODO fake geo location (shanghai range)
// export const leftTop = new Leaflet.LatLng(31.181605, 121.367034);
// export const bottomRight = new Leaflet.LatLng(31.146790, 121.443192);
export const leftTop = new Leaflet.LatLng(31.380269, 115.58009);
export const bottomRight = new Leaflet.LatLng(24.995416, 121.504019);

interface ISophonMapsProps {
    mapOptions: MapOptions;
    getMapInstance?: (map: Leaflet.Map) => void;
    mapElementId?: string; // default value is sophon-maps
    onCircleDrawn?: (center: Leaflet.LatLng, radius: number) => void;
    onBoundsDrawn?: (bounds: Leaflet.Bounds) => void;
    style?: CSSProperties;
    className?: string;
}

export const MAP_TOOL_BUTTON_SIZE = 30;
export const MAP_DEFAULT_ID = 'sophon-maps';

// https://github.com/Leaflet/Leaflet/issues/4968
const DefaultIcon = Leaflet.icon({
    iconUrl: MarkerIcon,
    shadowUrl: MarkerShadow,
});

Leaflet.Marker.prototype.options.icon = DefaultIcon;

export function SophonMaps(props: ISophonMapsProps) {
    const mapRef = useRef<Leaflet.Map>();
    useEffect(() => {
        mapRef.current = Leaflet.map(props.mapElementId || MAP_DEFAULT_ID,
            Object.assign({
                maxZoom: 18,
                zoom: 12,
                minZoom: 0,
            }, props.mapOptions));
    }, []);
    useEffect(() => {
        if (props.getMapInstance && mapRef.current) {
            props.getMapInstance(mapRef.current);
        }
    }, [props.getMapInstance]);
    // TODO 公用的画图（圆，矩形工具）
    // useEffect(() => {
    //     function onMousedown(event: Leaflet.LeafletMouseEvent) {
    //         if (event.originalEvent.altKey && !event.originalEvent.shiftKey) {
    //             mapRef.current!.addEventListener('mousemove', onMousemove);
    //             mapRef.current!.addEventListener('mouseup', onMouseup);
    //         }
    //     }
    //     function onMousemove(event: Leaflet.LeafletMouseEvent) {
    //
    //     }
    //     function onMouseup(event: Leaflet.LeafletMouseEvent) {
    //         mapRef.current!.removeEventListener('mousemove', onMousemove);
    //         mapRef.current!.addEventListener('mouseup', onMouseup);
    //     }
    //     if (props.onBoundsDrawn) {
    //         mapRef.current!.addEventListener('mousedown', onMousedown);
    //     }
    //     return () => {
    //         if (props.onBoundsDrawn) {
    //             mapRef.current!.removeEventListener('mousedown', onMousedown);
    //         }
    //     }
    // }, [props.onBoundsDrawn]);
    return (
        <div
            className={`sophon-maps-container ${props.className}`}
            id={`${props.mapElementId || MAP_DEFAULT_ID}`}
            style={props.style}
        />
    );
}

export function getRandomLatLng(leftTop: Leaflet.LatLng, bottomRight: Leaflet.LatLng) {
    const lngSpan = bottomRight.lng - leftTop.lng;
    const latSpan = leftTop.lat - bottomRight.lat;

    return new Leaflet.LatLng(
        bottomRight.lat + latSpan * Math.random(),
        leftTop.lng + lngSpan * Math.random());
}
