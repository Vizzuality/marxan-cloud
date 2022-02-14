import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  FileRepository,
  GetFileError,
  SaveFileError,
  storageNotReachable,
  unknownError,
} from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { Either, left, Right, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { v4 } from 'uuid';
import { geoprocessingConnections } from '../../ormconfig';
import {
  Gadm,
  PlanningAreaGadmPieceExporter,
} from './planning-area-gadm.piece-exporter';

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
        provide: FileRepository,
        useClass: FakeFileRepository,
      },
      {
        provide: geoprocessingEntityManagerToken,
        useClass: FakeEntityManager,
      },
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(PlanningAreaGadmPieceExporter);
  const fakeFileRepo = sandbox.get(FileRepository) as FakeFileRepository;
  const fakeEntityManager = sandbox.get(
    geoprocessingEntityManagerToken,
  ) as FakeEntityManager;

  let exportJob: ExportJobInput;
  let fileUri: string;

  return {
    GivenAPlanningAreaGadmProjectExportJob: () => {
      exportJob = {
        allPieces: [ClonePiece.PlanningAreaGAdm],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaGAdm,
        resourceId: v4(),
        resourceKind: ResourceKind.Project,
      };
    },
    GivenAPlanningAreaGadmScenarioExportJob: () => {
      exportJob = {
        allPieces: [ClonePiece.PlanningAreaGAdm],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaGAdm,
        resourceId: v4(),
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
  public data: Gadm[] = [
    {
      bbox: [],
      country: 'AGO',
      l1: null,
      l2: null,
      planningUnitAreakm2: 1000,
      puGridShape: PlanningUnitGridShape.hexagon,
    },
  ];

  async query(): Promise<Gadm[]> {
    return this.data;
  }
}

class FakeFileRepository implements FileRepository {
  private files: Record<string, Readable> = {};
  public errorWhileSaving = false;

  async save(
    stream: Readable,
    extension?: string,
  ): Promise<Either<SaveFileError, string>> {
    if (this.errorWhileSaving) return left(unknownError);

    const filename = `${v4()}${extension ? `.${extension}` : ''}`;
    this.files[filename] = stream;
    return right(filename);
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    const file = this.files[uri];

    if (!file) return left(storageNotReachable);

    return right(file);
  }
}
