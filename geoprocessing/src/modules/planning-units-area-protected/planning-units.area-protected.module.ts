import { Module } from '@nestjs/common';

import { CalculatePlanningUnitAreaProtectedProcessor } from './planning-units.area-protected.worker';

/**
 * @todo: this needs to be imported at application level
 */
@Module({
  providers: [CalculatePlanningUnitAreaProtectedProcessor],
  exports: [CalculatePlanningUnitAreaProtectedProcessor],
})
export class PlanningUnitsModule {}
