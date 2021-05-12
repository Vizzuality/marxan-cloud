import { Logger, OnModuleDestroy } from '@nestjs/common';
import { JobsOptions, Queue, QueueEvents } from 'bullmq';
export declare class QueueService<NewJobInput, Opts extends JobsOptions = JobsOptions> implements OnModuleDestroy {
    readonly logger: Logger;
    readonly queue: Queue<NewJobInput, Opts>;
    readonly events: QueueEvents;
    constructor(logger: Logger, queue: Queue<NewJobInput, Opts>, events: QueueEvents);
    registerEventHandler(event: 'waiting' | 'delayed' | 'progress' | 'stalled' | 'completed' | 'failed' | 'removed' | 'drained', listener: (args: {
        jobId: string;
        delay?: number;
        data?: string;
        returnValue?: string;
        failedReason?: string;
    }) => void): void;
    onModuleDestroy(): Promise<void>;
}
