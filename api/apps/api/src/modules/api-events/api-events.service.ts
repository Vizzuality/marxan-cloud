import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository } from 'typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';

import {
  ApiEvent,
  apiEventResource,
  QualifiedEventTopic,
} from './api-event.api.entity';
import {
  ApiEventByTopicAndKind,
  LatestApiEventByTopicAndKind,
} from './api-event.topic+kind.api.entity';

import { isNil } from 'lodash';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';
import { CreateApiEventDTO } from './dto/create.api-event.dto';
import { UpdateApiEventDTO } from './dto/update.api-event.dto';
import { AppInfoDTO } from '../../dto/info.dto';
import { AppConfig } from '../../utils/config.utils';

export const duplicate = Symbol();

@Injectable()
/**
 * API Events
 */
export class ApiEventsService extends AppBaseService<
  ApiEvent,
  CreateApiEventDTO,
  UpdateApiEventDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(ApiEvent) readonly repo: Repository<ApiEvent>,
    @InjectRepository(LatestApiEventByTopicAndKind)
    readonly latestEventByTopicAndKindRepo: Repository<LatestApiEventByTopicAndKind>,
  ) {
    super(repo, apiEventResource.name.singular, apiEventResource.name.plural, {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }
  get serializerConfig(): JSONAPISerializerConfig<ApiEvent> {
    return {
      attributes: ['timestamp', 'topic', 'kind', 'data'],
      keyForAttribute: 'camelCase',
    };
  }

  /**
   * Given a `QualifiedEventTopic` (topic qualified by `kind` and `apiEvent`),
   * return the matching event with latest timestamp.
   */
  public async getLatestEventForTopic(
    qualifiedTopic: QualifiedEventTopic,
  ): Promise<ApiEventByTopicAndKind | undefined> {
    const result = await this.latestEventByTopicAndKindRepo.findOne({
      topic: qualifiedTopic.topic,
      kind: qualifiedTopic.kind,
    });
    if (!result) {
      throw new NotFoundException(
        `No events found for topic ${qualifiedTopic.topic} and kind ${qualifiedTopic.kind}.`,
      );
    }

    return result;
  }

  /**
   * recognizes duplicates on {@link CreateApiEventDTO.externalId}
   */
  async createIfNotExists(
    data: CreateApiEventDTO,
  ): Promise<Either<typeof duplicate, ApiEvent>> {
    try {
      return right(await this.create(data));
    } catch (error) {
      const postgresDuplicateKeyErrorCode = '23505';
      const externalIdConstraint = 'api_events_external_id_unique';
      if (
        error.code === postgresDuplicateKeyErrorCode &&
        error.constraint === externalIdConstraint
      ) {
        return left(duplicate);
      }
      throw error;
    }
  }

  /**
   * Purge all events. Optionally this can be limited to events of a given
   * `QualifiedEventTopic` (i.e. a topic qualified by `kind` and `apiVersion`).
   */
  public async purgeAll(
    qualifiedTopic?: QualifiedEventTopic,
  ): Promise<DeleteResult> {
    if (!isNil(qualifiedTopic)) {
      this.logger.log(
        `Purging events for topic ${qualifiedTopic.topic}/${qualifiedTopic.kind}}`,
      );
      return this.repo.delete({
        topic: qualifiedTopic.topic,
        kind: qualifiedTopic.kind,
      });
    } else {
      this.logger.log(`Purging events`);
      await this.repo.clear();
      return new DeleteResult();
    }
  }
}
