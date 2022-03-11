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
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as archiver from 'archiver';
import { isLeft } from 'fp-ts/lib/Either';
import { In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { PlanningUnitsGridPieceImporter } from '../../../src/import/pieces-importers/planning-units-grid.piece-importer';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningUnitsGridPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should fail when planning area grid file is missing in uris array ', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('should fail when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoGridFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('should fail when file content is invalid', async () => {
    const archiveLocation = await fixtures.GivenInvalidGridFileFormat();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenGridFormatErrorShouldBeThrown();
  });

  it('should throw if insert operation fails', async () => {
    const archiveLocation = await fixtures.GivenInvalidGridFileContent();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenInsertErrorShouldBeThrown();
  });

  it('should insert geometries succesfully when file is valid', async () => {
    const archiveLocation = await fixtures.GivenValidGridFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenPlanningUnitsGeometriesShouldBeInserted();
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
      TypeOrmModule.forFeature([PlanningUnitsGeom, ProjectsPuEntity]),
      FileRepositoryModule,
    ],
    providers: [
      PlanningUnitsGridPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const sut = sandbox.get(PlanningUnitsGridPieceImporter);
  const fileRepository = sandbox.get(FileRepository);
  const puGeomRepo = sandbox.get<Repository<PlanningUnitsGeom>>(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const projectsPuRepo = sandbox.get<Repository<ProjectsPuEntity>>(
    getRepositoryToken(ProjectsPuEntity),
  );
  return {
    cleanUp: async () => {
      const pus = await projectsPuRepo.find({ projectId });
      await projectsPuRepo.delete({ projectId });
      await puGeomRepo.delete({
        id: In(pus.map((pu) => pu.geomId)),
      });
    },
    GivenNoGridFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenInvalidGridFileFormat: async (): Promise<ArchiveLocation> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });

      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
        'planning area custom grid relative path',
      );

      const invalidGridFile = '1,[1,2,4\n';
      archive.append(invalidGridFile, {
        name: relativePath,
      });

      const saveFile = fileRepository.save(archive);
      archive.finalize();
      const uriOrError = await saveFile;

      if (isLeft(uriOrError)) throw new Error('coudnt save file');
      return new ArchiveLocation(uriOrError.right);
    },
    GivenValidGridFile: async () => {
      const validGridFile =
        '1,[1,3,0,0,32,230,16,0,0,1,0,0,0,6,0,0,0,210,1,41,148,71,222,49,64,65,105,159,209,218,16,43,192,56,82,9,145,4,221,49,64,26,22,15,148,128,17,43,192,204,204,204,204,204,220,49,64,51,51,51,51,51,19,43,192,58,152,177,244,227,220,49,64,30,31,62,250,112,20,43,192,47,57,246,128,0,221,49,64,247,216,244,65,170,20,43,192,210,1,41,148,71,222,49,64,65,105,159,209,218,16,43,192]\n2,[1,3,0,0,32,230,16,0,0,1,0,0,0,6,0,0,0,104,104,118,46,178,112,51,64,180,80,228,111,31,222,49,192,145,194,89,190,194,106,51,64,180,80,228,111,31,222,49,192,233,215,125,56,114,106,51,64,68,237,244,189,154,222,49,192,254,131,129,231,222,107,51,64,95,139,79,1,48,222,49,192,4,222,2,9,138,111,51,64,141,102,44,154,206,222,49,192,104,104,118,46,178,112,51,64,180,80,228,111,31,222,49,192]\n3,[1,3,0,0,32,230,16,0,0,1,0,0,0,4,0,0,0,26,94,3,137,61,189,51,64,89,116,60,154,153,39,45,192,217,233,181,223,174,189,51,64,155,15,104,202,190,40,45,192,85,199,245,173,87,189,51,64,170,187,53,170,74,39,45,192,26,94,3,137,61,189,51,64,89,116,60,154,153,39,45,192]\n4,[1,3,0,0,32,230,16,0,0,1,0,0,0,5,0,0,0,92,233,206,197,9,244,53,64,191,209,176,188,205,35,48,192,162,85,95,148,69,246,53,64,191,209,176,188,205,35,48,192,31,137,94,70,177,244,53,64,169,131,245,127,14,35,48,192,142,141,34,203,39,243,53,64,11,67,162,206,174,34,48,192,92,233,206,197,9,244,53,64,191,209,176,188,205,35,48,192]\n';

      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });
      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
        'planning area custom grid relative path',
      );
      archive.append(validGridFile, {
        name: relativePath,
      });

      const saveFile = fileRepository.save(archive);
      archive.finalize();
      const uriOrError = await saveFile;

      if (isLeft(uriOrError)) throw new Error('coudnt save file');
      return new ArchiveLocation(uriOrError.right);
    },
    GivenInvalidGridFileContent: async (): Promise<ArchiveLocation> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });

      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
        'planning area custom grid relative path',
      );

      const invalidGridFile = '1,[1,2,4]\n';
      archive.append(invalidGridFile, {
        name: relativePath,
      });

      const saveFile = fileRepository.save(archive);
      archive.finalize();
      const uriOrError = await saveFile;

      if (isLeft(uriOrError)) throw new Error('coudnt save file');
      return new ArchiveLocation(uriOrError.right);
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const [uri] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
        archiveLocation.value,
      );
      return {
        componentId: v4(),
        componentResourceId: v4(),
        importId: v4(),
        importResourceId: projectId,
        piece: ClonePiece.PlanningUnitsGrid,
        resourceKind: ResourceKind.Project,
        uris: [uri.toSnapshot()],
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        componentResourceId: v4(),
        importId: v4(),
        importResourceId: projectId,
        piece: ClonePiece.PlanningUnitsGrid,
        resourceKind: ResourceKind.Project,
        uris: [],
      };
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenInsertErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /WKB structure does not match expected size/gi,
          );
        },
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /File with piece data for/gi,
          );
        },
        ThenGridFormatErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/unknown line format/gi);
        },
        ThenPlanningUnitsGeometriesShouldBeInserted: async () => {
          const result = await sut.run(input);
          const pus = await projectsPuRepo.find({
            relations: ['puGeom'],
            where: {
              projectId: result.importResourceId,
            },
          });
          expect(pus).toHaveLength(4);
          expect(pus.every((pu) => pu.puGeom !== undefined)).toBe(true);
        },
      };
    },
  };
};
