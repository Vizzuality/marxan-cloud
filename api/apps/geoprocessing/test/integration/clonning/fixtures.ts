import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ArchiveLocation } from '@marxan/cloning/domain';
import { ScenarioFeaturesData } from '@marxan/features';
import { FileRepository } from '@marxan/files-repository';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import {
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import {
  PlanningUnitGridShape,
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import * as archiver from 'archiver';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable, Transform } from 'stream';
import { DeepPartial, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';

export type TestSpecification = {
  id: string;
  scenario_id: string;
  draft: boolean;
  raw: Record<string, any>;
};

const randomGeometriesBoundary =
  '0103000020E6100000010000000A00000000000000602630C0A12CF6C9EE913C4000000000F46430C0C6D6EE9332863C4000000000C07A30C06718E5AE99673C40000000008ADD30C0AE5F48C4D85B3C40000000006EAE30C0EF8810F1D7033C4000000000DC7C30C0B0AB582D481D3C4000000000246230C0712DA50F7E533C4000000000086030C0323EBB984F6B3C40000000009E2430C03B55C7C9C18B3C4000000000602630C0A12CF6C9EE913C40';

export async function GenerateRandomGeometries(
  em: EntityManager,
  amount: number,
  asMultipolygon = false,
) {
  const selectStatement = asMultipolygon
    ? 'ST_AsEWKB(ST_Multi(ST_ConvexHull(ST_GeneratePoints(boundary, 10))))'
    : 'ST_AsEWKB(ST_ConvexHull(ST_GeneratePoints(boundary, 10)))';

  const [result]: [Record<string, Buffer>] = await em.query(`
      SELECT ${Array(amount)
        .fill('')
        .map((_, index) => `${selectStatement} as geom_${index}`)
        .join(',')}
      FROM (
          SELECT '${randomGeometriesBoundary}' AS boundary
      ) as b
    `);

  return Object.values(result);
}

export async function PrepareZipFile(
  content: any,
  fileRepository: FileRepository,
  relativePath: string,
) {
  const archive = archiver(`zip`, {
    zlib: { level: 9 },
  });
  archive.append(
    typeof content !== 'string' ? JSON.stringify(content) : content,
    {
      name: relativePath,
    },
  );

  const saveFile = fileRepository.save(archive);
  archive.finalize();
  const uriOrError = await saveFile;

  if (isLeft(uriOrError)) throw new Error("couldn't save file");
  return new ArchiveLocation(uriOrError.right);
}

export function GivenOrganizationExists(
  em: EntityManager,
  organizationId: string,
) {
  return em
    .createQueryBuilder()
    .insert()
    .into(`organizations`)
    .values({
      id: organizationId,
      name: `test organization - ${organizationId}`,
    })
    .execute();
}

export async function GivenProjectExists(
  em: EntityManager,
  projectId: string,
  organizationId: string,
  projectData: Record<string, any> = {},
) {
  await GivenOrganizationExists(em, organizationId);

  return em
    .createQueryBuilder()
    .insert()
    .into(`projects`)
    .values({
      id: projectId,
      name: `test project - ${projectId}`,
      organization_id: organizationId,
      planning_unit_grid_shape: PlanningUnitGridShape.Square,
      ...projectData,
    })
    .execute();
}

export async function GivenScenarioExists(
  em: EntityManager,
  scenarioId: string,
  projectId: string,
  organizationId: string,
  scenarioData: Record<string, any> = {},
  projectData: Record<string, any> = {},
) {
  await GivenProjectExists(em, projectId, organizationId, projectData);

  return em
    .createQueryBuilder()
    .insert()
    .into(`scenarios`)
    .values({
      id: scenarioId,
      name: `test scenario - ${scenarioId}`,
      project_id: projectId,
      ...scenarioData,
    })
    .execute();
}

export async function DeleteProjectAndOrganization(
  em: EntityManager,
  projectId: string,
  organizationId: string,
) {
  await em
    .createQueryBuilder()
    .delete()
    .from(`projects`)
    .where(`id = :projectId`, { projectId })
    .execute();

  await em
    .createQueryBuilder()
    .delete()
    .from(`organizations`)
    .where(`id = :organizationId`, { organizationId })
    .execute();
}

export async function GivenPlanningArea(
  em: EntityManager,
  planningAreaId: string,
  projectId: string,
) {
  const [planningAreaGeom] = await GenerateRandomGeometries(em, 1, true);
  return em
    .createQueryBuilder()
    .insert()
    .into(PlanningArea)
    .values({
      id: planningAreaId,
      projectId: projectId,
      theGeom: () => `'${planningAreaGeom.toString('hex')}'`,
    })
    .execute();
}

export async function GivenProjectPus(
  em: EntityManager,
  projectId: string,
  amount: number,
) {
  const geomType = PlanningUnitGridShape.FromShapefile;
  const geometries = await GenerateRandomGeometries(em, amount);

  const result = await em
    .createQueryBuilder()
    .insert()
    .into(PlanningUnitsGeom)
    .values(
      geometries.map((geom) => ({
        theGeom: () => `'${geom.toString('hex')}'`,
        type: geomType,
      })),
    )
    .returning('id')
    .execute();

  const planningUnitsGeomIds = result.raw as { id: string }[];

  const projectPus = await em.getRepository(ProjectsPuEntity).save(
    planningUnitsGeomIds.map((geom, index) => ({
      projectId,
      geomId: geom.id,
      puid: index + 1,
      geomType,
    })),
  );

  return projectPus;
}

export async function GivenScenarioPuData(
  em: EntityManager,
  scenarioId: string,
  projectId: string,
  amount: number,
  scenarioPuData: DeepPartial<ScenariosPuPaDataGeo> = {},
) {
  const projectPus = await GivenProjectPus(em, projectId, amount);
  await em.getRepository(ScenariosPuPaDataGeo).save(
    projectPus.map((projectPu) => ({
      projectPuId: projectPu.id,
      featureList: [],
      protectedByDefault: false,
      protectedArea: 0,
      scenarioId,
      ...scenarioPuData,
    })),
  );

  return em
    .getRepository(ScenariosPuPaDataGeo)
    .find({ where: { scenarioId }, relations: ['projectPu'] });
}

export async function GivenScenarioPuCostData(
  em: EntityManager,
  scenarioPus: ScenariosPuPaDataGeo[],
) {
  return em.getRepository(ScenariosPuCostDataGeo).save(
    scenarioPus.map((scenarioPu) => ({
      cost: 1,
      scenariosPuDataId: scenarioPu.id,
    })),
  );
}

export async function GivenScenarioBlmResults(
  em: EntityManager,
  scenarioId: string,
) {
  return em.getRepository(BlmFinalResultEntity).save({
    blmValue: 30,
    boundaryLength: 500,
    cost: 1,
    scenarioId,
  });
}

export async function DeleteScenarioBlmResults(
  em: EntityManager,
  scenarioId: string,
) {
  return em.getRepository(BlmFinalResultEntity).delete({ scenarioId });
}

export async function GivenScenarioOutputPuData(
  em: EntityManager,
  scenarioPus: ScenariosPuPaDataGeo[],
) {
  return em.getRepository(OutputScenariosPuDataGeoEntity).save(
    scenarioPus.map((pu) => ({
      includedCount: 7,
      scenarioPuId: pu.id,
      values: [false, true, false, true],
    })),
  );
}

export async function DeleteScenarioOutputPuDataResults(
  em: EntityManager,
  scenarioId: string,
) {
  const deletedScenarioPu = await em.getRepository(ScenariosPuPaDataGeo).find({
    scenarioId,
  });
  return em.getRepository(OutputScenariosPuDataGeoEntity).delete({
    scenarioPuId: In(deletedScenarioPu.map((pu) => pu.id)),
  });
}

export async function DeletePlanningAreas(
  em: EntityManager,
  projectId: string,
) {
  const planningAreasRepo = em.getRepository(PlanningArea);
  return planningAreasRepo.delete({
    projectId: projectId,
  });
}
export async function DeleteProjectPus(em: EntityManager, projectId: string) {
  const projectsPuRepo = em.getRepository(ProjectsPuEntity);
  const planningUnitsGeomRepo = em.getRepository(PlanningUnitsGeom);

  const projectsPus = await projectsPuRepo.find({ where: { projectId } });
  await planningUnitsGeomRepo.delete({
    id: In(projectsPus.map((pu) => pu.geomId)),
  });
}

export async function GivenWdpaProtectedAreas(
  em: EntityManager,
  amount: number,
) {
  const geometries = await GenerateRandomGeometries(em, amount, true);
  const insertValues = geometries.map((geom, index) => ({
    id: v4(),
    geom,
    fullName: `wdpa protected area ${index + 1}`,
    wdpaId: index + 1,
  }));

  await em
    .createQueryBuilder()
    .insert()
    .into(ProtectedArea)
    .values(
      insertValues.map((pa) => ({
        ...pa,
        theGeom: () => `'${pa.geom.toString('hex')}'`,
      })),
    )
    .execute();

  return insertValues;
}

export async function GivenCustomProtectedAreas(
  em: EntityManager,
  amount: number,
  projectId: string,
) {
  const geometries = await GenerateRandomGeometries(em, amount, true);
  const insertValues = geometries.map((geom, index) => ({
    id: v4(),
    geom,
    fullName: `custom protected area ${index + 1} of ${projectId}`,
    projectId: projectId,
  }));

  await em
    .createQueryBuilder()
    .insert()
    .into(ProtectedArea)
    .values(
      insertValues.map((pa) => ({
        ...pa,
        theGeom: () => `'${pa.geom.toString('hex')}'`,
      })),
    )
    .execute();

  return insertValues;
}

export async function GivenFeatures(
  em: EntityManager,
  platformFeaturesAmount: number,
  customFeaturesAmount: number,
  projectId: string,
) {
  const customFeatures = Array(customFeaturesAmount)
    .fill(0)
    .map((_, index) => ({
      id: v4(),
      feature_class_name: `custom-${projectId}-${index + 1}`,
      tag: 'species',
      creation_status: 'done',
      project_id: projectId,
    }));
  const platformFeatures = Array(platformFeaturesAmount)
    .fill(0)
    .map((_, index) => ({
      id: v4(),
      feature_class_name: `platform-${projectId}-${index + 1}`,
      tag: 'species',
      creation_status: 'created',
      project_id: null,
    }));

  await Promise.all(
    [...customFeatures, ...platformFeatures].map((values) =>
      em
        .createQueryBuilder()
        .insert()
        .into('features')
        .values(values)
        .execute(),
    ),
  );

  return {
    customFeatures,
    platformFeatures,
  };
}

export async function GivenFeaturesData(
  em: EntityManager,
  amountOfRecordsForEachFeature: number,
  featureIds: string[],
): Promise<{ id: string; hash: string; feature_id: string }[]> {
  const geometries = await GenerateRandomGeometries(
    em,
    amountOfRecordsForEachFeature * featureIds.length,
    false,
  );

  const insertValues = featureIds.flatMap((featureId, featureIndex) =>
    Array(amountOfRecordsForEachFeature)
      .fill(0)
      .map((_, dataIndex) => ({
        id: v4(),
        featureId,
        properties: { featureIndex, dataIndex },
        source: GeometrySource.user_imported,
        theGeom: () =>
          `'${geometries[
            featureIndex * amountOfRecordsForEachFeature + dataIndex
          ].toString('hex')}'`,
      })),
  );

  const result = await em
    .createQueryBuilder()
    .insert()
    .into(GeoFeatureGeometry)
    .values(insertValues)
    .returning(['id', 'hash', 'featureId'])
    .execute();

  return result.raw;
}

export async function GivenScenarioFeaturesData(
  em: EntityManager,
  amountOfFeaturesDataRecordsForEachFeature: number,
  featureIds: string[],
  scenarioId: string,
  scenarioFeaturesData: DeepPartial<ScenarioFeaturesData> = {},
  opts: { startingIndex: number } = { startingIndex: 0 },
) {
  const featuresData = await GivenFeaturesData(
    em,
    amountOfFeaturesDataRecordsForEachFeature,
    featureIds,
  );

  const insertValues = featuresData.map((data, index) => ({
    ...scenarioFeaturesData,
    id: v4(),
    featureDataId: data.id,
    scenarioId,
    featureId: opts.startingIndex + index + 1,
  }));

  await em
    .createQueryBuilder()
    .insert()
    .into(ScenarioFeaturesData)
    .values(insertValues)
    .execute();

  return insertValues;
}

export async function GivenOutputScenarioFeaturesData(
  em: EntityManager,
  amountOfFeaturesDataRecordsForEachFeature: number,
  amountOfOutputDataRecordsForEachScenarioFeaturesData: number,
  featureIds: string[],
  scenarioId: string,
  outputScenarioFeaturesData: DeepPartial<OutputScenariosFeaturesDataGeoEntity> = {},
  scenarioFeaturesData: DeepPartial<ScenarioFeaturesData> = {},
) {
  const scenarioFeaturesDataIds = (
    await GivenScenarioFeaturesData(
      em,
      amountOfFeaturesDataRecordsForEachFeature,
      featureIds,
      scenarioId,
      scenarioFeaturesData,
    )
  ).map((value) => value.id);

  await em
    .createQueryBuilder()
    .insert()
    .into(OutputScenariosFeaturesDataGeoEntity)
    .values(
      scenarioFeaturesDataIds.flatMap((scenarioFeaturesDataId) =>
        Array(amountOfOutputDataRecordsForEachScenarioFeaturesData)
          .fill(0)
          .map((_, index) => ({
            totalArea: 1000,
            ...outputScenarioFeaturesData,
            runId: index,
            featureScenarioId: scenarioFeaturesDataId,
          })),
      ),
    )
    .execute();
}

export async function GivenSpecifications(
  em: EntityManager,
  featuresIds: string[],
  scenarioId: string,
) {
  const specifications = featuresIds.map((featureId) => {
    return {
      id: v4(),
      scenario_id: scenarioId,
      draft: true,
      raw: {
        status: 'any',
        features: [
          {
            featureId,
            innerObject: [
              {
                featureId,
                innnerObject: {
                  featureId,
                },
              },
              {
                featureId,
                nullValue: null,
              },
            ],
          },
        ],
        featureId,
        emptyArray: [],
        emptyObject: {},
      },
    };
  });

  await Promise.all(
    specifications.map((values) =>
      em
        .createQueryBuilder()
        .insert()
        .into('specifications')
        .values(values)
        .execute(),
    ),
  );

  return specifications;
}

export async function GivenSpecificationFeaturesConfig(
  em: EntityManager,
  featureId: string,
  specifications: TestSpecification[],
  featuresConfigsPerSpecification: number,
  configtData: Record<string, any> = {},
) {
  const specificationFeaturesConfig = specifications.flatMap(
    (specification) => {
      return Array(featuresConfigsPerSpecification)
        .fill(0)
        .map(() => {
          return {
            id: v4(),
            specification_id: specification.id,
            base_feature_id: featureId,
            against_feature_id: null,
            operation: 'copy',
            features_determined: false,
            split_by_property: null,
            select_sub_sets: null,
            ...configtData,
          };
        });
    },
  );

  await Promise.all(
    specificationFeaturesConfig.map((values) =>
      em
        .createQueryBuilder()
        .insert()
        .into('specification_feature_configs')
        .values(values)
        .execute(),
    ),
  );
}

export async function DeleteProtectedAreas(em: EntityManager, ids: string[]) {
  await em.getRepository(ProtectedArea).delete({ id: In(ids) });
}

export async function readSavedFile<T>(
  savedStrem: Readable,
  options = { parseBuffer: true },
): Promise<T> {
  let buffer: Buffer;
  const transformer = new Transform({
    transform: (chunk) => {
      buffer = chunk;
    },
  });
  await new Promise<void>((resolve) => {
    savedStrem.on('close', () => {
      resolve();
    });
    savedStrem.on('finish', () => {
      resolve();
    });
    savedStrem.pipe(transformer);
  });
  return options.parseBuffer
    ? JSON.parse(buffer!.toString())
    : buffer!.toString();
}
