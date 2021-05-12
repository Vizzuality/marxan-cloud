"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const countries_controller_1 = require("./countries.controller");
const country_geo_entity_1 = require("./country.geo.entity");
const countries_service_1 = require("./countries.service");
const ormconfig_1 = require("../../ormconfig");
let CountriesModule = class CountriesModule {
};
CountriesModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([country_geo_entity_1.Country], ormconfig_1.apiConnections.geoprocessingDB.name),
        ],
        providers: [countries_service_1.CountriesService],
        controllers: [countries_controller_1.CountriesController],
        exports: [countries_service_1.CountriesService],
    })
], CountriesModule);
exports.CountriesModule = CountriesModule;
//# sourceMappingURL=countries.module.js.map