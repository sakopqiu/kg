import Leaflet from 'leaflet';
import 'proj4';
import 'proj4leaflet';

export const BAIDU_CRS = new Leaflet.Proj.CRS(
    'EPSG:900913',
    '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
    {
        resolutions: (function() {
            const level = 19;
            const res = [];
            res[0] = Math.pow(2, 18);
            for (let i = 1; i < level; i++) {
                res[i] = Math.pow(2, 18 - i);
            }
            return res;
        })(),
        origin: [0, 0],
        bounds: Leaflet.bounds([20037508.342789244, 0], [0, 20037508.342789244]),
    },
);
export const BAIDU_TILE_LAYER = function (option: any) {
    option = option || {};

    let layer;
    const subdomains = '0123456789';
    switch (option.layer) {
        // 单图层
        case 'vec':
        default:
            // 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&b=0&limit=60&scaler=1&udt=20170525'
            layer = Leaflet.tileLayer('http://172.16.202.212:8219/tile?x={x}&y={y}&z={z}', {
                subdomains, tms: true,
            });
            // layer = Leaflet.tileLayer('http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=' + (option.bigfont ? 'ph' : 'pl') + '&scaler=1&p=1', {
            //     subdomains: subdomains, tms: true
            // });
            break;
    }
    return layer;
};
