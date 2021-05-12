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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const country_geo_entity_1 = require("./country.geo.entity");
const faker = require("faker");
const app_base_service_1 = require("../../utils/app-base.service");
const ormconfig_1 = require("../../ormconfig");
const config_utils_1 = require("../../utils/config.utils");
let CountriesService = class CountriesService extends app_base_service_1.AppBaseService {
    constructor(countriesRepository) {
        super(countriesRepository, 'country', 'countries', {
            idProperty: 'gid0',
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.countriesRepository = countriesRepository;
    }
    get serializerConfig() {
        return {
            transform: (item) => (Object.assign(Object.assign({}, item), { id: item.gid0 })),
            attributes: ['gid0', 'name0', 'theGeom'],
            keyForAttribute: 'camelCase',
        };
    }
    async fakeFindOne(_id) {
        return this.serialize([
            Object.assign(Object.assign({}, new country_geo_entity_1.Country()), { gid0: faker.address.countryCode('ESP'), name0: faker.address.country() }),
        ]);
    }
};
CountriesService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(country_geo_entity_1.Country, ormconfig_1.apiConnections.geoprocessingDB.name)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CountriesService);
exports.CountriesService = CountriesService;
//# sourceMappingURL=countries.service.js.map