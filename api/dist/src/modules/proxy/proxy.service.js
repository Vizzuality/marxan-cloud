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
var ProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_utils_1 = require("../../utils/config.utils");
const Server = require("http-proxy");
let ProxyService = ProxyService_1 = class ProxyService {
    constructor() {
        this.geoprocessingServiceUrl = config_utils_1.AppConfig.get('geoprocessing.url');
        this.logger = new common_1.Logger(ProxyService_1.name);
        this.server = Server.createProxyServer();
    }
    proxyTileRequest(request, response) {
        request.url = request.originalUrl.replace('api/v1/', 'api/v1/geodata/');
        return this.server.web(request, response, { changeOrigin: true, target: this.geoprocessingServiceUrl }, (error) => {
            this.logger.error(`Unexpected exception on proxy to tile service - ${error}`);
            return response
                .status(common_1.HttpStatus.BAD_GATEWAY)
                .send({ message: `Unexpected exception during request - ${error}` });
        });
    }
    async proxyUploadShapeFile(request, response) {
        request.url = request.originalUrl.replace('api/v1/scenarios', 'api/v1/geodata/planning-units');
        return this.server.web(request, response, {
            changeOrigin: true,
            target: this.geoprocessingServiceUrl,
        }, (error) => {
            this.logger.error(`Unexpected exception on proxy for shapefile upload service - ${error}`);
            return response
                .status(common_1.HttpStatus.BAD_GATEWAY)
                .send({ message: `Unexpected exception during request - ${error}` });
        });
    }
};
ProxyService = ProxyService_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], ProxyService);
exports.ProxyService = ProxyService;
//# sourceMappingURL=proxy.service.js.map