import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlanningArea } from './planning-area.geo.entity';
import {
  CustomPlanningAreaRepository,
  geoEntityManagerToken,
} from './custom-planning-area.repository';

@Module({})
export class PlanningAreaRepositoryModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: PlanningAreaRepositoryModule,
      imports: [TypeOrmModule.forFeature([PlanningArea], connectionName)],
      providers: [
        {
          provide: geoEntityManagerToken,
          useExisting: getEntityManagerToken(connectionName),
        },
        CustomPlanningAreaRepository,
      ],
      exports: [CustomPlanningAreaRepository],
    };
  }
}
