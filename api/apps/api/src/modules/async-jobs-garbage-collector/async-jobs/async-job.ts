import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';
import { QualifiedEventTopicSearch } from '@marxan-api/modules/api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';

@Injectable()
export abstract class AsyncJob {
  constructor(protected readonly apiEvents: ApiEventsService) {}

  protected abstract getAllAsyncJobStates(): API_EVENT_KINDS[];

  protected abstract getEndAsynJobStates(): API_EVENT_KINDS[];

  protected abstract getFailedAsyncJobState(
    stuckState: API_EVENT_KINDS,
  ): API_EVENT_KINDS;

  protected abstract getMaxHoursForAsyncJob(): number;

  public async sendFailedApiEventForStuckAsyncJob(resourceId: string) {
    const latestApiEvent = await this.findLatestApiEvent({
      topic: resourceId,
      kind: In(this.getAllAsyncJobStates()),
    });

    if (!latestApiEvent) return;

    const hasAsyncJobFinsihed = this.hasAsyncJobFinsihed(latestApiEvent);

    if (hasAsyncJobFinsihed) return;

    const isAsyncJobStuck = this.isAsyncJobStuck(latestApiEvent);

    if (!isAsyncJobStuck) return;

    return this.sendFailedApiEvent(resourceId, latestApiEvent);
  }

  private async findLatestApiEvent(
    qualifiedTopic: QualifiedEventTopicSearch,
  ): Promise<ApiEventByTopicAndKind | undefined> {
    try {
      const previousEvent = await this.apiEvents.getLatestEventForTopic(
        qualifiedTopic,
      );

      return previousEvent;
    } catch (err) {
      if (err instanceof NotFoundException) {
        return undefined;
      }
      throw err;
    }
  }

  private hasAsyncJobFinsihed(latestApiEvent: ApiEventByTopicAndKind) {
    return this.getEndAsynJobStates().includes(latestApiEvent.kind);
  }
  private isAsyncJobStuck(latestApiEvent: ApiEventByTopicAndKind) {
    const maxTime = this.getMaxTimeForAsyncJob();
    return maxTime.getTime() >= latestApiEvent.timestamp.getTime();
  }

  private async sendFailedApiEvent(
    resourceId: string,
    latestApiEvent: ApiEventByTopicAndKind,
  ) {
    const failedKind = this.getFailedAsyncJobState(latestApiEvent.kind);

    await this.apiEvents.createIfNotExists({
      kind: failedKind,
      topic: resourceId,
    });
  }

  private getMaxTimeForAsyncJob() {
    const now = new Date();
    now.setHours(now.getHours() - this.getMaxHoursForAsyncJob());
    return now;
  }
}
