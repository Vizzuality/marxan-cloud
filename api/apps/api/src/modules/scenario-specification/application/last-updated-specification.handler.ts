import { SpecificationSnapshot } from '@marxan-api/modules/specification/domain';
import { IInferredQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';

import { GetLastUpdatedSpecification } from '@marxan-api/modules/specification';

import {
  LastUpdatedSpecification,
  LastUpdatedSpecificationError,
  notFound,
} from './last-updated-specification.query';
import { ScenarioSpecificationRepo } from './scenario-specification.repo';
import { isDefined } from '@marxan/utils';

@QueryHandler(LastUpdatedSpecification)
export class LastUpdatedSpecificationHandler
  implements IInferredQueryHandler<LastUpdatedSpecification>
{
  constructor(
    private readonly specificationsRepo: ScenarioSpecificationRepo,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({
    forScenario,
  }: LastUpdatedSpecification): Promise<
    Either<LastUpdatedSpecificationError, SpecificationSnapshot>
  > {
    const scenarioSpecification = await this.specificationsRepo.find(
      forScenario,
    );
    if (!scenarioSpecification) {
      return left(notFound);
    }

    const specificationIds = [
      scenarioSpecification.currentActiveSpecification?.value,
      scenarioSpecification.currentCandidateSpecification?.value,
    ].filter(isDefined);

    if (specificationIds.length === 0) {
      return left(notFound);
    }

    const specificationResult = await this.queryBus.execute(
      new GetLastUpdatedSpecification(specificationIds),
    );

    if (isLeft(specificationResult)) {
      return left(notFound);
    }
    return right(specificationResult.right);
  }
}
