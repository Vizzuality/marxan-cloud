import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenarioPlanningUnitsProtectedStatusCalculatorService } from '@marxan/scenarios-planning-unit';

import { SelectionGetService } from '../selection-get.service';

import { SelectionUpdateService } from './selection-update.service';
import { SelectionChangedSaga } from './selection-changed.saga';
import { UpdatePlanningUnitsHandler } from './update-planning-units.handler';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Scenario])],
  providers: [
    ScenarioPlanningUnitsProtectedStatusCalculatorService,
    SelectionUpdateService,
    UpdatePlanningUnitsHandler,
    SelectionChangedSaga,
    SelectionGetService,
  ],
  exports: [SelectionUpdateService],
})
export class SelectionChangeModule {}
