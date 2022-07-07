import { BlmPartialResultEntity } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.geo.entity';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CleanupTasks } from './cleanup-tasks';

@Injectable()
export class CleanupTasksService implements CleanupTasks {
  constructor(
    private readonly logger = new Logger(CleanupTasksService.name),
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeaturesDataRepo: Repository<ScenarioFeaturesData>,
    @InjectRepository(BlmFinalResultEntity)
    private readonly blmFinalResultRepo: Repository<BlmFinalResultEntity>,
    @InjectRepository(BlmPartialResultEntity)
    private readonly blmPartialResultRepo: Repository<BlmPartialResultEntity>,
    @InjectRepository(MarxanExecutionMetadataGeoEntity)
    private readonly marxanExecutionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity>,
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity>,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectRepository(PlanningArea)
    private readonly planningAreasRepo: Repository<PlanningArea>,
    @InjectRepository(ProtectedArea)
    private readonly protectedAreasRepo: Repository<ProtectedArea>,
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresDataRepo: Repository<GeoFeatureGeometry>,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectsPuRepo: Repository<ProjectsPuEntity>,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug(
      'Preparing to clean dangling geo data for projects/scenarios',
    );
  }
}
