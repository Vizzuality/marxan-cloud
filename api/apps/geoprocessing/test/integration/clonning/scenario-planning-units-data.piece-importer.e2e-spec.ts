import { ScenarioPlanningUnitsDataPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-planning-units-data.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioPlanningUnitsDataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-planning-units-data';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { DeleteProjectPus, GivenProjectPus, PrepareZipFile } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioPlanningUnitsDataPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when scenario planning units data file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoScenarioPlanningUnitsDataFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports scenario planning units data', async () => {
    await fixtures.GivenProjectPus();
    const archiveLocation = await fixtures.GivenValidScenarioPlanningUnitsDataFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioPlanningUnitsDataShouldBeImported();
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
      TypeOrmModule.forFeature([
        ScenariosPuPaDataGeo,
        ScenariosPuCostDataGeo,
        ProjectsPuEntity,
        PlanningUnitsGeom,
      ]),
      FileRepositoryModule,
    ],
    providers: [
      ScenarioPlanningUnitsDataPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const scenarioId = v4();
  const projectId = v4();
  const resourceKind = ResourceKind.Project;
  const oldScenarioId = v4();
  const userId = v4();

  const sut = sandbox.get(ScenarioPlanningUnitsDataPieceImporter);
  const fileRepository = sandbox.get(FileRepository);
  const entityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const scenarioPuDataRepo = sandbox.get<Repository<ScenariosPuPaDataGeo>>(
    getRepositoryToken(ScenariosPuPaDataGeo),
  );
  const scenarioPuCostDataRepo = sandbox.get<
    Repository<ScenariosPuCostDataGeo>
  >(getRepositoryToken(ScenariosPuCostDataGeo));

  const expectedCost = 100;

  const getPlanningUnitData = (
    puid: number,
  ): ScenarioPlanningUnitsDataContent['planningUnitsData'][number] => ({
    cost: expectedCost,
    featureList: [],
    protectedByDefault: false,
    puid,
  });

  const scenarioPlanningUnitsAmount = 4;

  const validScenarioPlanningUnitsDataFileContent: ScenarioPlanningUnitsDataContent = {
    planningUnitsData: Array(scenarioPlanningUnitsAmount)
      .fill(0)
      .map((_, index) => getPlanningUnitData(index + 1)),
  };

  return {
    cleanUp: async () => {
      await DeleteProjectPus(entityManager, projectId);
    },
    GivenProjectPus: () => {
      return GivenProjectPus(
        entityManager,
        projectId,
        scenarioPlanningUnitsAmount,
      );
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const [
        uri,
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioPlanningUnitsData,
        archiveLocation.value,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioPlanningUnitsData,
        resourceKind,
        uris: [uri.toSnapshot()],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioPlanningUnitsData,
        resourceKind,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoScenarioPlanningUnitsDataFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidScenarioPlanningUnitsDataFile: async () => {
      const [
        { relativePath },
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioPlanningUnitsData,
        'scenario planning units data file relative path',
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      return PrepareZipFile(
        validScenarioPlanningUnitsDataFileContent,
        fileRepository,
        relativePath,
      );
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
        ThenScenarioPlanningUnitsDataShouldBeImported: async () => {
          await sut.run(input);
          const scenarioPusData = await scenarioPuDataRepo.find({
            where: { scenarioId },
            relations: ['projectPu'],
          });
          const scenarioPusCostData = await scenarioPuCostDataRepo.find({
            where: {
              scenariosPuDataId: In(scenarioPusData.map((pu) => pu.id)),
            },
          });

          const pusCost = scenarioPusCostData.map((pu) => pu.cost);
          const puids = scenarioPusData.map((pu) => pu.projectPu.puid).sort();

          expect(scenarioPusData).toHaveLength(
            validScenarioPlanningUnitsDataFileContent.planningUnitsData.length,
          );
          expect(puids).toEqual(
            validScenarioPlanningUnitsDataFileContent.planningUnitsData
              .map((pu) => pu.puid)
              .sort(),
          );
          expect(pusCost.every((cost) => cost === expectedCost)).toBe(true);
        },
      };
    },
  };
};
