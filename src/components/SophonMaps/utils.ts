import Leaflet from 'leaflet';

export const EARTH_RADIUS = 6371 * 1000;

export function degreeToRadian(degree: number) {
    return degree * Math.PI / 180;
}

export function calculateDistance(point1: {lat: number, lng: number}, point2: {lat: number, lng: number}) {
    const deltaLat = degreeToRadian(point2.lat - point1.lat);
    const deltaLng = degreeToRadian(point2.lng - point1.lng);

    const radianLat1 = degreeToRadian(point1.lat);
    const radianLat2 = degreeToRadian(point2.lat);

    const angle = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(radianLat1) * Math.cos(radianLat2);
    const c = 2 * Math.atan2(Math.sqrt(angle), Math.sqrt(1 - angle));
    return EARTH_RADIUS * c;
}

export function getViewRadius(map: Leaflet.Map) {
    const center = map.getCenter();
    const bounds = map.getBounds();
    const heightMeters = calculateDistance({lat: bounds.getNorth(), lng: center.lng}, center);
    const widthMeters = calculateDistance(center, {lat: center.lat, lng: bounds.getEast()});
    return Math.max(heightMeters, widthMeters);
}

export const DEFAULT_HEAT_MAP_CONFIG = {
    radius: 20,
    blur: 15,
    minOpacity: 0.5,
    // maxZoom: 10,
    // max: 4.0,
    gradient: {
        0.0: '#C5FE3E',
        0.25: '#E6FE00',
        0.5: '#EEC926',
        0.75: '#EF7D0D',
        1.0: '#FE0000',
    },
};
