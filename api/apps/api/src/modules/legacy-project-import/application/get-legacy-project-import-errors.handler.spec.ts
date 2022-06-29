import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { v4, validate, version } from 'uuid';
import { forbiddenError } from '../../access-control';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportComponentStatuses } from '../domain/legacy-project-import/legacy-project-import-component-status';
import { LegacyProjectImportStatuses } from '../domain/legacy-project-import/legacy-project-import-status';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '../infra/legacy-project-import-memory.repository';
import { GetLegacyProjectImportErrorsHandler } from './get-legacy-project-import-errors.handler';
import { GetLegacyProjectImportErrors } from './get-legacy-project-import-errors.query';

type ErrorsAndWarnings = { errors: string[]; warnings: string[] };

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('fails if legacy project import is not found', async () => {
  const projectId = await fixtures.GivenNoneLegacyProjectImport();

  await fixtures
    .WhenGettingLegacyProjectImportErrorsAndWarnings({
      projectId,
    })
    .ThenLegacyProjectImportNotFoundErrorShouldBeReturned();
});

it('fails if a user tries to get errors of a not owned legacy project import', async () => {
  const projectId = await fixtures.GivenLegacyProjectImport({
    errorsAndWarnings: [],
  });

  await fixtures
    .WhenGettingLegacyProjectImportErrorsAndWarnings({
      projectId,
      differentUser: true,
    })
    .ThenForbiddenErrorShouldBeReturned();
});

it('returns errors and warnings from a legacy project import', async () => {
  const firstPieceErrors = {
    errors: ['shapefile planning units does not have puids'],
    warnings: ['shapefile warning'],
  };
  const secondPieceErrors = {
    errors: ['invalid pu.dat contents'],
    warnings: [],
  };
  const thirdPieceErrors = {
    errors: [],
    warnings: ['unknown planning units puids: 123'],
  };

  const projectId = await fixtures.GivenLegacyProjectImport({
    errorsAndWarnings: [
      firstPieceErrors,
      secondPieceErrors,
      thirdPieceErrors,
      { errors: [], warnings: [] },
    ],
  });

  await fixtures
    .WhenGettingLegacyProjectImportErrorsAndWarnings({
      projectId,
    })
    .ThenLegacyProjectImportErrorsAndWarningsShouldBeReturned([
      firstPieceErrors,
      secondPieceErrors,
      thirdPieceErrors,
    ]);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      GetLegacyProjectImportErrorsHandler,
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();
  const projectId = ResourceId.create();
  const scenarioId = ResourceId.create();

  const sut = sandbox.get(GetLegacyProjectImportErrorsHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );

  function arraysEqual(first: string[], second: string[]) {
    return JSON.stringify(first) == JSON.stringify(second);
  }

  return {
    GivenLegacyProjectImport: async ({
      errorsAndWarnings,
    }: {
      errorsAndWarnings: ErrorsAndWarnings[];
    }) => {
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id: v4(),
        scenarioId: scenarioId.value,
        projectId: projectId.value,
        ownerId: ownerId.value,
        files: [],
        pieces: errorsAndWarnings.map(({ errors, warnings }, index) => ({
          errors,
          warnings,
          order: index,
          id: v4(),
          kind: LegacyProjectImportPiece.PlanningGrid,
          status: errors.length
            ? LegacyProjectImportComponentStatuses.Failed
            : LegacyProjectImportComponentStatuses.Completed,
        })),
        status: LegacyProjectImportStatuses.Failed,
        toBeRemoved: false,
      });

      await repo.save(legacyProjectImport);

      return projectId;
    },
    GivenNoneLegacyProjectImport: async () => {
      const result = await repo.find(projectId);
      expect(result).toMatchObject({ left: legacyProjectImportNotFound });

      return projectId;
    },
    WhenGettingLegacyProjectImportErrorsAndWarnings: ({
      projectId,
      differentUser,
    }: {
      projectId: ResourceId;
      differentUser?: boolean;
    }) => {
      const query = new GetLegacyProjectImportErrors(
        projectId,
        differentUser ? UserId.create() : ownerId,
      );

      return {
        ThenLegacyProjectImportErrorsAndWarningsShouldBeReturned: async (
          expectedErrors: ErrorsAndWarnings[],
        ) => {
          const result = await sut.execute(query);

          if (isLeft(result)) throw new Error('Expected right, got left');

          expect(result.right).toHaveLength(expectedErrors.length);

          result.right.forEach(
            ({ errors, componentId, kind, status, warnings }) => {
              expect(errors).toBeInstanceOf(Array);
              expect(warnings).toBeInstanceOf(Array);
              expect(version(componentId)).toBe(4);
              expect(validate(componentId)).toBe(true);
              expect(Object.values(LegacyProjectImportPiece)).toContain(kind);
              expect(
                Object.values(LegacyProjectImportComponentStatuses),
              ).toContain(status);
            },
          );

          result.right.every((piece) =>
            expectedErrors.some(
              (expected) =>
                arraysEqual(piece.warnings, expected.warnings) &&
                arraysEqual(piece.errors, expected.errors),
            ),
          );
        },
        ThenLegacyProjectImportNotFoundErrorShouldBeReturned: async () => {
          const result = await sut.execute(query);

          expect(result).toMatchObject({ left: legacyProjectImportNotFound });
        },
        ThenForbiddenErrorShouldBeReturned: async () => {
          const result = await sut.execute(query);

          expect(result).toMatchObject({ left: forbiddenError });
        },
      };
    },
  };
};
