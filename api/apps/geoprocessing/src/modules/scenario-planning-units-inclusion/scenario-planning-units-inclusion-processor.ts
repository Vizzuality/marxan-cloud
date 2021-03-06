import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MultiPolygon, Polygon } from 'geojson';
import { flatMap } from 'lodash';
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
      const targetGeometries = flatMap(
        includeGeo,
        (collection) => collection.features,
      ).map((feature) => feature.geometry);

      geometriesIdsToInclude.push(
        ...(
          await this.getPlanningUnitsIntersectingGeometriesFor(
            scenarioId,
            targetGeometries,
          )
        ).map(({ pu_geom_id }) => pu_geom_id),
      );
    }

    if (excludeGeo) {
      const targetGeometries = flatMap(
        excludeGeo,
        (collection) => collection.features,
      ).map((feature) => feature.geometry);
      geometriesIdsToExclude.push(
        ...(
          await this.getPlanningUnitsIntersectingGeometriesFor(
            scenarioId,
            targetGeometries,
          )
        ).map(({ pu_geom_id }) => pu_geom_id),
      );
    }

    if (!includeGeo && !excludeGeo) {
      geometriesIdsToInclude.push(...(job.data.include?.pu ?? []));
      geometriesIdsToExclude.push(...(job.data.exclude?.pu ?? []));
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

  private async getPlanningUnitsIntersectingGeometriesFor(
    scenarioId: string,
    geometries: (Polygon | MultiPolygon)[],
  ): Promise<Array<{ pu_geom_id: string }>> {
    /**
     * {
     *   geom1 = '<GeoJson>>',
     *   ...
     * }
     */
    const geometriesParameters = geometries.reduce<Record<string, string>>(
      (previousValue, currentValue, index) => {
        previousValue[`geom${index}`] = JSON.stringify(currentValue);
        return previousValue;
      },
      {},
    );
    const geometriesUnion = geometries
      .map((_, index) => `ST_GeomFromGeoJSON(:geom${index})`)
      .join(',');

    const queryBuilder = this.scenarioPlanningUnitsRepo
      .createQueryBuilder(`spd`)
      .select(['spd.scenario_id', 'spd.pu_geom_id', 'spd.id'])
      .leftJoin(`planning_units_geom`, `pug`, `pug.id = spd.pu_geom_id`)
      .where(`spd.scenario_id = :scenarioId`, { scenarioId })
      .andWhere(
        `st_intersects(st_union(${geometriesUnion}), pug.the_geom)`,
        geometriesParameters,
      );

    return await queryBuilder.getRawMany();
  }
}
