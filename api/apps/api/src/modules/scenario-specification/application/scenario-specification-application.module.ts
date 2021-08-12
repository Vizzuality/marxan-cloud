import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ActivateCandidateSpecificationHandler } from './activate-candidate-specification.handler';
import { AssignCandidateSpecificationHandler } from './assign-candidate-specification.handler';
import { SpecificationCandidateCreatedSaga } from './sagas/specification-candidate-created.saga';
import { LastUpdatedSpecificationHandler } from './last-updated-specification.handler';
import { SpecificationCandidateReadyToActivateSaga } from './sagas/specification-candidate-ready-to-activate.saga';

@Module({})
export class ScenarioSpecificationApplicationModule {
  static for(adaptersModule: ModuleMetadata['imports']): DynamicModule {
    return {
      module: ScenarioSpecificationApplicationModule,
      imports: [CqrsModule, ...(adaptersModule ?? [])],
      providers: [
        ActivateCandidateSpecificationHandler,
        AssignCandidateSpecificationHandler,
        LastUpdatedSpecificationHandler,
        SpecificationCandidateCreatedSaga,
        SpecificationCandidateReadyToActivateSaga,
      ],
    };
  }
}
