import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import {
  FeatureShapefileImportEventsPort,
  FeatureShapefileImportState,
} from '@marxan-api/modules/geo-features/ports/feature-shapefile-import-events-port';

@Injectable()
export class FeatureShapefileImportApiEvents
  extends ApiEventsService
  implements FeatureShapefileImportEventsPort
{
  private readonly eventsMap: Record<
    FeatureShapefileImportState,
    API_EVENT_KINDS
  > = {
    [FeatureShapefileImportState.FeatureShapefileSubmitted]:
      API_EVENT_KINDS.project__features__shapefile__import__submitted__v1__alpha,
    [FeatureShapefileImportState.FeatureShapefileFinished]:
      API_EVENT_KINDS.project__features__shapefile__import__finished__v1__alpha,
    [FeatureShapefileImportState.FeatureShapefileFailed]:
      API_EVENT_KINDS.project__features__shapefile__import__failed__v1__alpha,
  };

  async event(
    projectId: string,
    state: FeatureShapefileImportState,
    context?: Record<string, unknown>,
  ): Promise<void> {
    await this.create({
      data: context ?? {},
      topic: projectId,
      kind: this.eventsMap[state],
    });
  }
}
