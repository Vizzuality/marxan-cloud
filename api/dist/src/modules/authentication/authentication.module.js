"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationModule = exports.logger = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const user_api_entity_1 = require("../users/user.api.entity");
const users_module_1 = require("../users/users.module");
const config_utils_1 = require("../../utils/config.utils");
const issued_authn_token_api_entity_1 = require("./issued-authn-token.api.entity");
const authentication_controller_1 = require("./authentication.controller");
const authentication_service_1 = require("./authentication.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const local_strategy_1 = require("./strategies/local.strategy");
const api_events_module_1 = require("../api-events/api-events.module");
exports.logger = new common_1.Logger('Authentication');
let AuthenticationModule = class AuthenticationModule {
};
AuthenticationModule = __decorate([
    common_1.Module({
        imports: [
            api_events_module_1.ApiEventsModule,
            common_1.forwardRef(() => users_module_1.UsersModule),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: config_utils_1.AppConfig.get('auth.jwt.secret'),
                signOptions: { expiresIn: config_utils_1.AppConfig.get('auth.jwt.expiresIn', '2h') },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_api_entity_1.User, issued_authn_token_api_entity_1.IssuedAuthnToken]),
        ],
        providers: [authentication_service_1.AuthenticationService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy],
        controllers: [authentication_controller_1.AuthenticationController],
        exports: [authentication_service_1.AuthenticationService],
    })
], AuthenticationModule);
exports.AuthenticationModule = AuthenticationModule;
//# sourceMappingURL=authentication.module.js.map