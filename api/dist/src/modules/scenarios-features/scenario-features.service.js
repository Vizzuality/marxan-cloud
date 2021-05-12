"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _injectAndCompute;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioFeaturesService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const app_base_service_1 = require("../../utils/app-base.service");
const remote_connection_name_1 = require("./entities/remote-connection-name");
const geo_feature_api_entity_1 = require("../geo-features/geo-feature.api.entity");
const remote_scenario_features_data_geo_entity_1 = require("./entities/remote-scenario-features-data.geo.entity");
const remote_features_data_geo_entity_1 = require("./entities/remote-features-data.geo.entity");
const config_utils_1 = require("../../utils/config.utils");
let ScenarioFeaturesService = class ScenarioFeaturesService extends app_base_service_1.AppBaseService {
    constructor(features, remoteFeature, remoteScenarioFeatures) {
        super(remoteScenarioFeatures, 'scenario_features', 'scenario_feature', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.features = features;
        this.remoteFeature = remoteFeature;
        this.remoteScenarioFeatures = remoteScenarioFeatures;
        _injectAndCompute.set(this, (base, assign) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const metArea = (_a = base === null || base === void 0 ? void 0 : base.currentArea) !== null && _a !== void 0 ? _a : 0;
            const totalArea = (_b = base === null || base === void 0 ? void 0 : base.totalArea) !== null && _b !== void 0 ? _b : 0;
            const targetPct = ((_c = base === null || base === void 0 ? void 0 : base.target) !== null && _c !== void 0 ? _c : 0) / 100;
            return Object.assign(Object.assign({}, base), { onTarget: metArea >= totalArea * targetPct, met: +((metArea / totalArea) * 100).toFixed(2), metArea, coverageTarget: +((_d = base === null || base === void 0 ? void 0 : base.target) !== null && _d !== void 0 ? _d : 0).toFixed(2), coverageTargetArea: (totalArea * ((_e = base === null || base === void 0 ? void 0 : base.target) !== null && _e !== void 0 ? _e : 0)) / 100, totalArea, featureId: assign.id, tag: assign.tag, name: (_f = assign.alias) !== null && _f !== void 0 ? _f : undefined, description: (_g = assign.description) !== null && _g !== void 0 ? _g : undefined });
        });
    }
    setFilters(query, filters, info) {
        var _a;
        const scenarioId = (_a = info === null || info === void 0 ? void 0 : info.params) === null || _a === void 0 ? void 0 : _a.scenarioId;
        if (scenarioId) {
            return query.andWhere(`${this.alias}.scenario_id = :scenarioId`, {
                scenarioId,
            });
        }
        return query;
    }
    async extendFindAllResults(entitiesAndCount) {
        const scenarioFeaturesData = entitiesAndCount[0];
        const featuresDataIds = scenarioFeaturesData.map((rsfd) => rsfd.featuresDataId);
        if (featuresDataIds.length === 0) {
            return entitiesAndCount;
        }
        const featureRelations = {};
        const featureData = await this.remoteFeature.find({
            where: {
                id: typeorm_1.In(featuresDataIds),
            },
        });
        featureData.forEach((fd) => {
            featureRelations[fd.id] = fd.featureId;
        });
        const featureIds = featureData.map((fd) => fd.featureId);
        const features = await this.features.find({
            where: {
                id: typeorm_1.In(featureIds),
            },
        });
        return [
            scenarioFeaturesData
                .map((sfd) => {
                const relatedFeature = features.find((f) => f.id === featureRelations[sfd.featuresDataId]);
                if (!relatedFeature) {
                    return undefined;
                }
                return __classPrivateFieldGet(this, _injectAndCompute).call(this, sfd, relatedFeature);
            })
                .filter((def) => def),
            scenarioFeaturesData.length,
        ];
    }
    get serializerConfig() {
        return {
            attributes: [
                'description',
                'name',
                'tag',
                'onTarget',
                'metArea',
                'met',
                'totalArea',
                'coverageTargetArea',
                'coverageTarget',
            ],
            keyForAttribute: 'camelCase',
        };
    }
};
_injectAndCompute = new WeakMap();
ScenarioFeaturesService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_2.InjectRepository(geo_feature_api_entity_1.GeoFeature)),
    __param(1, typeorm_2.InjectRepository(remote_features_data_geo_entity_1.RemoteFeaturesData, remote_connection_name_1.remoteConnectionName)),
    __param(2, typeorm_2.InjectRepository(remote_scenario_features_data_geo_entity_1.RemoteScenarioFeaturesData, remote_connection_name_1.remoteConnectionName)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], ScenarioFeaturesService);
exports.ScenarioFeaturesService = ScenarioFeaturesService;
//# sourceMappingURL=scenario-features.service.js.map