"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlanningUnitsDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_planning_units_dto_1 = require("./create.planning-units.dto");
class UpdatePlanningUnitsDTO extends swagger_1.PartialType(create_planning_units_dto_1.CreatePlanningUnitsDTO) {
}
exports.UpdatePlanningUnitsDTO = UpdatePlanningUnitsDTO;
//# sourceMappingURL=update.planning-units.dto.js.map