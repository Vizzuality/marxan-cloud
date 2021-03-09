import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, getRepository, Repository } from 'typeorm';

import { ApiEvent, QualifiedEventTopic } from './api-event.api.entity';
import {
  ApiEventByTopicAndKind,
  LatestApiEventByTopicAndKind,
} from './api-event.topic+kind.api.entity';
import { logger } from './api-events.module';

import { isNil } from 'lodash';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { CreateApiEventDTO } from './dto/create.api-event.dto';
import { UpdateApiEventDTO } from './dto/update.api-event.dto';
import { AppInfoDTO } from 'dto/info.dto';

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
  constructor(@InjectRepository(ApiEvent) readonly repo: Repository<ApiEvent>) {
    super(repo);
  }
  get serializerConfig(): JSONAPISerializerConfig<ApiEvent> {
    return {
      attributes: ['timestamp', 'topic', 'kind', 'apiVersion', 'data'],
      keyForAttribute: 'camelCase',
    };
  }

  /**
   * Given a `QualifiedEventTopic` (topic qualified by `kind` and `apiEvent`),
   * return the matching event with latest timestamp.
   *
   * @debt We actually only match `topic` and `kind`, via the relevant view, so
   * the `apiVersion` prop is ignored here. This is enough in practice, until
   * we actively start supporting different `apiVersion`s in this simple event
   * queue system.
   */
  public async getLatestEventForTopic(
    qualifiedTopic?: QualifiedEventTopic,
  ): Promise<ApiEventByTopicAndKind | undefined> {
    try {
      return getRepository(LatestApiEventByTopicAndKind)
        .createQueryBuilder('event')
        .where('event.topic = :topic AND event.kind = :kind', {
          topic: qualifiedTopic?.topic,
          kind: qualifiedTopic?.kind,
        })
        .getOne();
    } catch (error) {
      Logger.error(error);
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
      logger.log(
        `Purging events for topic ${qualifiedTopic.topic}/${qualifiedTopic.kind}/${qualifiedTopic.apiVersion}`,
      );
      return this.repo.delete({
        topic: qualifiedTopic.topic,
        kind: qualifiedTopic.kind,
        apiVersion: qualifiedTopic.apiVersion,
      });
    } else {
      Logger.log(`Purging events`);
      await this.repo.clear();
      return new DeleteResult();
    }
  }
}
