"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScenarioDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_scenario_dto_1 = require("./create.scenario.dto");
class UpdateScenarioDTO extends swagger_1.PartialType(create_scenario_dto_1.CreateScenarioDTO) {
}
exports.UpdateScenarioDTO = UpdateScenarioDTO;
//# sourceMappingURL=update.scenario.dto.js.map