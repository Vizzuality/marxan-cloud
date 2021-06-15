import { Module } from '@nestjs/common';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaController } from './planning-area.controller';

@Module({
  providers: [PlanningAreaService],
  controllers: [PlanningAreaController],
})
export class PlanningAreaModule {}
