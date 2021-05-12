"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGeoFeatureDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_geo_feature_dto_1 = require("./create.geo-feature.dto");
class UpdateGeoFeatureDTO extends swagger_1.PartialType(create_geo_feature_dto_1.CreateGeoFeatureDTO) {
}
exports.UpdateGeoFeatureDTO = UpdateGeoFeatureDTO;
//# sourceMappingURL=update.geo-feature.dto.js.map