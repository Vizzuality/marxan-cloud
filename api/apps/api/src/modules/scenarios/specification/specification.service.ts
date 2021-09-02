import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GeoFeaturePropertySetService } from '@marxan-api/modules/geo-features/geo-feature-property-sets.service';
import { CreateGeoFeatureSetDTO } from '@marxan-api/modules/geo-features/dto/create.geo-feature-set.dto';
import { SubmitSpecification } from '@marxan-api/modules/specification';
import { SimpleJobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import { Either, isLeft, right } from 'fp-ts/Either';
import { PromiseType } from 'utility-types';

import { GeoFeatureDtoMapper } from './geo-feature-dto.mapper';
import { SubmitSpecificationError } from '@marxan-api/modules/specification/application/submit-specification.command';
import {
  LastUpdatedSpecification,
  LastUpdatedSpecificationError,
} from '@marxan-api/modules/scenario-specification/application/last-updated-specification.query';

@Injectable()
export class SpecificationService {
  constructor(
    private readonly geoFeatureSetSerializer: GeoFeaturePropertySetService,
    private readonly geoFeatureConfigMapper: GeoFeatureDtoMapper,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async submit(
    scenarioId: string,
    projectId: string,
    dto: CreateGeoFeatureSetDTO,
  ): Promise<
    Either<
      SubmitSpecificationError,
      PromiseType<
        ReturnType<
          typeof GeoFeaturePropertySetService.prototype.extendGeoFeatureProcessingSpecification
        >
      >
    >
  > {
    const result = await this.commandBus.execute(
      new SubmitSpecification({
        scenarioId,
        draft: dto.status === SimpleJobStatus.draft,
        features: dto.features.flatMap((feature) =>
          this.geoFeatureConfigMapper.toFeatureConfig(feature),
        ),
        raw: classToPlain(dto),
        doNotCalculateAreas: dto.doNotCalculateAreas,
      }),
    );

    if (isLeft(result)) {
      return result;
    }

    return right(
      await this.geoFeatureSetSerializer.extendGeoFeatureProcessingSpecification(
        dto,
        {
          projectId,
        },
      ),
    );
  }

  async getLastUpdatedFor(
    scenarioId: string,
    projectId: string,
  ): Promise<Either<LastUpdatedSpecificationError, CreateGeoFeatureSetDTO>> {
    const result = await this.queryBus.execute(
      new LastUpdatedSpecification(scenarioId),
    );
    if (isLeft(result)) {
      return result;
    }
    return right(
      await this.geoFeatureSetSerializer.extendGeoFeatureProcessingSpecification(
        plainToClass(CreateGeoFeatureSetDTO, result.right.raw),
        {
          projectId,
        },
      ),
    );
  }
}
