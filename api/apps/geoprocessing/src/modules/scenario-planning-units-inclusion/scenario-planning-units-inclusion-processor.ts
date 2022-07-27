import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MultiPolygon, Polygon } from 'geojson';
import { difference, flatMap, intersection } from 'lodash';
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

  /**
   * Process specifications for initial inclusion and exclusion of planning
   * units.
   *
   * Given that there are two distinct ways to express inclusion/exclusion
   * claims (by id or by GeoJSON), and that API clients may not know which ids
   * would be covered by a GeoJSON geometry they send (calculation of GeoJSON to
   * ids is done here), handling overlapping claims for the same planning units
   * may not be trivial.
   *
   * Hence, the logic implemented here is:
   * - calculate ids from GeoJSON, for both inclusions and exclusions
   * - subtract ids of PUs excluded by GeoJSON from the ids of PUs *included* by
   *   id
   * - subtract ids of PUs included by GeoJSON from the ids of PUs *excluded* by
   *   id
   * - calculate the union of inclusions by id and GeoJSON, and that of
   *   exclusions by id and GeoJSON
   * - if claims for inclusions and exclusions have any overlaps, throw an error
   * - otherwise, apply the resulting claims
   *
   * TL;DR claims by GeoJSON always "win" over claims by id when overlapping,
   */
  async process(job: Job<JobInput, true>): Promise<true> {
    const scenarioId = job.data.scenarioId;
    const includeGeo = job.data.include?.geo;
    const excludeGeo = job.data.exclude?.geo;

    const puIdsToInclude: string[] = [];
    const puIdsToExclude: string[] = [];

    const puIdsToIncludeFromGeo: string[] = [];
    if (includeGeo) {
      const targetGeometries = flatMap(
        includeGeo,
        (collection) => collection.features,
      ).map((feature) => feature.geometry);

      puIdsToIncludeFromGeo.push(
        ...(
          await this.getPlanningUnitsIntersectingGeometriesFor(
            scenarioId,
            targetGeometries,
          )
        ).map(({ spd_id: id }) => id),
      );
    }

    const puIdsToExcludeFromGeo: string[] = [];
    if (excludeGeo) {
      const targetGeometries = flatMap(
        excludeGeo,
        (collection) => collection.features,
      ).map((feature) => feature.geometry);
      puIdsToExcludeFromGeo.push(
        ...(
          await this.getPlanningUnitsIntersectingGeometriesFor(
            scenarioId,
            targetGeometries,
          )
        ).map(({ spd_id: id }) => id),
      );
    }

    const puIdsToIncludeFromIds = job.data.include?.pu ?? [];
    const puIdsToExcludeFromIds = job.data.exclude?.pu ?? [];

    // If there are overlaps between opposing claims byId and byGeoJSON, ignore the claims byId
    const puIdsToIncludeFromIdsLessIdsToExcludeFromGeo = difference(
      puIdsToIncludeFromIds,
      puIdsToExcludeFromGeo,
    );
    const puIdsToExcludeFromIdsLessIdsToIncludeFromGeo = difference(
      puIdsToExcludeFromIds,
      puIdsToIncludeFromGeo,
    );

    // Union of claims byId and byGeoJSON, for inclusions and for exclusions
    puIdsToInclude.push(
      ...[
        ...puIdsToIncludeFromIdsLessIdsToExcludeFromGeo,
        ...puIdsToIncludeFromGeo,
      ],
    );
    puIdsToExclude.push(
      ...[
        ...puIdsToExcludeFromIdsLessIdsToIncludeFromGeo,
        ...puIdsToExcludeFromGeo,
      ],
    );
    const uniquePuIdsToInclude = new Set(puIdsToInclude);
    const uniquePuIdsToExclude = new Set(puIdsToExclude);

    const doInclusionAndExclusionIntersect =
      intersection([...uniquePuIdsToInclude], [...uniquePuIdsToExclude])
        .length > 0;

    if (doInclusionAndExclusionIntersect) {
      throw new Error(
        'Contrasting claims for inclusion and exclusion have been made for some of the planning units: please check your selections.',
      );
    }

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        protectedByDefault: false,
      },
      {
        lockStatus: LockStatus.Unstated,
        setByUser: false,
      },
    );

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        protectedByDefault: true,
      },
      {
        lockStatus: LockStatus.LockedIn,
        setByUser: false,
      },
    );

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        id: In([...uniquePuIdsToInclude]),
      },
      {
        lockStatus: LockStatus.LockedIn,
        setByUser: true,
      },
    );

    await this.scenarioPlanningUnitsRepo.update(
      {
        scenarioId,
        id: In([...uniquePuIdsToExclude]),
      },
      {
        lockStatus: LockStatus.LockedOut,
        setByUser: true,
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
      .select(['spd.scenario_id', 'ppu.geom_id', 'spd.id'])
      .leftJoin(`projects_pu`, `ppu`, `ppu.id = spd.project_pu_id`)
      .leftJoin(`planning_units_geom`, `pug`, `pug.id = ppu.geom_id`)
      .where(`spd.scenario_id = :scenarioId`, { scenarioId })
      .andWhere(
        `st_intersects(st_union(ARRAY[${geometriesUnion}]), pug.the_geom)`,
        geometriesParameters,
      );

    return await queryBuilder.getRawMany();
  }
}
