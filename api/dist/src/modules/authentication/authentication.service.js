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
var AuthenticationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_api_entity_1 = require("../users/user.api.entity");
const users_service_1 = require("../users/users.service");
const config_utils_1 = require("../../utils/config.utils");
const bcrypt_1 = require("bcrypt");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const issued_authn_token_api_entity_1 = require("./issued-authn-token.api.entity");
const ms = require("ms");
const api_events_service_1 = require("../api-events/api-events.service");
const api_event_api_entity_1 = require("../api-events/api-event.api.entity");
const uuid_1 = require("uuid");
const ApiEventsUserData = require("../api-events/dto/apiEvents.user.data.dto");
let AuthenticationService = AuthenticationService_1 = class AuthenticationService {
    constructor(apiEventsService, usersService, jwtService, issuedAuthnTokensRepository, usersRepository) {
        this.apiEventsService = apiEventsService;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.issuedAuthnTokensRepository = issuedAuthnTokensRepository;
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(AuthenticationService_1.name);
    }
    async validateUser({ email, password, }) {
        const user = await this.usersService.findByEmail(email);
        const isUserActive = user && user.isActive && !user.isDeleted;
        if (user && isUserActive && (await bcrypt_1.compare(password, user.passwordHash))) {
            return user;
        }
        return null;
    }
    async createUser(signupDto) {
        const user = new user_api_entity_1.User();
        user.displayName = signupDto.displayName;
        user.passwordHash = await bcrypt_1.hash(signupDto.password, 10);
        user.email = signupDto.email;
        if (process.env['NODE_ENV'] === 'development') {
            user.isActive = true;
        }
        const newUser = users_service_1.UsersService.getSanitizedUserMetadata(await this.usersRepository.save(user));
        if (!newUser) {
            throw new common_1.InternalServerErrorException('Error while creating a new user');
        }
        await this.apiEventsService.create({
            topic: newUser.id,
            kind: api_event_api_entity_1.API_EVENT_KINDS.user__signedUp__v1alpha1,
        });
        const validationToken = uuid_1.v4();
        await this.apiEventsService.create({
            topic: newUser.id,
            kind: api_event_api_entity_1.API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
            data: {
                validationToken: validationToken,
                exp: Date.now() +
                    ms('1d'),
                sub: newUser.email,
            },
        });
        if (process.env['NODE_ENV'] === 'development') {
            this.logger.log(`An account was created for ${newUser.email}. Please validate the account via GET /auth/validate-account/${newUser.id}/${validationToken}.`);
        }
        return newUser;
    }
    async validateActivationToken(token) {
        var _a, _b;
        const invalidOrExpiredActivationTokenMessage = 'Invalid or expired activation token.';
        const event = await this.apiEventsService.getLatestEventForTopic({
            topic: token.sub,
            kind: api_event_api_entity_1.API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
        });
        if (!event) {
            throw new common_1.BadRequestException(invalidOrExpiredActivationTokenMessage);
        }
        const exp = new Date((_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.exp);
        if (new Date() < exp &&
            (event === null || event === void 0 ? void 0 : event.topic) === token.sub &&
            ((_b = event === null || event === void 0 ? void 0 : event.data) === null || _b === void 0 ? void 0 : _b.validationToken) === token.validationToken) {
            await this.apiEventsService.create({
                topic: event.topic,
                kind: api_event_api_entity_1.API_EVENT_KINDS.user__accountActivationSucceeded__v1alpha1,
            });
            await this.usersRepository.update({ id: event.topic }, { isActive: true });
            await this.apiEventsService.purgeAll({
                topic: event.topic,
                kind: api_event_api_entity_1.API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
            });
            return true;
        }
        await this.apiEventsService.create({
            topic: event.topic,
            kind: api_event_api_entity_1.API_EVENT_KINDS.user__accountActivationFailed__v1alpha1,
        });
        throw new common_1.BadRequestException(invalidOrExpiredActivationTokenMessage);
    }
    async login(user) {
        const tokenExpiresIn = config_utils_1.AppConfig.get('auth.jwt.expiresIn', '2h');
        if (!tokenExpiresIn) {
            throw new common_1.InternalServerErrorException('Error while issuing JWT token: invalid `expiresIn` property value.');
        }
        const tokenExpiresAt = Date.now() + ms(tokenExpiresIn);
        const issuedTokenModel = new issued_authn_token_api_entity_1.IssuedAuthnToken();
        issuedTokenModel.exp = new Date(tokenExpiresAt);
        issuedTokenModel.userId = user.id;
        const issuedToken = await this.issuedAuthnTokensRepository.save(issuedTokenModel);
        const payload = {
            sub: user.email,
            tokenId: issuedToken.id,
        };
        await this.purgeExpiredIssuedTokens();
        return {
            user: users_service_1.UsersService.getSanitizedUserMetadata(user),
            accessToken: this.jwtService.sign(Object.assign({}, payload), {
                expiresIn: config_utils_1.AppConfig.get('auth.jwt.expiresIn', '2h'),
            }),
        };
    }
    async findTokenById(tokenId) {
        return this.issuedAuthnTokensRepository.findOne({ id: tokenId });
    }
    async invalidateAllTokensOfUser(userId) {
        await this.issuedAuthnTokensRepository.delete({ userId });
    }
    async purgeExpiredIssuedTokens() {
        await this.issuedAuthnTokensRepository.delete({
            exp: typeorm_1.LessThan(new Date()),
        });
    }
};
AuthenticationService = AuthenticationService_1 = __decorate([
    common_1.Injectable(),
    __param(1, common_1.Inject(common_1.forwardRef(() => users_service_1.UsersService))),
    __param(3, typeorm_2.InjectRepository(issued_authn_token_api_entity_1.IssuedAuthnToken)),
    __param(4, typeorm_2.InjectRepository(user_api_entity_1.User)),
    __metadata("design:paramtypes", [api_events_service_1.ApiEventsService,
        users_service_1.UsersService,
        jwt_1.JwtService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AuthenticationService);
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map