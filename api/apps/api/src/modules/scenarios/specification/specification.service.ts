import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GeoFeaturePropertySetService } from '@marxan-api/modules/geo-features/geo-feature-property-sets.service';
import { CreateGeoFeatureSetDTO } from '@marxan-api/modules/geo-features/dto/create.geo-feature-set.dto';
import { SubmitSpecification } from '@marxan-api/modules/specification';
import { SimpleJobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { classToPlain } from 'class-transformer';

import { GeoFeatureDtoMapper } from './geo-feature-dto.mapper';

@Injectable()
export class SpecificationService {
  constructor(
    private readonly geoFeatureSetSerializer: GeoFeaturePropertySetService,
    private readonly geoFeatureConfigMapper: GeoFeatureDtoMapper,
    private readonly commandBus: CommandBus,
  ) {}

  async submit(
    scenarioId: string,
    projectId: string,
    dto: CreateGeoFeatureSetDTO,
  ) {
    await this.commandBus.execute(
      new SubmitSpecification({
        scenarioId,
        draft: dto.status === SimpleJobStatus.draft,
        features: dto.features.flatMap((feature) =>
          this.geoFeatureConfigMapper.toFeatureConfig(feature),
        ),
        raw: classToPlain(dto),
      }),
    );
    return this.geoFeatureSetSerializer.extendGeoFeatureProcessingSpecification(
      dto,
      {
        projectId,
      },
    );
  }
}
