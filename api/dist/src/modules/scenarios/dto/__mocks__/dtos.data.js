"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDtoWithInvalidMultiPolygon = exports.getDtoWithInvalidUuids = exports.getDtoByIds = void 0;
const update_scenario_planning_unit_lock_status_dto_1 = require("../update-scenario-planning-unit-lock-status.dto");
const uuid_1 = require("uuid");
const geometry_1 = require("./geometry");
const getDtoByIds = (include, exclude) => {
    const withInvalidIds = new update_scenario_planning_unit_lock_status_dto_1.UpdateScenarioPlanningUnitLockStatusDto();
    const withOptions = new update_scenario_planning_unit_lock_status_dto_1.PlanningUnitsByIdUpdateDto();
    withOptions.include = include;
    withOptions.exclude = exclude;
    withInvalidIds.byId = withOptions;
    return withInvalidIds;
};
exports.getDtoByIds = getDtoByIds;
const getDtoWithInvalidUuids = () => exports.getDtoByIds(['non-uuid'], [uuid_1.v4()]);
exports.getDtoWithInvalidUuids = getDtoWithInvalidUuids;
const getDtoWithInvalidMultiPolygon = () => {
    const withInvalidIds = new update_scenario_planning_unit_lock_status_dto_1.UpdateScenarioPlanningUnitLockStatusDto();
    const withOptions = new update_scenario_planning_unit_lock_status_dto_1.PlanningUnitsByGeoJsonUpdateDto();
    withOptions.include = [geometry_1.sampleMultiPolygonJson()];
    withOptions.exclude = [geometry_1.invalidMultiPolygon()];
    withInvalidIds.byGeoJson = withOptions;
    return withInvalidIds;
};
exports.getDtoWithInvalidMultiPolygon = getDtoWithInvalidMultiPolygon;
//# sourceMappingURL=dtos.data.js.map