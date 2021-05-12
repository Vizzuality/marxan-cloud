"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WdpaAreaCalculationService = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
let WdpaAreaCalculationService = class WdpaAreaCalculationService {
    constructor() {
        this.watchedChangeProperties = [
            'customProtectedAreaIds',
            'wdpaIucnCategories',
            'wdpaThreshold',
        ];
        this.requiredToTriggerChange = [
            'wdpaThreshold',
        ];
    }
    shouldTrigger(scenario, changeSet) {
        if (!this.intendsToChangeWatchedProperty(changeSet)) {
            return false;
        }
        return this.areRequiredFieldsAvailable(scenario);
    }
    intendsToChangeWatchedProperty(changeSet) {
        return Object.entries(lodash_1.pick(changeSet, this.watchedChangeProperties)).some(([, value]) => value);
    }
    areRequiredFieldsAvailable(scenario) {
        return Object.entries(lodash_1.pick(scenario, this.requiredToTriggerChange)).every(([, value]) => value);
    }
};
WdpaAreaCalculationService = __decorate([
    common_1.Injectable()
], WdpaAreaCalculationService);
exports.WdpaAreaCalculationService = WdpaAreaCalculationService;
//# sourceMappingURL=wdpa-area-calculation.service.js.map