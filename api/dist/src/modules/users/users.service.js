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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_api_entity_1 = require("./user.api.entity");
const lodash_1 = require("lodash");
const info_dto_1 = require("../../dto/info.dto");
const faker = require("faker");
const app_base_service_1 = require("../../utils/app-base.service");
const bcrypt_1 = require("bcrypt");
const authentication_service_1 = require("../authentication/authentication.service");
const uuid_1 = require("uuid");
const config_utils_1 = require("../../utils/config.utils");
let UsersService = class UsersService extends app_base_service_1.AppBaseService {
    constructor(repository, authenticationService) {
        super(repository, user_api_entity_1.userResource.name.singular, user_api_entity_1.userResource.name.plural, {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.repository = repository;
        this.authenticationService = authenticationService;
    }
    get serializerConfig() {
        return {
            attributes: [
                'fname',
                'lname',
                'email',
                'displayName',
                'avatarDataUrl',
                'isActive',
                'isDeleted',
                'metadata',
                'projects',
                'scenarios',
            ],
            keyForAttribute: 'camelCase',
            projects: {
                ref: 'id',
                attributes: [
                    'name',
                    'description',
                    'countryId',
                    'adminAreaLevel1Id',
                    'adminAreaLevel2Id',
                    'planningUnitGridShape',
                    'planningUnitAreakm2',
                    'createdAt',
                    'lastModifiedAt',
                ],
            },
            scenarios: {
                ref: 'id',
                attributes: [
                    'name',
                    'description',
                    'type',
                    'wdpaFilter',
                    'wdpaThreshold',
                    'adminRegionId',
                    'numberOfRuns',
                    'boundaryLengthModifier',
                    'metadata',
                    'status',
                    'createdAt',
                    'lastModifiedAt',
                ],
            },
        };
    }
    async fakeFindOne(_id) {
        return Object.assign(Object.assign({}, new user_api_entity_1.User()), { id: faker.random.uuid(), email: faker.internet.email(), displayName: `${faker.name.firstName()} ${faker.name.lastName()}`, fname: faker.name.firstName(), lname: faker.name.lastName(), isActive: faker.random.boolean(), isDeleted: faker.random.boolean() });
    }
    async findByEmail(email) {
        return this.repository.findOne({ email: typeorm_2.ILike(email.toLowerCase()) });
    }
    static getSanitizedUserMetadata(user) {
        return lodash_1.omit(user, ['passwordHash', 'isActive', 'isDeleted']);
    }
    async markAsDeleted(userId) {
        await this.repository.update({ id: userId }, {
            isDeleted: true,
            isActive: false,
            email: `deleted-account.${uuid_1.v4()}@example.com`,
        });
        this.authenticationService.invalidateAllTokensOfUser(userId);
    }
    async updateOwnPassword(userId, currentAndNewPasswords, _info) {
        const user = await this.getById(userId);
        if (user &&
            (await bcrypt_1.compare(currentAndNewPasswords.currentPassword, user.passwordHash))) {
            user.passwordHash = await bcrypt_1.hash(currentAndNewPasswords.newPassword, 10);
            await this.repository.save(user);
            return;
        }
        throw new common_1.ForbiddenException('Updating the password is not allowed: the password provided for validation as current one does not match the actual current password. If you have forgotten your password, try resetting it instead.');
    }
    async validateBeforeUpdate(id, updateModel, _info) {
        if (updateModel.password) {
            throw new common_1.ForbiddenException("The user's password cannot be updated alongside other user data: please use the API endpoint for password updates.");
        }
        if (updateModel.email) {
            throw new common_1.NotImplementedException("Updating a user's email address is not supported yet. This will be allowed once email address verification is implemented.");
        }
    }
};
UsersService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(user_api_entity_1.User)),
    __param(1, common_1.Inject(common_1.forwardRef(() => authentication_service_1.AuthenticationService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        authentication_service_1.AuthenticationService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map