import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeormFeatureAmountsPerPlanningUnitRepository } from './repository/typeorm-feature-amounts-per-planning-unit.repository';
import { FeatureAmountsPerPlanningUnitEntity } from './feature-amounts-per-planning-unit.geo.entity';
import {
  geoEntityManagerToken,
  FeatureAmountsPerPlanningUnitService,
} from './feature-amounts-per-planning-units.service';
import { FeatureAmountsPerPlanningUnitRepository } from './repository/feature-amounts-per-planning-unit.repository';

@Module({})
export class FeatureAmountsPerPlanningUnitModule {
  static for(geoConnectionName: string): DynamicModule {
    return {
      module: FeatureAmountsPerPlanningUnitModule,
      imports: [
        TypeOrmModule.forFeature(
          [FeatureAmountsPerPlanningUnitEntity],
          geoConnectionName,
        ),
      ],
      providers: [
        {
          provide: geoEntityManagerToken,
          useExisting: getEntityManagerToken(geoConnectionName),
        },
        FeatureAmountsPerPlanningUnitService,
        {
          provide: FeatureAmountsPerPlanningUnitRepository,
          useClass: TypeormFeatureAmountsPerPlanningUnitRepository,
        },
      ],
      exports: [
        FeatureAmountsPerPlanningUnitService,
        FeatureAmountsPerPlanningUnitRepository,
      ],
    };
  }
}
