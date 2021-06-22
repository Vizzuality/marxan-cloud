import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShapefilesModule } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.module';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaController } from './planning-area.controller';
import { PlanningArea } from './planning-area.geo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanningArea]), ShapefilesModule],
  providers: [PlanningAreaService],
  controllers: [PlanningAreaController],
})
export class PlanningAreaModule {}
