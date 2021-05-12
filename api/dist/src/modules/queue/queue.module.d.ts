import { DynamicModule } from '@nestjs/common';
export interface QueueConfig {
    name: string;
}
export declare class QueueModule {
    static register(options: QueueConfig): DynamicModule;
}
