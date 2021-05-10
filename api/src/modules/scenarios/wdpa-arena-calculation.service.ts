import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { Scenario } from './scenario.api.entity';

type InputChange = CreateScenarioDTO | UpdateScenarioDTO;

@Injectable()
export class WdpaArenaCalculationService {
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
    'wdpaIucnCategories',
    'protectedAreaFilterByIds',
    'wdpaThreshold',
  ];

  /**
   * 2º IF (x) has a value
   * - wdpaIUCNCategories
   * - customProtectedAreasIds
   * - wdpaThershold
   *
   * we do trigger the next job
   * @private
   */
  shouldTrigger(scenario: Scenario, changeSet: InputChange): boolean {
    // verify if any of the "wanted" value was provided/changed
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
