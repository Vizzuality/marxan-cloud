"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedAreasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const protected_areas_controller_1 = require("./protected-areas.controller");
const protected_area_geo_entity_1 = require("./protected-area.geo.entity");
const protected_areas_service_1 = require("./protected-areas.service");
const ormconfig_1 = require("../../ormconfig");
let ProtectedAreasModule = class ProtectedAreasModule {
};
ProtectedAreasModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([protected_area_geo_entity_1.ProtectedArea], ormconfig_1.apiConnections.geoprocessingDB.name),
        ],
        providers: [protected_areas_service_1.ProtectedAreasService],
        controllers: [protected_areas_controller_1.ProtectedAreasController],
        exports: [protected_areas_service_1.ProtectedAreasService],
    })
], ProtectedAreasModule);
exports.ProtectedAreasModule = ProtectedAreasModule;
//# sourceMappingURL=protected-areas.module.js.map