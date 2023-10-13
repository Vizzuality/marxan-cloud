import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';

import {
  SpecificationId,
  ScenarioSpecification,
  CandidateSpecificationChanged,
} from '../../domain';

import { AssignCandidateSpecificationHandler } from '../assign-candidate-specification.handler';
import { ScenarioSpecificationRepo } from '../scenario-specification.repo';
import { AssignCandidateSpecification } from '../assign-candidate-specification.command';

import { InMemoryScenarioSpecificationRepo } from './scenario-specification-in-memory.repo';

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

  const scenarioSpecificationRepo: InMemoryScenarioSpecificationRepo =
    sandbox.get(ScenarioSpecificationRepo);
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
      const currentScenarioSpecification =
        await scenarioSpecificationRepo.findOrCreate(scenarioId);
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
