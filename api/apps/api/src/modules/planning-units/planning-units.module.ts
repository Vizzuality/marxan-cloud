import { Module } from '@nestjs/common';
import { ProxyService } from 'modules/proxy/proxy.service';
import { PlanningUnitsController } from './planning-units.controller';
import { PlanningUnitsService } from './planning-units.service';

@Module({
  providers: [PlanningUnitsService, ProxyService],
  exports: [PlanningUnitsService],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
