"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const config = require("config");
const lodash_1 = require("lodash");
const JSONAPISerializer = require("jsonapi-serializer");
const config_utils_1 = require("../utils/config.utils");
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger();
    }
    catch(exception, host) {
        var _a;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorData = {
            status: status,
            title: exception.message,
            meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
                type: (_a = Object.getPrototypeOf(exception)) === null || _a === void 0 ? void 0 : _a.name,
                rawError: exception,
                stack: exception.stack,
            },
        };
        if (!config_utils_1.AppConfig.get('logging.muteAll', false)) {
            this.logger.error(errorData);
        }
        const errorDataForResponse = new JSONAPISerializer.Error(config.util.getEnv('NODE_ENV') !== 'development'
            ? lodash_1.omit(errorData, ['meta.rawError', 'meta.stack'])
            : errorData);
        response
            .status(status)
            .header('Content-Type', 'application/json')
            .header('Content-Disposition', 'inline')
            .json(errorDataForResponse);
    }
};
AllExceptionsFilter = __decorate([
    common_1.Catch(Error)
], AllExceptionsFilter);
exports.AllExceptionsFilter = AllExceptionsFilter;
//# sourceMappingURL=all-exceptions.exception.filter.js.map