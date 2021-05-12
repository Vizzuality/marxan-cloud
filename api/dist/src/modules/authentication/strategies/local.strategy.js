"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const authentication_service_1 = require("../authentication.service");
const user_api_entity_1 = require("../../users/user.api.entity");
const passport_local_1 = require("passport-local");
let LocalStrategy = class LocalStrategy extends passport_1.PassportStrategy(passport_local_1.Strategy) {
    constructor(authenticationService) {
        super();
        this.authenticationService = authenticationService;
    }
    async validate(email, password) {
        const user = await this.authenticationService.validateUser({
            email,
            password,
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
LocalStrategy = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [authentication_service_1.AuthenticationService])
], LocalStrategy);
exports.LocalStrategy = LocalStrategy;
//# sourceMappingURL=local.strategy.js.map