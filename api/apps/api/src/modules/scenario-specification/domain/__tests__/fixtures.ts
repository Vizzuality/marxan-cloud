import { Either, isLeft } from 'fp-ts/Either';
import { v4 } from 'uuid';
import {
  noCandidateToActivate,
  ScenarioSpecification,
  specificationIsNoLongerACandidate,
} from '../scenario-specification';
import { SpecificationId } from '../specification.id';
import { SpecificationActivated } from '../events/specification-activated.event';
import { CandidateSpecificationChanged } from '../events/candidate-specification-changed.event';

type ActivateResult = Either<
  typeof noCandidateToActivate | typeof specificationIsNoLongerACandidate,
  void
>;

export const getFixtures = () => {
  return {
    GivenEmptyScenarioSpecification() {
      return new ScenarioSpecification(v4());
    },
    WhenCandidateSpecificationIsActivated(
      scenarioSpecification: ScenarioSpecification,
      specificationId: SpecificationId = new SpecificationId(v4()),
    ) {
      return scenarioSpecification.activateCandidateSpecification(
        specificationId,
      );
    },
    ThenNoCandidateIsRaised(result: ActivateResult) {
      expect.assertions(1);
      if (isLeft(result)) {
        expect(result.left).toEqual(noCandidateToActivate);
      }
    },
    GivenScenarioSpecificationWithCandidate(
      specificationId: SpecificationId = new SpecificationId(v4()),
    ) {
      return new ScenarioSpecification(v4(), undefined, specificationId);
    },
    ThenNoLongerACandidateIsRaised(result: ActivateResult) {
      expect.assertions(1);
      if (isLeft(result)) {
        expect(result.left).toEqual(specificationIsNoLongerACandidate);
      }
    },
    ThenSpecificationIsActivated(
      scenarioSpecification: ScenarioSpecification,
      result: ActivateResult,
    ) {
      if (!isLeft(result)) {
        expect(result.right).toEqual(void 0);
        expect(scenarioSpecification.getUncommittedEvents()).toEqual([
          new SpecificationActivated(
            scenarioSpecification.currentActiveSpecification!,
          ),
        ]);
      } else {
        expect(result.left).toBeUndefined();
      }
    },
    ThenCandidateSpecificationIsRemoved(
      scenarioSpecification: ScenarioSpecification,
    ) {
      expect(
        scenarioSpecification.currentCandidateSpecification,
      ).toBeUndefined();
    },
    WhenCandidateSpecificationIsAssigned(
      scenarioSpecification: ScenarioSpecification,
    ) {
      const specification = new SpecificationId(v4());
      scenarioSpecification.assignCandidateSpecification(specification);
      return specification;
    },
    ThenCandidateSpecificationChanges(
      scenarioSpecification: ScenarioSpecification,
      specification: SpecificationId,
    ) {
      expect(scenarioSpecification.getUncommittedEvents()).toEqual([
        new CandidateSpecificationChanged(specification),
      ]);
      expect(scenarioSpecification.currentCandidateSpecification).toEqual(
        specification,
      );
    },
  };
};
