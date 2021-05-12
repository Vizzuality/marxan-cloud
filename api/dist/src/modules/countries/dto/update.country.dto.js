"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCountryDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_country_dto_1 = require("./create.country.dto");
class UpdateCountryDTO extends swagger_1.PartialType(create_country_dto_1.CreateCountryDTO) {
}
exports.UpdateCountryDTO = UpdateCountryDTO;
//# sourceMappingURL=update.country.dto.js.map