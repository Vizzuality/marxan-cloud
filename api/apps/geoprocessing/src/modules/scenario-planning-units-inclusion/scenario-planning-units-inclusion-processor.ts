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

    const puIdsToInclude: string[] = [];
    const puIdsToExclude: string[] = [];

    if (includeGeo) {
      const targetGeometries = flatMap(
        includeGeo,
        (collection) => collection.features,
      ).map((feature) => feature.geometry);

      puIdsToInclude.push(
        ...(
          await this.getPlanningUnitsIntersectingGeometriesFor(
            scenarioId,
            targetGeometries,
          )
        ).map(({ spd_id: id }) => id),
      );
    }

    if (excludeGeo) {
      const targetGeometries = flatMap(
        excludeGeo,
        (collection) => collection.features,
      ).map((feature) => feature.geometry);
      puIdsToExclude.push(
        ...(
          await this.getPlanningUnitsIntersectingGeometriesFor(
            scenarioId,
            targetGeometries,
          )
        ).map(({ spd_id: id }) => id),
      );
    }

    // After setting inclusions and exclusions from geometries above, add
    // inclusions and exclusions by id, so that we effectively use the union
    // of the two methods (byId and byGeoJson).
    puIdsToInclude.push(...(job.data.include?.pu ?? []));
    puIdsToExclude.push(...(job.data.exclude?.pu ?? []));

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
        id: In(puIdsToInclude),
      },
      {
        lockStatus: LockStatus.LockedIn,
      },
    );

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        id: In(puIdsToExclude),
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
  ): Promise<Array<{ spd_id: string }>> {
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
        `st_intersects(st_union(ARRAY[${geometriesUnion}]), pug.the_geom)`,
        geometriesParameters,
      );

    return await queryBuilder.getRawMany();
  }
}
