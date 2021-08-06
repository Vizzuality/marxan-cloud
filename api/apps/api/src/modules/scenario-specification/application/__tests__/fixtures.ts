import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';

import { SpecificationId } from '../../specification.id';
import { ScenarioSpecification } from '../../scenario-specification';
import { CandidateSpecificationChanged } from '../../events/candidate-specification-changed.event';

import { AssignCandidateSpecificationHandler } from '../assign-candidate-specification.handler';
import { ScenarioSpecificationRepo } from '../scenario-specification.repo';
import { AssignCandidateSpecification } from '../../command/assign-candidate-specification.command';

export const getFixtures = async () => {
  const scenarioId = v4();
  const previousCandidateSpecificationId = new SpecificationId(v4());
  const nextCandidateSpecificationId = new SpecificationId(v4());
  const events: IEvent[] = [];

  const sandbox = await (
    await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        AssignCandidateSpecificationHandler,
        {
          provide: ScenarioSpecificationRepo,
          useClass: InMemoryScenarioSpecificationRepo,
        },
      ],
    }).compile()
  ).init();

  const scenarioSpecificationRepo: InMemoryScenarioSpecificationRepo = sandbox.get(
    ScenarioSpecificationRepo,
  );
  const sut = sandbox.get(AssignCandidateSpecificationHandler);
  const systemEvents = sandbox.get(EventBus);

  systemEvents.subscribe((event) => events.push(event));

  return {
    GivenScenarioSpecificationWithNoCandidateWasCreated: () => {
      scenarioSpecificationRepo.save(
        new ScenarioSpecification(
          scenarioId,
          undefined,
          previousCandidateSpecificationId,
        ),
      );
    },
    WhenAssigningNewCandidateSpecification: async () => {
      await sut.execute(
        new AssignCandidateSpecification(
          scenarioId,
          nextCandidateSpecificationId.value,
        ),
      );
    },
    ThenScenarioSpecificationIsSaved: async () => {
      const currentScenarioSpecification = await scenarioSpecificationRepo.findOrCreate(
        scenarioId,
      );
      expect(
        currentScenarioSpecification.currentCandidateSpecification,
      ).toEqual(nextCandidateSpecificationId);
    },
    ThenCandidateSpecificationChanged: () => {
      expect(events).toEqual([
        new CandidateSpecificationChanged(nextCandidateSpecificationId),
      ]);
    },
  };
};

class InMemoryScenarioSpecificationRepo implements ScenarioSpecificationRepo {
  #memory: Record<string, ScenarioSpecification> = {};

  async findOrCreate(scenarioId: string): Promise<ScenarioSpecification> {
    this.#memory[scenarioId] ??= new ScenarioSpecification(scenarioId);
    return this.#memory[scenarioId];
  }

  async save(scenarioSpecification: ScenarioSpecification): Promise<void> {
    this.#memory[scenarioSpecification.scenarioId] = scenarioSpecification;
  }
}
