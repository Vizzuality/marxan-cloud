import { API_EVENT_KINDS } from './api-event.api.entity';
export declare class ApiEventByTopicAndKind {
    timestamp: Date;
    kind: API_EVENT_KINDS;
    topic: string;
    data?: Record<string, unknown>;
}
export declare class LatestApiEventByTopicAndKind extends ApiEventByTopicAndKind {
}
export declare class FirstApiEventByTopicAndKind extends ApiEventByTopicAndKind {
}
