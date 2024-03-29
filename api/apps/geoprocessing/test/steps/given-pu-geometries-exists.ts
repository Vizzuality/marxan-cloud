import { EntityManager } from 'typeorm';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit/planning-unit-grid-shape';
import { address } from 'faker';

export const GivenPuGeometriesExists = async (
  entityManager: EntityManager,
  shape: PlanningUnitGridShape,
): Promise<PlanningUnitsGeom[]> => {
  const result: PlanningUnitsGeom[] = await entityManager.query(
    `
      INSERT INTO planning_units_geom(type, the_geom)
      VALUES
        ($1, ST_GeomFromText('POINT(1 1)',4326)),
        ($1, ST_GeomFromText('POINT(2 2)',4326)),
        ($1, ST_GeomFromText('POINT(3 3)',4326))
      ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $1
      RETURNING *
  `,
    [shape],
  );

  return result;
};

export const GivenPuSquareGridGeometryExists = async (
  entityManager: EntityManager,
  size: number,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  shape: PlanningUnitGridShape,
): Promise<PlanningUnitsGeom[]> => {
  const result: PlanningUnitsGeom[] = await entityManager.query(
    `INSERT INTO planning_units_geom (type, the_geom)
      SELECT $1 as type, grid.geom as the_geom
      FROM ( select geom from ST_SquareGrid( $2, ST_MakeEnvelope( $3, $4, $5, $6, 4326 ) ) ) grid
      ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $1
      RETURNING *`,
    [shape, size, xMin, yMin, xMax, yMax],
  );

  return result;
};

export const GivenPuGeometryExists = async (
  entityManager: EntityManager,
  shape: PlanningUnitGridShape,
  count = 100,
): Promise<PlanningUnitsGeom[]> => {
  const values = [...Array(count).keys()].map(() => {
    const lat = address.latitude();
    const lon = address.longitude();

    return `($1, ST_GeomFromText('POINT(${lon} ${lat})',4326))`;
  });

  const result: PlanningUnitsGeom[] = await entityManager.query(
    `
      INSERT INTO planning_units_geom(type, the_geom)
      VALUES ${values.join(',')}
      ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $1
      RETURNING *
  `,
    [shape],
  );

  return result;
};
