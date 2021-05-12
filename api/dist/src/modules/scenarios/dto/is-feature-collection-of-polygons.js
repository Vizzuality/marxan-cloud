"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsFeatureCollectionOfPolygons = void 0;
const class_validator_1 = require("class-validator");
const pure_geojson_validation_1 = require("pure-geojson-validation");
const IsFeatureCollectionOfPolygons = (validationOptions) => {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            name: 'IsFeatureCollectionOfPolygons',
            target: object.constructor,
            propertyName,
            constraints: [],
            options: Object.assign({ message: 'Value must be a valid GeoJson of FeatureCollection of (Polygon/MultiPolygon)' }, validationOptions),
            validator: {
                validate(value) {
                    try {
                        const geo = pure_geojson_validation_1.tryGeoJSON(value);
                        if (geo.type !== 'FeatureCollection') {
                            return false;
                        }
                        return geo.features.every((geometry) => geometry.geometry.type === 'MultiPolygon' ||
                            geometry.geometry.type === 'Polygon');
                    }
                    catch (_a) {
                        return false;
                    }
                },
            },
        });
    };
};
exports.IsFeatureCollectionOfPolygons = IsFeatureCollectionOfPolygons;
//# sourceMappingURL=is-feature-collection-of-polygons.js.map