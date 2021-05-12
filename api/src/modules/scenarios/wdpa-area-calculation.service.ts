import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { Scenario } from './scenario.api.entity';

type InputChange = CreateScenarioDTO | UpdateScenarioDTO;

@Injectable()
export class WdpaAreaCalculationService {
  /**
   * if one of those is located within Input Change
   */
  private readonly watchedChangeProperties: (keyof InputChange)[] = [
    'customProtectedAreaIds',
    'wdpaIucnCategories',
    'wdpaThreshold',
  ];

  /**
   * and new entity state consists (i.e. are present) of all of the below
   */
  private readonly requiredToTriggerChange: (keyof Scenario)[] = [
    'wdpaThreshold',
  ];

  /**
   * Every post update that affects this 3 elements (when threshold is not null)
   */
  shouldTrigger(scenario: Scenario, changeSet: InputChange): boolean {
    if (!this.intendsToChangeWatchedProperty(changeSet)) {
      return false;
    }

    return this.areRequiredFieldsAvailable(scenario);
  }

  private intendsToChangeWatchedProperty(changeSet: InputChange): boolean {
    return Object.entries(pick(changeSet, this.watchedChangeProperties)).some(
      ([, value]) => value,
    );
  }

  private areRequiredFieldsAvailable(scenario: Scenario): boolean {
    return Object.entries(pick(scenario, this.requiredToTriggerChange)).every(
      ([, value]) => value,
    );
  }
}
