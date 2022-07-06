import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { Either } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import { LegacyProjectImportMemoryRepository } from '../../infra/legacy-project-import-memory.repository';
import { LegacyProjectImport } from '../legacy-project-import/legacy-project-import';
import { LegacyProjectImportStatuses } from '../legacy-project-import/legacy-project-import-status';
import { LegacyProjectImportRepository } from '../legacy-project-import/legacy-project-import.repository';
import {
  LegacyProjectImportChecker,
  legacyProjectImportDoesntExist,
  LegacyProjectImportDoesntExist,
} from './legacy-project-import-checker.service';
import { MarxanLegacyProjectImportChecker } from './marxan-legacy-project-import-checker.service';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`isLegacyProjectImportCompletedFor() should return legacyProjectImportdoesntExist if the project does not have a legacy project import`, async () => {
  const res = fixtures.GivenProjectIsNotALegacyProject();

  const result = await fixtures.WhenHasImportedLegacyProjectMethodIsCalled(res);

  fixtures.ThenLegacyProjectImportDoesntExistIsReturned(result);
});

it.each(
  Object.values(LegacyProjectImportStatuses).filter(
    (kind) => kind !== LegacyProjectImportStatuses.Completed,
  ),
)(
  `isLegacyProjectImportCompletedFor() should return false if given project has a legacy project import with status %s`,
  async (kind) => {
    const id = await fixtures.GivenLegacyProjectImport(kind);

    const result = await fixtures.WhenHasImportedLegacyProjectMethodIsCalled(
      id,
    );

    fixtures.ThenFalseIsReturned(result);
  },
);

it(`isLegacyProjectImportCompletedFor() should return true if given project has an already completed legacy project import`, async () => {
  const id = await fixtures.GivenLegacyProjectImport(
    LegacyProjectImportStatuses.Completed,
  );

  const result = await fixtures.WhenHasImportedLegacyProjectMethodIsCalled(id);

  fixtures.ThenTrueIsReturned(result);
});

async function getFixtures() {
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: LegacyProjectImportChecker,
        useClass: MarxanLegacyProjectImportChecker,
      },
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
    ],
  }).compile();
  const sut = testingModule.get(LegacyProjectImportChecker);
  const repo = testingModule.get(LegacyProjectImportRepository);
  const projectId = v4();

  return {
    GivenProjectIsNotALegacyProject: () => {
      return projectId;
    },
    GivenLegacyProjectImport: async (status: LegacyProjectImportStatuses) => {
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        files: [],
        pieces: [],
        id: v4(),
        ownerId: v4(),
        projectId,
        scenarioId: v4(),
        status,
        toBeRemoved: false,
      });
      await repo.save(legacyProjectImport);

      return projectId;
    },
    WhenHasImportedLegacyProjectMethodIsCalled: (projectId: string) => {
      return sut.isLegacyProjectImportCompletedFor(projectId);
    },
    ThenLegacyProjectImportDoesntExistIsReturned: (
      result: Either<LegacyProjectImportDoesntExist, boolean>,
    ) => {
      expect(result).toEqual({
        _tag: 'Left',
        left: legacyProjectImportDoesntExist,
      });
    },
    ThenFalseIsReturned: (
      result: Either<LegacyProjectImportDoesntExist, boolean>,
    ) => {
      expect(result).toEqual({
        _tag: 'Right',
        right: false,
      });
    },
    ThenTrueIsReturned: (
      result: Either<LegacyProjectImportDoesntExist, boolean>,
    ) => {
      expect(result).toEqual({
        _tag: 'Right',
        right: true,
      });
    },
  };
}
