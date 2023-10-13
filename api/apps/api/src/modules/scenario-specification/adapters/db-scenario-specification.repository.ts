import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

import { ScenarioSpecificationRepo } from '../application/scenario-specification.repo';
import { ScenarioSpecification, SpecificationId } from '../domain';

@Injectable()
export class DbScenarioSpecificationRepository
  implements ScenarioSpecificationRepo
{
  constructor(
    @InjectRepository(Scenario)
    private readonly scenariosRepo: Repository<Scenario>,
  ) {}

  async find(scenarioId: string): Promise<ScenarioSpecification | undefined> {
    const scenario = await this.scenariosRepo.findOne({
      where: {
        id: scenarioId,
      },
    });
    if (
      scenario &&
      (scenario.activeSpecificationId || scenario.candidateSpecificationId)
    ) {
      return new ScenarioSpecification(
        scenarioId,
        scenario.activeSpecificationId
          ? new SpecificationId(scenario.activeSpecificationId)
          : undefined,
        scenario.candidateSpecificationId
          ? new SpecificationId(scenario.candidateSpecificationId)
          : undefined,
      );
    }
    return;
  }

  async findOrCreate(scenarioId: string): Promise<ScenarioSpecification> {
    const existing = await this.find(scenarioId);

    if (!existing) {
      return new ScenarioSpecification(scenarioId);
    }
    return existing;
  }

  async save(scenarioSpecification: ScenarioSpecification): Promise<void> {
    await this.scenariosRepo.update(
      {
        id: scenarioSpecification.scenarioId,
      },
      {
        activeSpecificationId:
          scenarioSpecification.currentActiveSpecification?.value,
        candidateSpecificationId:
          scenarioSpecification.currentCandidateSpecification?.value,
      },
    );
  }
}
