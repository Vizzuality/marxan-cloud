"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleMultiPolygonJson = exports.invalidMultiPolygon = void 0;
const invalidMultiPolygon = () => ({
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [
                            [102.0, 2.0],
                            [104.0, 5.0],
                            [103.0, 3.0],
                        ],
                    ],
                ],
            },
        },
    ],
});
exports.invalidMultiPolygon = invalidMultiPolygon;
const sampleMultiPolygonJson = () => ({
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [
                            [102.0, 2.0],
                            [103.0, 2.0],
                            [103.0, 3.0],
                            [102.0, 3.0],
                            [102.0, 2.0],
                        ],
                    ],
                    [
                        [
                            [100.0, 0.0],
                            [101.0, 0.0],
                            [101.0, 1.0],
                            [100.0, 1.0],
                            [100.0, 0.0],
                        ],
                        [
                            [100.2, 0.2],
                            [100.8, 0.2],
                            [100.8, 0.8],
                            [100.2, 0.8],
                            [100.2, 0.2],
                        ],
                    ],
                ],
            },
        },
    ],
});
exports.sampleMultiPolygonJson = sampleMultiPolygonJson;
//# sourceMappingURL=geometry.js.map