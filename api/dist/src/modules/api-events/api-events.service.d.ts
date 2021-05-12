import { DeleteResult, Repository } from 'typeorm';
import { ApiEvent, QualifiedEventTopic } from './api-event.api.entity';
import { ApiEventByTopicAndKind, LatestApiEventByTopicAndKind } from './api-event.topic+kind.api.entity';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
import { CreateApiEventDTO } from './dto/create.api-event.dto';
import { UpdateApiEventDTO } from './dto/update.api-event.dto';
import { AppInfoDTO } from 'dto/info.dto';
export declare class ApiEventsService extends AppBaseService<ApiEvent, CreateApiEventDTO, UpdateApiEventDTO, AppInfoDTO> {
    readonly repo: Repository<ApiEvent>;
    readonly latestEventByTopicAndKindRepo: Repository<LatestApiEventByTopicAndKind>;
    constructor(repo: Repository<ApiEvent>, latestEventByTopicAndKindRepo: Repository<LatestApiEventByTopicAndKind>);
    get serializerConfig(): JSONAPISerializerConfig<ApiEvent>;
    getLatestEventForTopic(qualifiedTopic: QualifiedEventTopic): Promise<ApiEventByTopicAndKind | undefined>;
    purgeAll(qualifiedTopic?: QualifiedEventTopic): Promise<DeleteResult>;
}
