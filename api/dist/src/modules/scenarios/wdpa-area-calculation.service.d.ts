import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { Scenario } from './scenario.api.entity';
declare type InputChange = CreateScenarioDTO | UpdateScenarioDTO;
export declare class WdpaAreaCalculationService {
    private readonly watchedChangeProperties;
    private readonly requiredToTriggerChange;
    shouldTrigger(scenario: Scenario, changeSet: InputChange): boolean;
    private intendsToChangeWatchedProperty;
    private areRequiredFieldsAvailable;
}
export {};
