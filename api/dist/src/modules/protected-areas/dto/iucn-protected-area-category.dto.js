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
exports.IUCNProtectedAreaCategoryResult = exports.JSONAPIIUCNProtectedAreaCategoryData = exports.IUCNProtectedAreaCategoryDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const protected_area_geo_entity_1 = require("../protected-area.geo.entity");
class IUCNProtectedAreaCategoryDTO extends swagger_1.PickType(protected_area_geo_entity_1.ProtectedArea, [
    'iucnCategory',
]) {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], IUCNProtectedAreaCategoryDTO.prototype, "iucnCategory", void 0);
exports.IUCNProtectedAreaCategoryDTO = IUCNProtectedAreaCategoryDTO;
class JSONAPIIUCNProtectedAreaCategoryData {
    constructor() {
        this.type = 'iucn_protected_area_categories';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIIUCNProtectedAreaCategoryData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIIUCNProtectedAreaCategoryData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", IUCNProtectedAreaCategoryDTO)
], JSONAPIIUCNProtectedAreaCategoryData.prototype, "attributes", void 0);
exports.JSONAPIIUCNProtectedAreaCategoryData = JSONAPIIUCNProtectedAreaCategoryData;
class IUCNProtectedAreaCategoryResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIIUCNProtectedAreaCategoryData)
], IUCNProtectedAreaCategoryResult.prototype, "data", void 0);
exports.IUCNProtectedAreaCategoryResult = IUCNProtectedAreaCategoryResult;
//# sourceMappingURL=iucn-protected-area-category.dto.js.map