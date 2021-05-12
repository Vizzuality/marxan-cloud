"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAreasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_areas_controller_1 = require("./admin-areas.controller");
const admin_area_geo_entity_1 = require("./admin-area.geo.entity");
const admin_areas_service_1 = require("./admin-areas.service");
const ormconfig_1 = require("../../ormconfig");
let AdminAreasModule = class AdminAreasModule {
};
AdminAreasModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([admin_area_geo_entity_1.AdminArea], ormconfig_1.apiConnections.geoprocessingDB.name),
        ],
        providers: [admin_areas_service_1.AdminAreasService],
        controllers: [admin_areas_controller_1.AdminAreasController],
        exports: [admin_areas_service_1.AdminAreasService],
    })
], AdminAreasModule);
exports.AdminAreasModule = AdminAreasModule;
//# sourceMappingURL=admin-areas.module.js.map