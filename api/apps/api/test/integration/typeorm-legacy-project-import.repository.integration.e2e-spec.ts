import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFileType,
  LegacyProjectImportPiece,
  LegacyProjectImportPieceOrderResolver,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { isLeft } from 'fp-ts/lib/These';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { LegacyProjectImport } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportComponentStatuses } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import-component-status';
import { LegacyProjectImportComponentId } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import-component.id';
import { LegacyProjectImportComponentSnapshot } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import-component.snapshot';
import { LegacyProjectImportId } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.id';
import { LegacyProjectImportRepository } from '../../src/modules/legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportComponentEntity } from '../../src/modules/legacy-project-import/infra/entities/legacy-project-import-component.api.entity';
import { LegacyProjectImportFileEntity } from '../../src/modules/legacy-project-import/infra/entities/legacy-project-import-file.api.entity';
import { LegacyProjectImportEntity } from '../../src/modules/legacy-project-import/infra/entities/legacy-project-import.api.entity';
import { LegacyProjectImportTypeormRepository } from '../../src/modules/legacy-project-import/infra/legacy-project-import-typeorm.repository';
import { Organization } from '../../src/modules/organizations/organization.api.entity';
import { Project } from '../../src/modules/projects/project.api.entity';
import { User } from '../../src/modules/users/user.api.entity';
import { apiConnections } from '../../src/ormconfig';

describe(LegacyProjectImportTypeormRepository, () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 20000);

  afterAll(async () => {
    await fixtures.cleanup();
  });

  it('should expose methods for storing and getting legacy project imports by project id', async () => {
    await fixtures.GivenLegacyProjectImportWasRequested();
    const legacyProjectImport = await fixtures.WhenReadingLegacyProjectImportFromRepository();
    await fixtures.ThenLegacyProjectImportDataShouldBeOk({
      legacyProjectImport,
      atLeastAComponentIsCompleted: false,
    });
  });

  it('should update an import when a nested piece is completed', async () => {
    await fixtures.GivenLegacyProjectImportWasRequested();
    await fixtures.WhenAComponentIsCompleted();
    const legacyProjectImport = await fixtures.WhenReadingLegacyProjectImportFromRepository();
    await fixtures.ThenLegacyProjectImportDataShouldBeOk({
      legacyProjectImport,
      atLeastAComponentIsCompleted: true,
    });
  });

  it('should save entities working with transaction', async () => {
    await fixtures.GivenLegacyProjectImportWasRequested();
    await fixtures.WhenAllComponentsAreCompletedConcurrentlyWithTransactions();
    const legacyProjectImport = await fixtures.WhenReadingLegacyProjectImportFromRepository();
    fixtures.ThenAllImportComponentsShouldBeFinished({
      legacyProjectImport,
    });
  });
});

