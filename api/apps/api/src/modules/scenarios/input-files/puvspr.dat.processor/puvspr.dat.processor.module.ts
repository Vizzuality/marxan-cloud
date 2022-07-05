import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { ScenarioSpecificationAdaptersModule } from '@marxan-api/modules/scenario-specification/adapters/scenario-specification-adapters.module';
import { SpecificationAdaptersModule } from '@marxan-api/modules/specification/adapters/specification-adapters.module';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenarioFeaturesData } from '@marxan/features';
import { FeatureHashModule } from '@marxan/features-hash';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { PuvsprCalculationsModule } from '@marxan/puvspr-calculations';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../../scenario.api.entity';
import { GeoFeatureDtoMapper } from '../../specification/geo-feature-dto.mapper';
import { SplitFeatureConfigMapper } from '../../specification/split-feature-config.mapper';
import { PuvrsprDatFactory } from './puvspr.dat.factory';
import { PuvsprDatLegacyProject } from './puvspr.dat.legacy-project';
import { PuvsprDatMarxanProject } from './puvspr.dat.marxan-project';
import { PuvsprDatProcessor } from './puvspr.dat.processor';

@Module({
  imports: [
    PuvsprCalculationsModule.for(DbConnections.geoprocessingDB),
    FeatureHashModule.for(),
    TypeOrmModule.forFeature([Scenario, GeoFeature]),
    TypeOrmModule.forFeature(
      [ScenarioFeaturesData, GeoFeatureGeometry],
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
