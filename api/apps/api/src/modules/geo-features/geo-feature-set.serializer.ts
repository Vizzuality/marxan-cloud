import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { GeoFeatureSetService } from './geo-feature-set.service';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';
import { SimpleJobStatus } from '../scenarios/scenario.api.entity';
import { GeoFeatureSetResult } from '@marxan-api/modules/geo-features/geo-feature-set.api.entity';
import { plainToClass } from 'class-transformer';
import { AsyncJobDto } from '@marxan-api/dto/async-job.dto';

@Injectable()
export class GeoFeatureSetSerializer {
  constructor(private readonly geoFeatureSetsService: GeoFeatureSetService) {}

  async serialize(
    entities:
      | Partial<GeoFeatureSetSpecification>
      | undefined
      | (Partial<GeoFeatureSetSpecification> | undefined)[],
    paginationMeta?: PaginationMeta,
    asyncJobTriggered?: boolean,
  ): Promise<GeoFeatureSetResult> {
    return plainToClass(GeoFeatureSetResult, {
      ...(await this.geoFeatureSetsService.serialize(entities, paginationMeta)),
      meta: asyncJobTriggered ? AsyncJobDto.forScenario() : undefined,
    });
  }

  /**
   * @deprecated
   */
  emptySpecification() {
    return this.geoFeatureSetsService.serialize({
      status: SimpleJobStatus.draft,
      features: [],
    });
  }
}
