"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_project_dto_1 = require("./create.project.dto");
class UpdateProjectDTO extends swagger_1.PartialType(create_project_dto_1.CreateProjectDTO) {
}
exports.UpdateProjectDTO = UpdateProjectDTO;
//# sourceMappingURL=update.project.dto.js.map