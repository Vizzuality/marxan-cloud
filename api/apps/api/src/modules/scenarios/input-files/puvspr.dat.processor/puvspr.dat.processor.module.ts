import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { ScenarioSpecificationAdaptersModule } from '@marxan-api/modules/scenario-specification/adapters/scenario-specification-adapters.module';
import { SpecificationAdaptersModule } from '@marxan-api/modules/specification/adapters/specification-adapters.module';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { FeatureAmountsPerPlanningUnitModule } from '@marxan/feature-amounts-per-planning-unit';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../../scenario.api.entity';
import { GeoFeatureDtoMapper } from '../../specification/geo-feature-dto.mapper';
import { SplitFeatureConfigMapper } from '../../specification/split-feature-config.mapper';
import { PuvrsprDatFactory } from './puvspr.dat.factory';
import { PuvsprDatLegacyProject } from './puvspr.dat.legacy-project';
import { PuvsprDatMarxanProject } from './puvspr.dat.marxan-project';
import { PuvsprDatProcessor } from './puvspr.dat.processor';
import { FeatureHashModule } from '@marxan-api/modules/features-hash/features-hash.module';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';

@Module({
  imports: [
    FeatureAmountsPerPlanningUnitModule.for(DbConnections.geoprocessingDB),
    FeatureHashModule,
    TypeOrmModule.forFeature([Scenario, GeoFeature]),
    TypeOrmModule.forFeature(
      [ScenarioFeaturesData, GeoFeatureGeometry, ProjectsPuEntity],
      DbConnections.geoprocessingDB,
    ),
    ScenarioSpecificationAdaptersModule,
    SpecificationAdaptersModule,
  ],
  providers: [
    GeoFeatureDtoMapper,
    PuvsprDatProcessor,
    PuvrsprDatFactory,
    PuvsprDatMarxanProject,
    PuvsprDatLegacyProject,
    SplitFeatureConfigMapper,
  ],
  exports: [PuvsprDatProcessor],
})
export class PuvsprDatProcessorModule {}