const getFixtures = async () => {
  const legacyProjectImportId = LegacyProjectImportId.create();
  const organizationId = v4();
  const projectId = ResourceId.create();
  const scenarioId = v4();
  const ownerId = UserId.create();

  const testingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...apiConnections.default,
        keepConnectionAlive: true,
      }),
      TypeOrmModule.forFeature([
        Project,
        Organization,
        User,
        LegacyProjectImportEntity,
        LegacyProjectImportComponentEntity,
        LegacyProjectImportFileEntity,
      ]),
    ],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportTypeormRepository,
      },
    ],
  }).compile();

  const repo = testingModule.get<LegacyProjectImportRepository>(
    LegacyProjectImportRepository,
  );
  const organizationRepo = testingModule.get<Repository<Organization>>(
    getRepositoryToken(Organization),
  );
  const projectRepo = testingModule.get<Repository<Project>>(
    getRepositoryToken(Project),
  );
  const userRepo = testingModule.get<Repository<User>>(
    getRepositoryToken(User),
  );

  const passwordHash = await hash('supersecretpassword', 10);

  await organizationRepo.save({
    id: organizationId,
    name: `test organization - ${organizationId}`,
  });

  await projectRepo.save({
    id: projectId.value,
    name: `test project - ${projectId.value}`,
    organizationId,
  });

  await userRepo.save({
    id: ownerId.value,
    email: `${ownerId.value}@test.com`,
    passwordHash,
  });

  const pieces: LegacyProjectImportComponentSnapshot[] = [
    LegacyProjectImportPiece.Features,
    LegacyProjectImportPiece.FeaturesSpecification,
    LegacyProjectImportPiece.PlanningGrid,
    LegacyProjectImportPiece.ScenarioPusData,
    LegacyProjectImportPiece.Solutions,
  ].map((kind) => ({
    errors: [],
    id: v4(),
    kind,
    order: LegacyProjectImportPieceOrderResolver.resolveFor(kind),
    status: LegacyProjectImportComponentStatuses.Submitted,
    warnings: [],
  }));

  const files: LegacyProjectImportFileSnapshot[] = [
    LegacyProjectImportFileType.InputDat,
    LegacyProjectImportFileType.Output,
    LegacyProjectImportFileType.PlanningGridShapefile,
    LegacyProjectImportFileType.PuDat,
    LegacyProjectImportFileType.PuvsprDat,
    LegacyProjectImportFileType.SpecDat,
  ].map((kind) => ({
    location: `/${legacyProjectImportId.value}/${kind}`,
    type: kind,
  }));

  const expectedIsAcceptingFiles = false;

  return {
    cleanup: async () => {
      const legacyProjectImportInternalRepo = testingModule.get<
        Repository<LegacyProjectImportEntity>
      >(getRepositoryToken(LegacyProjectImportEntity));

      await legacyProjectImportInternalRepo.delete({});
      await userRepo.delete({ id: ownerId.value });
      await projectRepo.delete({ id: projectId.value });
      await organizationRepo.delete({ id: organizationId });
      await testingModule.close();
    },
    GivenLegacyProjectImportWasRequested: async () => {
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id: legacyProjectImportId.value,
        files,
        isAcceptingFiles: expectedIsAcceptingFiles,
        ownerId: ownerId.value,
        pieces,
        projectId: projectId.value,
        scenarioId,
      });

      await repo.save(legacyProjectImport);
    },
    WhenAComponentIsCompleted: async () => {
      const legacyProjectImportOrError = await repo.find(projectId);

      if (isLeft(legacyProjectImportOrError))
        throw new Error('Legacy project import not found');

      const legacyProjectImport = legacyProjectImportOrError.right;
      expect(legacyProjectImport).toBeDefined();
      const [piece] = pieces;
      legacyProjectImport.completePiece(
        new LegacyProjectImportComponentId(piece.id),
      );
      await repo.save(legacyProjectImport);
    },
    WhenAllComponentsAreCompletedConcurrentlyWithTransactions: async () => {
      const legacyProjectImportOrError = await repo.find(projectId);

      if (isLeft(legacyProjectImportOrError))
        throw new Error('Legacy project import not found');

      const legacyProjectImport = legacyProjectImportOrError.right;
      expect(legacyProjectImport).toBeDefined();

      await Promise.all(
        pieces.map((piece) =>
          repo.transaction(async (repository) => {
            legacyProjectImport.completePiece(
              new LegacyProjectImportComponentId(piece.id),
            );
            await repository.save(legacyProjectImport);
          }),
        ),
      );
    },
    WhenReadingLegacyProjectImportFromRepository: async () => {
      const legacyProjectImportOrError = await repo.find(projectId);

      if (isLeft(legacyProjectImportOrError))
        throw new Error('Legacy project import not found');

      return legacyProjectImportOrError.right;
    },
    ThenLegacyProjectImportDataShouldBeOk: async ({
      legacyProjectImport,
      atLeastAComponentIsCompleted,
    }: {
      legacyProjectImport: LegacyProjectImport;
      atLeastAComponentIsCompleted: boolean;
    }) => {
      const snapshot = legacyProjectImport.toSnapshot();
      expect(snapshot.id).toBe(legacyProjectImportId.value);
      expect(snapshot.isAcceptingFiles).toBe(expectedIsAcceptingFiles);
      expect(snapshot.ownerId).toBe(ownerId.value);
      expect(snapshot.projectId).toBe(projectId.value);
      expect(snapshot.scenarioId).toBe(scenarioId);

      expect(snapshot.files).toHaveLength(files.length);
      expect(snapshot.files.map((file) => file.type).sort()).toEqual(
        files.map((file) => file.type).sort(),
      );
      expect(snapshot.files.map((file) => file.location).sort()).toEqual(
        files.map((file) => file.location).sort(),
      );

      expect(snapshot.pieces).toHaveLength(pieces.length);
      expect(snapshot.pieces.map((piece) => piece.kind).sort()).toEqual(
        pieces.map((piece) => piece.kind).sort(),
      );

      if (atLeastAComponentIsCompleted) {
        expect(
          snapshot.pieces.some(
            (piece) =>
              piece.status === LegacyProjectImportComponentStatuses.Completed,
          ),
        ).toBe(true);
      }
    },
    ThenAllImportComponentsShouldBeFinished: ({
      legacyProjectImport,
    }: {
      legacyProjectImport: LegacyProjectImport;
    }) => {
      expect(
        legacyProjectImport
          .toSnapshot()
          .pieces.every(
            (piece) =>
              piece.status === LegacyProjectImportComponentStatuses.Completed,
          ),
      ).toEqual(true);
    },
  };
};
