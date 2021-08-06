import { ScenarioSpecification } from '../domain';

export abstract class ScenarioSpecificationRepo {
  abstract find(scenarioId: string): Promise<ScenarioSpecification | undefined>;

  abstract findOrCreate(scenarioId: string): Promise<ScenarioSpecification>;

  abstract save(scenarioSpecification: ScenarioSpecification): Promise<void>;
}
