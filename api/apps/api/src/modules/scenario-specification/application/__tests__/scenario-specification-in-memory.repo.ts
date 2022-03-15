import { ScenarioSpecificationRepo } from '../scenario-specification.repo';
import { ScenarioSpecification } from '../../domain';

export class InMemoryScenarioSpecificationRepo
  implements ScenarioSpecificationRepo
{
  #memory: Record<string, ScenarioSpecification> = {};

  async findOrCreate(scenarioId: string): Promise<ScenarioSpecification> {
    this.#memory[scenarioId] ??= new ScenarioSpecification(scenarioId);
    return this.#memory[scenarioId];
  }

  async save(scenarioSpecification: ScenarioSpecification): Promise<void> {
    this.#memory[scenarioSpecification.scenarioId] = scenarioSpecification;
  }

  async find(scenarioId: string): Promise<ScenarioSpecification | undefined> {
    return this.#memory[scenarioId];
  }
}
