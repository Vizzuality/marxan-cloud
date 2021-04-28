import { Injectable } from '@nestjs/common';
import { ScenarioFeatureDto } from './scenario-feature.dto';
import { plainToClass } from 'class-transformer';

/**
 * Solely purpose of this facade is to provide a clear interface for consumers (controllers)
 * Could take a role of a coordinator of getting required data from different places as well
 */
@Injectable()
export class ScenarioFeatureFacade {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async forScenario(scenarioId: string): Promise<ScenarioFeatureDto[]> {
    // independent from Scenarios themselves; could fetch scenario data from ScenariosModule if necessary; requires to move controller out of ScenariosModule
    // to-be-clarified - from where do we get data?
    return plainToClass<ScenarioFeatureDto, ScenarioFeatureDto>(
      ScenarioFeatureDto,
      [
        {
          id: `fake-feature-id`,
          name: `fake-feature-name`,
          met: 0.47,
          metArea: 5000,
          target: 0.67,
          targetArea: 8000,
          fpf: 1,
          onTarget: false,
          tag: `tag`,
        },
      ],
    );
  }
}
