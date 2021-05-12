"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArePuidsAllowedMock = void 0;
const common_1 = require("@nestjs/common");
let ArePuidsAllowedMock = class ArePuidsAllowedMock {
    constructor() {
        this.mock = jest.fn();
    }
    async validate(scenarioId, puIds) {
        return this.mock(scenarioId, puIds);
    }
};
ArePuidsAllowedMock = __decorate([
    common_1.Injectable()
], ArePuidsAllowedMock);
exports.ArePuidsAllowedMock = ArePuidsAllowedMock;
//# sourceMappingURL=are-puuids-allowed.mock.js.map