"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validGeoJson = void 0;
const MultipolygonGeometry = Object.freeze({
    type: 'MultiPolygon',
    coordinates: [[[[0, 0]]]],
});
const validGeoJson = () => ({
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {},
            geometry: MultipolygonGeometry,
        },
    ],
});
exports.validGeoJson = validGeoJson;
//# sourceMappingURL=geojson.js.map