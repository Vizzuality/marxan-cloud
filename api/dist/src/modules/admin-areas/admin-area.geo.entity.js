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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAreaResult = exports.JSONAPIAdminAreaData = exports.AdminArea = exports.adminAreaResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const country_geo_entity_1 = require("../countries/country.geo.entity");
const typeorm_1 = require("typeorm");
const resource_interface_1 = require("../../types/resource.interface");
exports.adminAreaResource = {
    className: 'AdminArea',
    name: {
        singular: 'admin_area',
        plural: 'admin_areas',
    },
};
let AdminArea = class AdminArea extends country_geo_entity_1.Country {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], AdminArea.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn('character varying', { name: 'gid_0' }),
    __metadata("design:type", String)
], AdminArea.prototype, "gid0", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn('character varying', { name: 'gid_1' }),
    __metadata("design:type", String)
], AdminArea.prototype, "gid1", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying', { name: 'name_1' }),
    __metadata("design:type", String)
], AdminArea.prototype, "name1", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.PrimaryColumn('character varying', { name: 'gid_2' }),
    __metadata("design:type", String)
], AdminArea.prototype, "gid2", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying', { name: 'name_2' }),
    __metadata("design:type", String)
], AdminArea.prototype, "name2", void 0);
AdminArea = __decorate([
    typeorm_1.Entity('admin_regions')
], AdminArea);
exports.AdminArea = AdminArea;
class JSONAPIAdminAreaData {
    constructor() {
        this.type = 'administative-areas';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIAdminAreaData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIAdminAreaData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", AdminArea)
], JSONAPIAdminAreaData.prototype, "attributes", void 0);
exports.JSONAPIAdminAreaData = JSONAPIAdminAreaData;
class AdminAreaResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIAdminAreaData)
], AdminAreaResult.prototype, "data", void 0);
exports.AdminAreaResult = AdminAreaResult;
//# sourceMappingURL=admin-area.geo.entity.js.map