"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProtectedAreaDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_protected_area_dto_1 = require("./create.protected-area.dto");
class UpdateProtectedAreaDTO extends swagger_1.PartialType(create_protected_area_dto_1.CreateProtectedAreaDTO) {
}
exports.UpdateProtectedAreaDTO = UpdateProtectedAreaDTO;
//# sourceMappingURL=update.protected-area.dto.js.map