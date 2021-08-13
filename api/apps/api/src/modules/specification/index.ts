export { SpecificationModule } from './specification.module';

export { CalculateFeatures } from './application/calculate-features.command';
export { DetermineFeatures } from './application/determine-features.command';
export { SubmitSpecification } from './application/submit-specification.command';

export {
  notFound,
  GetLastUpdatedSpecification,
  GetSpecificationError,
} from './application/get-specification.query';

export { SpecificationCandidateCreated } from './domain/events/specification-candidate-created.event';
export { SpecificationGotReady } from './domain/events/specification-got-ready.event';
export { SpecificationPublished } from './domain/events/specification-published.event';
export {
  FeatureConfigInput,
  SpecificationOperation,
  FeatureConfigSplit,
} from './domain';
