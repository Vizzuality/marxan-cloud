"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidGeoFeature = exports.getValidRemoteFeatureData = exports.getValidNonGeoData = void 0;
const geo_feature_api_entity_1 = require("../../geo-features/geo-feature.api.entity");
const featureIdMet = `feature-uuid-1-criteria-met`;
const featureIdFailed = `feature-uuid-2-criteria-failed`;
const metaFeatureIdMet = `meta-feature-uuid-1-criteria-met`;
const metaFeatureIdFailed = `meta-feature-uuid-1-criteria-failed`;
const getValidNonGeoData = (scenarioId) => [
    [
        {
            id: 'some-id',
            target: 50,
            scenarioId,
            fpf: 1,
            featuresDataId: featureIdMet,
            currentArea: 12000,
            totalArea: 20000,
            target2: 0,
        },
        {
            id: 'some-another-id',
            target: 50,
            scenarioId,
            fpf: 1,
            featuresDataId: featureIdFailed,
            currentArea: 4000,
            totalArea: 10000,
            target2: 0,
        },
    ],
    2,
];
exports.getValidNonGeoData = getValidNonGeoData;
const getValidRemoteFeatureData = () => [
    {
        featureId: metaFeatureIdFailed,
        id: featureIdFailed,
    },
    {
        featureId: metaFeatureIdMet,
        id: featureIdMet,
    },
];
exports.getValidRemoteFeatureData = getValidRemoteFeatureData;
const getValidGeoFeature = () => [
    {
        description: 'feature-desc-1',
        tag: geo_feature_api_entity_1.FeatureTags.bioregional,
        id: metaFeatureIdMet,
        alias: 'feature-alias-1',
    },
    {
        description: 'feature-desc-2',
        tag: geo_feature_api_entity_1.FeatureTags.species,
        id: metaFeatureIdFailed,
        alias: 'feature-alias-2',
    },
];
exports.getValidGeoFeature = getValidGeoFeature;
//# sourceMappingURL=scenario-features.view-data.js.map