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
exports.ProtectedAreaResult = exports.JSONAPIProtectedAreaData = exports.ProtectedArea = exports.IUCNCategory = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
var IUCNCategory;
(function (IUCNCategory) {
    IUCNCategory["Ia"] = "Ia";
    IUCNCategory["Ib"] = "Ib";
    IUCNCategory["II"] = "II";
    IUCNCategory["III"] = "III";
    IUCNCategory["IV"] = "IV";
    IUCNCategory["V"] = "V";
    IUCNCategory["VI"] = "VI";
    IUCNCategory["NotApplicable"] = "Not Applicable";
    IUCNCategory["NotAssigned"] = "Not Assigned";
    IUCNCategory["NotReported"] = "Not Reported";
})(IUCNCategory = exports.IUCNCategory || (exports.IUCNCategory = {}));
let ProtectedArea = class ProtectedArea {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ProtectedArea.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('double precision', { name: 'wdpaid' }),
    __metadata("design:type", Number)
], ProtectedArea.prototype, "wdpaId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying', { name: 'full_name' }),
    __metadata("design:type", String)
], ProtectedArea.prototype, "fullName", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying', { name: 'iucn_cat' }),
    __metadata("design:type", String)
], ProtectedArea.prototype, "iucnCategory", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('double precision', { name: 'shape_leng' }),
    __metadata("design:type", Number)
], ProtectedArea.prototype, "shapeLength", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('double precision', { name: 'shape_area' }),
    __metadata("design:type", Number)
], ProtectedArea.prototype, "shapeArea", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying', { name: 'iso3' }),
    __metadata("design:type", String)
], ProtectedArea.prototype, "countryId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], ProtectedArea.prototype, "status", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('text', { name: 'desig' }),
    __metadata("design:type", String)
], ProtectedArea.prototype, "designation", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('geometry', { name: 'the_geom' }),
    __metadata("design:type", Object)
], ProtectedArea.prototype, "theGeom", void 0);
ProtectedArea = __decorate([
    typeorm_1.Entity('wdpa')
], ProtectedArea);
exports.ProtectedArea = ProtectedArea;
class JSONAPIProtectedAreaData {
    constructor() {
        this.type = 'protected_areas';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIProtectedAreaData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIProtectedAreaData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", ProtectedArea)
], JSONAPIProtectedAreaData.prototype, "attributes", void 0);
exports.JSONAPIProtectedAreaData = JSONAPIProtectedAreaData;
class ProtectedAreaResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIProtectedAreaData)
], ProtectedAreaResult.prototype, "data", void 0);
exports.ProtectedAreaResult = ProtectedAreaResult;
//# sourceMappingURL=protected-area.geo.entity.js.map