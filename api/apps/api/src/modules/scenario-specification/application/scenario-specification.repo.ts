import { ScenarioSpecification } from '../scenario-specification';

export abstract class ScenarioSpecificationRepo {
  abstract findOrCreate(scenarioId: string): Promise<ScenarioSpecification>;

  abstract save(scenarioSpecification: ScenarioSpecification): Promise<void>;
}
