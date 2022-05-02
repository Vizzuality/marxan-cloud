import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import {
  CloningFilesRepository,
  GetFileError,
  SaveFileError,
  storageNotReachable,
  unknownError,
} from '@marxan/cloning-files-repository';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningAreaGadmContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-gadm';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { Either, left, Right, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { v4 } from 'uuid';
import { geoprocessingConnections } from '../../ormconfig';
import { PlanningAreaGadmPieceExporter } from './planning-area-gadm.piece-exporter';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should create planning area gadm data file', async () => {
  fixtures.GivenAPlanningAreaGadmProjectExportJob();

  await fixtures
    .WhenPlanningAreaGadmPieceProcessorIsInvoked()
    .ThenFileRepositoryContainsPlanningAreaGadmFile();
});

it('should throw an error if it is called with a scenario export job', async () => {
  fixtures.GivenAPlanningAreaGadmScenarioExportJob();

  await fixtures
    .WhenPlanningAreaGadmPieceProcessorIsInvoked()
    .ThenAnErrorIsThrown(/exporting scenario/gi);
});

it('should throw an error if project gadm data is not found', async () => {
  fixtures.GivenAPlanningAreaGadmProjectExportJob();

  fixtures.WhenProjectGadmDataIsMissing();

  await fixtures
    .WhenPlanningAreaGadmPieceProcessorIsInvoked()
    .ThenAnErrorIsThrown(/gadm data not found/gi);
});

it('should throw an error if file saving fails', async () => {
  fixtures.GivenAPlanningAreaGadmProjectExportJob();

  await fixtures
    .WhenPlanningAreaGadmPieceProcessorIsInvoked({ fileRepoFails: true })
    .ThenAnErrorIsThrown(/couldn't save file/gi);
});

const getFixtures = async () => {
  const geoprocessingEntityManagerToken = getEntityManagerToken(
    geoprocessingConnections.apiDB,
  );

  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      PlanningAreaGadmPieceExporter,
      {
        provide: CloningFilesRepository,
        useClass: FakeFileRepository,
      },
      {
        provide: geoprocessingEntityManagerToken,
        useClass: FakeEntityManager,
      },
      Logger,
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(PlanningAreaGadmPieceExporter);
  const fakeFileRepo = sandbox.get(
    CloningFilesRepository,
  ) as FakeFileRepository;
  const fakeEntityManager = sandbox.get(
    geoprocessingEntityManagerToken,
  ) as FakeEntityManager;

  let exportJob: ExportJobInput;
  let fileUri: string;

  return {
    GivenAPlanningAreaGadmProjectExportJob: () => {
      const projectId = v4();
      exportJob = {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.PlanningAreaGAdm },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaGAdm,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenAPlanningAreaGadmScenarioExportJob: () => {
      const scenarioId = v4();
      exportJob = {
        allPieces: [
          { resourceId: scenarioId, piece: ClonePiece.PlanningAreaGAdm },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaGAdm,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Scenario,
      };
    },
    WhenProjectGadmDataIsMissing: () => {
      fakeEntityManager.data = [];
    },
    WhenPlanningAreaGadmPieceProcessorIsInvoked: (
      { fileRepoFails } = { fileRepoFails: false },
    ) => {
      if (fileRepoFails) fakeFileRepo.errorWhileSaving = true;

      const promise = sut.run(exportJob);

      return {
        ThenAnErrorIsThrown: async (errorRegex?: RegExp) => {
          await expect(promise).rejects.toThrow(errorRegex);
        },
        ThenFileRepositoryContainsPlanningAreaGadmFile: async () => {
          const result = await promise;
          fileUri = result.uris[0].uri;
          const file = await fakeFileRepo.get(fileUri);

          expect((file as Right<Readable>).right).toBeDefined();
        },
      };
    },
  };
};

class FakeEntityManager {
  public data: PlanningAreaGadmContent[] = [
    {
      bbox: [],
      country: 'AGO',
      planningUnitAreakm2: 1000,
    },
  ];

  createQueryBuilder = () => this;
  select = () => this;
  addSelect = () => this;
  from = () => this;
  where = () => this;
  async execute() {
    return this.data;
  }
}

class FakeFileRepository implements CloningFilesRepository {
  private files: Record<string, Readable> = {};
  public errorWhileSaving = false;

  async saveCloningFile(
    exportId: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>> {
    if (this.errorWhileSaving) return left(unknownError);

    const filename = `${exportId}/${relativePath}`;
    this.files[filename] = stream;
    return right(filename);
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    const file = this.files[uri];

    if (!file) return left(storageNotReachable);

    return right(file);
  }

  saveZipFile(
    exportId: string,
    stream: Readable,
  ): Promise<Either<SaveFileError, string>> {
    throw new Error('Method not implemented.');
  }

  deleteExportFolder(exportId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getFilesFolderFor(exportId: string): string {
    throw new Error('Method not implemented.');
  }
}
