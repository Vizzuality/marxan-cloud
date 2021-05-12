"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thresholdChangeSet = exports.fullWatchedChangeSet = exports.emptyWatchedChangeSet = void 0;
const protected_area_geo_entity_1 = require("../../protected-areas/protected-area.geo.entity");
const emptyWatchedChangeSet = () => ({
    customProtectedAreaIds: undefined,
    wdpaIucnCategories: undefined,
    wdpaThreshold: undefined,
});
exports.emptyWatchedChangeSet = emptyWatchedChangeSet;
const fullWatchedChangeSet = () => ({
    customProtectedAreaIds: ['20000000-2000-2000-2000-200000000000'],
    wdpaIucnCategories: [protected_area_geo_entity_1.IUCNCategory.III],
    wdpaThreshold: 30,
});
exports.fullWatchedChangeSet = fullWatchedChangeSet;
const thresholdChangeSet = () => ({
    customProtectedAreaIds: undefined,
    wdpaIucnCategories: undefined,
    wdpaThreshold: 30,
});
exports.thresholdChangeSet = thresholdChangeSet;
//# sourceMappingURL=input-change.data.js.map