"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioWithAllWatchedPresent = exports.scenarioWithRequiredWatchedEmpty = void 0;
const scenario_api_entity_1 = require("../scenario.api.entity");
const scenarioBase = () => ({
    createdAt: new Date('2021-05-10T10:25:11.959Z'),
    lastModifiedAt: new Date('2021-05-10T10:25:11.959Z'),
    createdBy: '00000000-0000-0000-0000-000000000000',
    createdByUser: {},
    id: '00000000-0000-0000-0000-000000000000',
    name: `Scenario Name`,
    projectId: '00000000-0000-0000-0000-000000000000',
    status: scenario_api_entity_1.JobStatus.done,
    type: scenario_api_entity_1.ScenarioType.marxan,
    users: [],
    wdpaThreshold: undefined,
    wdpaIucnCategories: undefined,
    protectedAreaFilterByIds: undefined,
});
const scenarioWithRequiredWatchedEmpty = () => (Object.assign(Object.assign({}, scenarioBase()), { wdpaThreshold: undefined }));
exports.scenarioWithRequiredWatchedEmpty = scenarioWithRequiredWatchedEmpty;
const scenarioWithAllWatchedPresent = () => (Object.assign(Object.assign({}, scenarioBase()), { wdpaThreshold: 40 }));
exports.scenarioWithAllWatchedPresent = scenarioWithAllWatchedPresent;
//# sourceMappingURL=scenario.data.js.map