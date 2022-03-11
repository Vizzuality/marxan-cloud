import { DeepPartial, EntityManager } from 'typeorm';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit/planning-unit-grid-shape';
import {
  GivenPuGeometriesExists,
  GivenPuGeometryExists,
} from './given-pu-geometries-exists';

export const GivenProjectsPuExists = async (
  entityManager: EntityManager,
  projectId: string,
): Promise<ProjectsPuEntity[]> => {
  const geomType = PlanningUnitGridShape.FromShapefile;
  const [first, second, third] = await GivenPuGeometriesExists(
    entityManager,
    geomType,
  );

  const pus: Partial<ProjectsPuEntity>[] = [
    {
      projectId,
      puid: 1,
      geomId: first.id,
      geomType,
    },
    {
      projectId,
      puid: 2,
      geomId: second.id,
      geomType,
    },
    {
      projectId,
      puid: 3,
      geomId: third.id,
      geomType,
    },
  ];

  return (await entityManager.save(
    ProjectsPuEntity,
    pus,
  )) as ProjectsPuEntity[];
};

export const GivenProjectsPu = async (
  entityManager: EntityManager,
  projectId: string,
  count = 100,
  geomType: PlanningUnitGridShape = PlanningUnitGridShape.Square,
): Promise<ProjectsPuEntity[]> => {
  const geometries = await GivenPuGeometryExists(
    entityManager,
    geomType,
    count,
  );

  const scenarioPuData: DeepPartial<ProjectsPuEntity>[] = geometries.map(
    (geom, index) => ({
      projectId,
      puid: index + 1,
      geomId: geom.id,
      geomType,
    }),
  );

  const rows = await entityManager.save(ProjectsPuEntity, scenarioPuData);
  return rows as ProjectsPuEntity[];
};
