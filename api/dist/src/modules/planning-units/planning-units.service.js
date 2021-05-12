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
exports.PlanningUnitsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const config = require("config");
let PlanningUnitsService = class PlanningUnitsService {
    constructor() {
        this.queueName = 'planning-units';
        this.logger = new common_1.Logger(`${this.queueName}-queue-publisher`);
        this.planningUnitsQueue = new bullmq_1.Queue(this.queueName, Object.assign(Object.assign({}, config.get('redisApi')), { defaultJobOptions: config.get('jobOptions') }));
        this.queueEvents = new bullmq_1.QueueEvents(this.queueName, config.get('redisApi'));
        this.queueEvents.on('completed', (args) => {
            this.logger.log(`this job ${args.jobId} for ${this.queueName} is completed with ${args.returnvalue}`);
        });
        this.queueEvents.on('failed', (args) => {
            this.logger.log(`this job ${args.jobId} for ${this.queueName} has failed ${args.failedReason}`);
        });
    }
    async create(creationOptions) {
        await this.planningUnitsQueue.add('create-regular-pu', creationOptions);
    }
    async onModuleDestroy() {
        await this.queueEvents.close();
        await this.queueEvents.disconnect();
        await this.planningUnitsQueue.close();
        await this.planningUnitsQueue.disconnect();
    }
};
PlanningUnitsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], PlanningUnitsService);
exports.PlanningUnitsService = PlanningUnitsService;
//# sourceMappingURL=planning-units.service.js.map