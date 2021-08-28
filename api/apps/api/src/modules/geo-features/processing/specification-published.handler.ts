import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SpecificationPublished } from '@marxan-api/modules/specification/domain';
import { RunService } from './run.service';

enum OperationType {
  Copy = 'copy',
  Split = 'split',
  Stratification = 'stratification',
}

type Feature = {
  id: string;
  scenarioId: string;
  operationType: OperationType;
};

class FeatureRepository {
  find(_nonCalculatedFeatures: string[]): Feature[] {
    return [];
  }
}
// draft
@EventsHandler(SpecificationPublished)
export class SpecificationPublishedHandler
  implements IEventHandler<SpecificationPublished> {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly runService: RunService,
  ) {}
  async handle(event: SpecificationPublished) {
    const features = this.featureRepository.find(event.nonCalculatedFeatures);
    for (const feature of features) {
      switch (feature.operationType) {
        case OperationType.Copy:
          await this.runService.runCopy({
            featureId: feature.id,
            scenarioId: feature.scenarioId,
            specificationId: event.id,
          });
          break;
        case OperationType.Split:
          await this.runService.runSplit({
            featureId: feature.id,
            scenarioId: feature.scenarioId,
            specificationId: event.id,
          });
          break;
        case OperationType.Stratification:
          await this.runService.runStratification({
            featureId: feature.id,
            scenarioId: feature.scenarioId,
            specificationId: event.id,
          });
          break;
      }
    }
  }
}
