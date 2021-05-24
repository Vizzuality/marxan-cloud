import { Module } from '@nestjs/common';

import { AttachPlanningUnitGridToScenarioProcessor } from './scenario-planning-units.worker';

/**
 * @todo: this needs to be imported at application level
 */
@Module({
  providers: [AttachPlanningUnitGridToScenarioProcessor],
  exports: [AttachPlanningUnitGridToScenarioProcessor],
})
export class AttachPlanningUnitGridToScenarioModule {}
