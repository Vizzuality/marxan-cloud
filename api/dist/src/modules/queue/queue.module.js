"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QueueModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const config = require("config");
const queue_service_1 = require("./queue.service");
const queue_tokens_1 = require("./queue.tokens");
let QueueModule = QueueModule_1 = class QueueModule {
    static register(options) {
        return {
            module: QueueModule_1,
            providers: [
                queue_service_1.QueueService,
                {
                    provide: queue_tokens_1.QueueNameToken,
                    useValue: options.name,
                },
                {
                    provide: queue_tokens_1.QueueToken,
                    useValue: new bullmq_1.Queue(options.name, Object.assign(Object.assign({}, config.get('redisApi')), { defaultJobOptions: config.get('jobOptions') })),
                },
                {
                    provide: queue_tokens_1.QueueEventsToken,
                    useValue: new bullmq_1.QueueEvents(options.name, config.get('redisApi')),
                },
                {
                    provide: queue_tokens_1.QueueLoggerToken,
                    useValue: new common_1.Logger(`${options.name}-queue-publisher`),
                },
            ],
            exports: [
                queue_service_1.QueueService,
                queue_tokens_1.QueueNameToken,
                queue_tokens_1.QueueToken,
                queue_tokens_1.QueueEventsToken,
                queue_tokens_1.QueueLoggerToken,
            ],
        };
    }
};
QueueModule = QueueModule_1 = __decorate([
    common_1.Module({})
], QueueModule);
exports.QueueModule = QueueModule;
//# sourceMappingURL=queue.module.js.map