"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyModule = exports.logger = void 0;
const common_1 = require("@nestjs/common");
const proxy_controller_1 = require("./proxy.controller");
const proxy_service_1 = require("./proxy.service");
exports.logger = new common_1.Logger('ProxyService');
let ProxyModule = class ProxyModule {
};
ProxyModule = __decorate([
    common_1.Module({
        imports: [],
        controllers: [proxy_controller_1.ProxyController],
        providers: [proxy_service_1.ProxyService],
        exports: [],
    })
], ProxyModule);
exports.ProxyModule = ProxyModule;
//# sourceMappingURL=proxy.module.js.map