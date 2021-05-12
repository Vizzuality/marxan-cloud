import { RequestWithAuthenticatedUser } from 'app.controller';
import { FetchSpecification } from 'nestjs-base-service';
import { DeleteResult } from 'typeorm';
import { API_EVENT_KINDS, ApiEventResult } from './api-event.api.entity';
import { ApiEventsService } from './api-events.service';
import { CreateApiEventDTO } from './dto/create.api-event.dto';
export declare class ApiEventsController {
    service: ApiEventsService;
    constructor(service: ApiEventsService);
    findAll(fetchSpecification: FetchSpecification): Promise<ApiEventResult>;
    findLatestEventByKindAndTopic(kind: API_EVENT_KINDS, topic: string): Promise<ApiEventResult>;
    create(dto: CreateApiEventDTO, req: RequestWithAuthenticatedUser): Promise<ApiEventResult>;
    deleteEventSeriesByKindAndTopic(kind: API_EVENT_KINDS, topic: string): Promise<DeleteResult>;
}
