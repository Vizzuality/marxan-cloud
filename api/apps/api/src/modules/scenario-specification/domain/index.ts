export { SpecificationId } from './specification.id';

export {
  ScenarioSpecification,
  specificationIsNoLongerACandidate,
  noCandidateToActivate,
} from './scenario-specification';

export { CandidateSpecificationChanged } from './events/candidate-specification-changed.event';
export { SpecificationActivated } from './events/specification-activated.event';
