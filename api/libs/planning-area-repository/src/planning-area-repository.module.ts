import { DynamicModule, Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlanningArea } from './planning-area.geo.entity';
import {
  CustomPlanningAreaRepository,
  planningAreasRepositoryToken,
} from './custom-planning-area.repository';

@Module({})
export class PlanningAreaRepositoryModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: PlanningAreaRepositoryModule,
      imports: [TypeOrmModule.forFeature([PlanningArea], connectionName)],
      providers: [
        {
          provide: planningAreasRepositoryToken,
          useExisting: getRepositoryToken(PlanningArea, connectionName),
        },
        CustomPlanningAreaRepository,
      ],
      exports: [CustomPlanningAreaRepository],
    };
  }
}
