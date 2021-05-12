"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validDataWithGivenPuIds = void 0;
const lock_status_enum_1 = require("../../../../scenarios-planning-unit/lock-status.enum");
const uuid_1 = require("uuid");
const validDataWithGivenPuIds = (puids, scenarioId = 'scenario-0000-fake-uuid') => puids.map((id, index) => ({
    lockStatus: lock_status_enum_1.LockStatus.Unstated,
    planningUnitMarxanId: index++,
    scenarioId,
    puGeometryId: id,
    id: uuid_1.v4(),
}));
exports.validDataWithGivenPuIds = validDataWithGivenPuIds;
//# sourceMappingURL=scenario-planning-unit-geo.data.js.map