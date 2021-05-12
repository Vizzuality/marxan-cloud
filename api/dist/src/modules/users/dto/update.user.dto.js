"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("./create.user.dto");
class UpdateUserDTO extends swagger_1.PartialType(create_user_dto_1.CreateUserDTO) {
}
exports.UpdateUserDTO = UpdateUserDTO;
//# sourceMappingURL=update.user.dto.js.map