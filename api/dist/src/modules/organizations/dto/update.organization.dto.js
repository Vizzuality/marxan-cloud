"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_organization_dto_1 = require("./create.organization.dto");
class UpdateOrganizationDTO extends swagger_1.PartialType(create_organization_dto_1.CreateOrganizationDTO) {
}
exports.UpdateOrganizationDTO = UpdateOrganizationDTO;
//# sourceMappingURL=update.organization.dto.js.map