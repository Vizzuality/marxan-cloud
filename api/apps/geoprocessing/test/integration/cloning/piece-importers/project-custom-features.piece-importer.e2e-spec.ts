import { ProjectCustomFeaturesPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-custom-features.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ProjectCustomFeature,
  ProjectCustomFeaturesContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GenerateRandomGeometries,
  GivenProjectExists,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCustomFeaturesPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when project custom features file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoProjectCustomFeaturesFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports project custom features', async () => {
    const archiveLocation = await fixtures.GivenValidProjectCustomFeaturesFile();
    await fixtures.GivenProject();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenCustomFeaturesShouldBeAddedToProject();
  });

  it('imports project leagcy features', async () => {
    const archiveLocation = await fixtures.GivenValidProjectCustomFeaturesFile({
      isLegacy: true,
    });
    await fixtures.GivenProject();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenCustomFeaturesShouldBeAddedToProject({ isLegacy: true });
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([GeoFeatureGeometry]),
      TypeOrmModule.forFeature([], geoprocessingConnections.apiDB.name),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [
      ProjectCustomFeaturesPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const organizationId = v4();
  const userId = v4();

  const geoEntityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );
  const featuresDataRepo = sandbox.get<Repository<GeoFeatureGeometry>>(
    getRepositoryToken(
      GeoFeatureGeometry,
      geoprocessingConnections.default.name,
    ),
  );

  const sut = sandbox.get(ProjectCustomFeaturesPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  const amountOfCustomFeatures = 5;
  const recordsOfDataForEachCustomFeature = 3;

  let validProjectCustomFeaturesFile: DeepPartial<ProjectCustomFeaturesContent>;

  return {
    cleanUp: async () => {
      const features: {
        id: string;
      }[] = await apiEntityManager
        .createQueryBuilder()
        .select('id')
        .from('features', 'f')
        .where('project_id = :projectId', { projectId })
        .execute();

      await featuresDataRepo.delete({
        featureId: In(features.map((feature) => feature.id)),
      });

      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenProject: () =>
      GivenProjectExists(apiEntityManager, projectId, organizationId),
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectCustomFeatures,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCustomFeatures,
        resourceKind: ResourceKind.Project,
        uris: [{ relativePath, uri: archiveLocation.value }],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCustomFeatures,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoProjectCustomFeaturesFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidProjectCustomFeaturesFile: async (
      opts: { isLegacy: boolean } = { isLegacy: false },
    ) => {
      const geometries = await GenerateRandomGeometries(
        geoEntityManager,
        amountOfCustomFeatures * recordsOfDataForEachCustomFeature,
        false,
      );

      validProjectCustomFeaturesFile = {
        features: Array(amountOfCustomFeatures)
          .fill(0)
          .map((_, featureIndex) => ({
            alias: '',
            feature_class_name: `${projectId}-${featureIndex + 1}`,
            creation_status: 'created' as ProjectCustomFeature['creation_status'],
            description: '',
            intersection: [],
            list_property_keys: [],
            property_name: '',
            is_legacy: opts.isLegacy,
            data: Array(recordsOfDataForEachCustomFeature)
              .fill(0)
              .map((_, dataIndex) => ({
                the_geom: geometries[
                  featureIndex * recordsOfDataForEachCustomFeature + dataIndex
                ].toString('hex'),
                properties: { featureIndex, dataIndex },
                source: GeometrySource.user_imported,
              })),
          })),
      };

      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectCustomFeatures,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validProjectCustomFeaturesFile)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /File with piece data for/gi,
          );
        },
        ThenCustomFeaturesShouldBeAddedToProject: async (
          opts: { isLegacy: boolean } = { isLegacy: false },
        ) => {
          await sut.run(input);

          const customFeatures: {
            id: string;
            isLegacy: boolean;
          }[] = await apiEntityManager
            .createQueryBuilder()
            .select('id')
            .addSelect('is_legacy', 'isLegacy')
            .from('features', 'f')
            .where('project_id = :projectId', { projectId })
            .execute();

          expect(
            customFeatures.every(({ isLegacy }) => isLegacy === opts.isLegacy),
          );

          const featuresData = await featuresDataRepo.find({
            featureId: In(customFeatures.map((feature) => feature.id)),
          });

          expect(customFeatures).toHaveLength(amountOfCustomFeatures);
          expect(featuresData).toHaveLength(
            amountOfCustomFeatures * recordsOfDataForEachCustomFeature,
          );
        },
      };
    },
  };
};
