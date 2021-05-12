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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_controller_1 = require("../../app.controller");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const authentication_service_1 = require("./authentication.service");
const login_dto_1 = require("./dto/login.dto");
const sign_up_dto_1 = require("./dto/sign-up.dto");
const user_account_validation_dto_1 = require("./dto/user-account.validation.dto");
const local_auth_guard_1 = require("./local-auth.guard");
let AuthenticationController = class AuthenticationController {
    constructor(authenticationService) {
        this.authenticationService = authenticationService;
    }
    async login(req, _dto) {
        return this.authenticationService.login(req.user);
    }
    async logout(req) {
        await this.authenticationService.invalidateAllTokensOfUser(req.user.id);
    }
    async signUp(_req, signupDto) {
        await this.authenticationService.createUser(signupDto);
    }
    async confirm(activationToken) {
        await this.authenticationService.validateActivationToken(activationToken);
    }
    async refreshToken(req) {
        return this.authenticationService.login(req.user);
    }
};
__decorate([
    common_1.UseGuards(local_auth_guard_1.LocalAuthGuard),
    swagger_1.ApiOperation({
        description: 'Sign user in, issuing a JWT token.',
        summary: 'Sign user in',
        operationId: 'sign-in',
    }),
    common_1.Post('sign-in'),
    swagger_1.ApiCreatedResponse({
        type: 'AccessToken',
    }),
    __param(0, common_1.Request()),
    __param(1, common_1.Body(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "login", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({
        description: 'Sign user out of all their current sessions by invalidating all the JWT tokens issued to them',
        summary: 'Sign user out',
        operationId: 'sign-out',
    }),
    common_1.Post('sign-out'),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    __param(0, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "logout", null);
__decorate([
    common_1.Post('sign-up'),
    swagger_1.ApiOperation({ description: 'Sign up for a MarxanCloud account.' }),
    swagger_1.ApiCreatedResponse(),
    swagger_1.ApiBadRequestResponse(),
    swagger_1.ApiForbiddenResponse(),
    __param(0, common_1.Request()),
    __param(1, common_1.Body(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sign_up_dto_1.SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "signUp", null);
__decorate([
    common_1.Get('validate-account/:sub/:validationToken'),
    swagger_1.ApiOperation({ description: 'Confirm an activation token for a new user.' }),
    swagger_1.ApiOkResponse(),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_account_validation_dto_1.UserAccountValidationDTO]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "confirm", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post('refresh-token'),
    swagger_1.ApiOperation({
        description: 'Request a fresh JWT token, given a still-valid one for the same user; no request payload is required: the user id is read from the JWT token presented.',
        summary: 'Refresh JWT token',
        operationId: 'refresh-token',
    }),
    swagger_1.ApiCreatedResponse({
        type: 'AccessToken',
    }),
    swagger_1.ApiUnauthorizedResponse(),
    __param(0, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "refreshToken", null);
AuthenticationController = __decorate([
    common_1.Controller('/auth'),
    swagger_1.ApiTags('Authentication'),
    __metadata("design:paramtypes", [authentication_service_1.AuthenticationService])
], AuthenticationController);
exports.AuthenticationController = AuthenticationController;
//# sourceMappingURL=authentication.controller.js.map