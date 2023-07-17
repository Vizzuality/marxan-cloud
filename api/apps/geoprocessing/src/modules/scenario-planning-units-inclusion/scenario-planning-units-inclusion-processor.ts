import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
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
    const makeAvailableGeo = job.data.makeAvailable?.geo;

    const puIdsToInclude: string[] = [];
    const puIdsToExclude: string[] = [];
    const puIdsToMakeAvailable: string[] = [];

    const puIdsToIncludeFromGeo: string[] = [];
    if (includeGeo) {
      puIdsToIncludeFromGeo.push(
        ...(await this.getPuIdsFromGeo(includeGeo, scenarioId)),
      );
    }

    const puIdsToExcludeFromGeo: string[] = [];
    if (excludeGeo) {
      puIdsToExcludeFromGeo.push(
        ...(await this.getPuIdsFromGeo(excludeGeo, scenarioId)),
      );
    }

    const puIdsToMakeAvailableFromGeo: string[] = [];
    if (makeAvailableGeo) {
      puIdsToMakeAvailableFromGeo.push(
        ...(await this.getPuIdsFromGeo(makeAvailableGeo, scenarioId)),
      );
    }

    const puIdsToIncludeFromIds = job.data.include?.pu ?? [];
    const puIdsToExcludeFromIds = job.data.exclude?.pu ?? [];
    const puIdsToMakeAvailableFromIds = job.data.makeAvailable?.pu ?? [];

    const allPusInAnyClaimsFromGeoJson = [
      ...puIdsToMakeAvailableFromGeo,
      ...puIdsToIncludeFromGeo,
      ...puIdsToExcludeFromGeo,
    ];

    const puIdsToIncludeFromIdsNotPresentInAnyClaimsFromGeo = difference(
      puIdsToIncludeFromIds,
      allPusInAnyClaimsFromGeoJson,
    );
    const puIdsToExcludeFromIdsNotPresentInAnyClaimsFromGeo = difference(
      puIdsToExcludeFromIds,
      allPusInAnyClaimsFromGeoJson,
    );
    const puIdsToMakeAvailableFromIdsNotPresentInAnyClaimsFromGeo = difference(
      puIdsToMakeAvailableFromIds,
      allPusInAnyClaimsFromGeoJson,
    );

    // Union of claims byId and byGeoJSON, for inclusions and for exclusions
    puIdsToInclude.push(
      ...[
        ...puIdsToIncludeFromIdsNotPresentInAnyClaimsFromGeo,
        ...puIdsToIncludeFromGeo,
      ],
    );
    puIdsToExclude.push(
      ...[
        ...puIdsToExcludeFromIdsNotPresentInAnyClaimsFromGeo,
        ...puIdsToExcludeFromGeo,
      ],
    );

    puIdsToMakeAvailable.push(
      ...[
        ...puIdsToMakeAvailableFromIdsNotPresentInAnyClaimsFromGeo,
        ...puIdsToMakeAvailableFromGeo,
      ],
    );
    const uniquePuIdsToInclude = new Set(puIdsToInclude);
    const uniquePuIdsToExclude = new Set(puIdsToExclude);
    const uniquePuIdsToMakeAvailable = new Set(puIdsToMakeAvailable);

    if (
      this.doClaimsIntersect(
        [...uniquePuIdsToInclude],
        [...uniquePuIdsToExclude],
        [...uniquePuIdsToMakeAvailable],
      )
    ) {
      throw new Error(
        'Contrasting claims to include, exclude or make available some of the planning units have been made: please check your selections.',
      );
    }

    await this.scenarioPlanningUnitsRepo.manager.transaction(
      async (transactionalEntityManager) => {
        await this.applyClaims(
          transactionalEntityManager,
          scenarioId,
          uniquePuIdsToInclude,
          uniquePuIdsToExclude,
          uniquePuIdsToMakeAvailable,
        );
      },
    );

    return true;
  }

  private doClaimsIntersect(
    puIdsToInclude: string[],
    puIdsToExclude: string[],
    puIdsToMakeAvailable: string[],
  ): boolean {
    const allClaims = [
      ...puIdsToInclude,
      ...puIdsToExclude,
      ...puIdsToMakeAvailable,
    ];
    const duplicateElements = allClaims.filter((element, index) => {
      return allClaims.indexOf(element) !== index;
    });
    return duplicateElements.length > 0;
  }

  async getPuIdsFromGeo(
    geo: FeatureCollection<Polygon | MultiPolygon>[],
    scenarioId: string,
  ) {
    const targetGeometries = flatMap(
      geo,
      (collection) => collection.features,
    ).map((feature) => feature.geometry);
    return (
      await this.getPlanningUnitsIntersectingGeometriesFor(
        scenarioId,
        targetGeometries,
      )
    ).map(({ spd_id: id }) => id);
  }
  private async applyClaims(
    transactionalEntityManager: EntityManager,
    scenarioId: string,
    uniquePuIdsToInclude: Set<string>,
    uniquePuIdsToExclude: Set<string>,
    uniquePuIdsToMakeAvailable: Set<string>,
  ): Promise<void> {
    await transactionalEntityManager.update(
      ScenariosPlanningUnitGeoEntity,
      {
        scenarioId,
        protectedByDefault: false,
      },
      {
        lockStatus: LockStatus.Available,
        setByUser: false,
      },
    );

    await transactionalEntityManager.update(
      ScenariosPlanningUnitGeoEntity,
      {
        scenarioId,
        protectedByDefault: true,
      },
      {
        lockStatus: LockStatus.LockedIn,
        setByUser: false,
      },
    );

    await transactionalEntityManager.update(
      ScenariosPlanningUnitGeoEntity,
      {
        scenarioId,
        id: In([...uniquePuIdsToInclude]),
      },
      {
        lockStatus: LockStatus.LockedIn,
        setByUser: true,
      },
    );

    await transactionalEntityManager.update(
      ScenariosPlanningUnitGeoEntity,
      {
        scenarioId,
        id: In([...uniquePuIdsToExclude]),
      },
      {
        lockStatus: LockStatus.LockedOut,
        setByUser: true,
      },
    );

    await transactionalEntityManager.update(
      ScenariosPlanningUnitGeoEntity,
      {
        scenarioId,
        id: In([...uniquePuIdsToMakeAvailable]),
      },
      {
        lockStatus: LockStatus.Available,
        setByUser: true,
      },
    );
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
