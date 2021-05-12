"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApiEventDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_api_event_dto_1 = require("./create.api-event.dto");
class UpdateApiEventDTO extends swagger_1.PartialType(create_api_event_dto_1.CreateApiEventDTO) {
}
exports.UpdateApiEventDTO = UpdateApiEventDTO;
//# sourceMappingURL=update.api-event.dto.js.map