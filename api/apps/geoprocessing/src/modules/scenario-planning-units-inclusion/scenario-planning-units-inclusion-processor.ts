import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository, WhereExpression } from 'typeorm';
import { MultiPolygon, Polygon } from 'geojson';
import { flatten } from 'lodash';
import { Job } from 'bullmq';

import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { JobInput } from '@marxan-jobs/planning-unit-geometry';
import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';

@Injectable()
export class ScenarioPlanningUnitsInclusionProcessor
  implements WorkerProcessor<JobInput, true> {
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioPlanningUnitsRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  async process(job: Job<JobInput, true>): Promise<true> {
    const scenarioId = job.data.scenarioId;
    const includeGeo = job.data.include?.geo;
    const excludeGeo = job.data.exclude?.geo;

    const geometriesIdsToInclude: string[] = [];
    const geometriesIdsToExclude: string[] = [];

    if (includeGeo) {
      const targetGeometries = flatten(
        includeGeo.map((collection) => collection.features),
      ).map((feature) => feature.geometry);
      geometriesIdsToInclude.push(
        ...(
          await this.getIntersectedGeometriesFor(scenarioId, targetGeometries)
        ).map(({ pu_geom_id }) => pu_geom_id),
      );
    }

    if (excludeGeo) {
      const targetGeometries = flatten(
        excludeGeo.map((collection) => collection.features),
      ).map((feature) => feature.geometry);
      geometriesIdsToExclude.push(
        ...(
          await this.getIntersectedGeometriesFor(scenarioId, targetGeometries)
        ).map(({ pu_geom_id }) => pu_geom_id),
      );
    }

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
      },
      {
        lockStatus: LockStatus.Unstated,
      },
    );

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        puGeometryId: In(geometriesIdsToInclude),
      },
      {
        lockStatus: LockStatus.LockedIn,
      },
    );

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        puGeometryId: In(geometriesIdsToExclude),
      },
      {
        lockStatus: LockStatus.LockedOut,
      },
    );
    return true;
  }

  private async getIntersectedGeometriesFor(
    scenarioId: string,
    geometries: (Polygon | MultiPolygon)[],
  ): Promise<Array<{ pu_geom_id: string }>> {
    const queryBuilder = this.scenarioPlanningUnitsRepo
      .createQueryBuilder(`spd`)
      .select(['spd.scenario_id', 'spd.pu_geom_id', 'spd.id'])
      .leftJoin(`planning_units_geom`, `pug`, `pug.id = spd.pu_geom_id`)
      .where(`spd.scenario_id = :scenarioId`, { scenarioId })
      .andWhere(
        new Brackets((qb) =>
          geometries.reduce<WhereExpression>(
            (queryBuilder, geom, index) =>
              qb.orWhere(
                `st_intersects(ST_GeomFromGeoJSON(:geom${index}),pug.the_geom)`,
                { [`geom${index}`]: JSON.stringify(geom) },
              ),
            qb,
          ),
        ),
      );

    return await queryBuilder.getRawMany();
  }
}
