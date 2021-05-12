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
exports.CountryResult = exports.JSONAPICountryData = exports.Country = exports.countryResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const resource_interface_1 = require("../../types/resource.interface");
exports.countryResource = {
    className: 'Country',
    name: {
        singular: 'country',
        plural: 'countries',
    },
};
let Country = class Country {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Country.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn('character varying', { name: 'gid_0' }),
    __metadata("design:type", String)
], Country.prototype, "gid0", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying', { name: 'name_0' }),
    __metadata("design:type", String)
], Country.prototype, "name0", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('geometry', { name: 'the_geom' }),
    __metadata("design:type", Object)
], Country.prototype, "theGeom", void 0);
Country = __decorate([
    typeorm_1.Entity('countries')
], Country);
exports.Country = Country;
class JSONAPICountryData {
    constructor() {
        this.type = 'countries';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPICountryData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPICountryData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Country)
], JSONAPICountryData.prototype, "attributes", void 0);
exports.JSONAPICountryData = JSONAPICountryData;
class CountryResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPICountryData)
], CountryResult.prototype, "data", void 0);
exports.CountryResult = CountryResult;
//# sourceMappingURL=country.geo.entity.js.map