import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ResourceId } from '@marxan/cloning/domain';

import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft, isRight, Right } from 'fp-ts/Either';

import { v4 } from 'uuid';

import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
  legacyProjectImportSaveError,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from '../infra/legacy-project-import-memory.repository';
import {
  createShellsFailed,
  StartLegacyProjectImport,
  StartLegacyProjectImportResponse,
} from './start-legacy-project-import.command';
import { StartLegacyProjectImportHandler } from './start-legacy-project-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`creates a start legacy project import`, async () => {
  fixtures.GivenProjectAndScenarioShells();
  const result = await fixtures.WhenStartingLegacyProjectImport();
  await fixtures.ThenAStartingLegacyProjectImportIsCreated(result);
});

it(`fails the creation of the project shell`, async () => {
  fixtures.GivenNoProjectShell();
  const result = await fixtures.WhenStartingLegacyProjectImport();
  await fixtures.ThenAStartingLegacyProjectIsNotCreated(result, {
    failSaveOperation: false,
  });
});

it(`fails to save a a start legacy project import`, async () => {
  fixtures.GivenProjectAndScenarioShells();
  fixtures.GivenSavingALegacyProjectImportFails();
  const result = await fixtures.WhenStartingLegacyProjectImport();
  await fixtures.ThenAStartingLegacyProjectIsNotCreated(result, {
    failSaveOperation: true,
  });
});

const getFixtures = async () => {
  const saveProjectMock = jest.fn();
  const saveScenarioMock = jest.fn();
  const findRandomOrganizationMock = jest.fn();

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      {
        provide: getRepositoryToken(Project),
        useValue: { save: saveProjectMock },
      },
      {
        provide: getRepositoryToken(Scenario),
        useValue: { save: saveScenarioMock },
      },
      {
        provide: getRepositoryToken(Organization),
        useValue: { find: findRandomOrganizationMock },
      },
      StartLegacyProjectImportHandler,
    ],
  }).compile();

  await sandbox.init();

  const ownerId = UserId.create();
  const randomOrganizationId = v4();
  const projectShellId = v4();
  const scenarioShellId = v4();

  const sut = sandbox.get(StartLegacyProjectImportHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );

  return {
    GivenProjectAndScenarioShells: () => {
      findRandomOrganizationMock.mockResolvedValue([
        {
          id: randomOrganizationId,
        },
      ]);
      saveProjectMock.mockResolvedValue({ id: projectShellId });
      saveScenarioMock.mockResolvedValue({ id: scenarioShellId });
    },
    GivenNoProjectShell: () => {
      findRandomOrganizationMock.mockResolvedValue([
        {
          id: randomOrganizationId,
        },
      ]);

      saveScenarioMock.mockResolvedValue({ id: scenarioShellId });
    },
    GivenSavingALegacyProjectImportFails: () => {
      repo.saveFailure = true;
    },
    WhenStartingLegacyProjectImport: () => {
      return sut.execute(
        new StartLegacyProjectImport('random project name', ownerId),
      );
    },
    ThenAStartingLegacyProjectIsNotCreated: async (
      result: StartLegacyProjectImportResponse,
      opts: { failSaveOperation: boolean },
    ) => {
      expect(result).toBeDefined();
      if (isRight(result)) throw new Error('the handler should have failed');

      expect(result.left).toEqual(
        opts.failSaveOperation
          ? legacyProjectImportSaveError
          : createShellsFailed,
      );

      const savedLegacyProjectImport = await repo.find(
        new ResourceId(projectShellId),
      );
      if (isRight(savedLegacyProjectImport))
        throw new Error(
          'should have failed before creating a starting project import',
        );
      expect(savedLegacyProjectImport.left).toEqual(
        legacyProjectImportNotFound,
      );
    },
    ThenAStartingLegacyProjectImportIsCreated: async (
      result: StartLegacyProjectImportResponse,
    ) => {
      expect(result).toBeDefined();
      if (isLeft(result))
        throw new Error('should have created a starting project import');

      const { projectId, scenarioId } = result.right;
      expect(projectId.value).toEqual(projectShellId);
      expect(scenarioId.value).toEqual(scenarioShellId);

      const savedLegacyProjectImport = await repo.find(
        new ResourceId(projectShellId),
      );
      expect(savedLegacyProjectImport).toBeDefined();
      if (isLeft(savedLegacyProjectImport))
        throw new Error('cant find the new starting project import');

      const legacyProjectImport = savedLegacyProjectImport.right;
      expect(legacyProjectImport.areRequiredFilesUploaded()).toEqual(false);

      const legacyProjectImportSnapshot = legacyProjectImport.toSnapshot();
      expect(legacyProjectImportSnapshot.isAcceptingFiles).toEqual(true);
      expect(legacyProjectImportSnapshot.ownerId).toEqual(ownerId.value);
      expect(legacyProjectImportSnapshot.files).toEqual([]);
      expect(legacyProjectImportSnapshot.pieces).toEqual([]);
      expect(legacyProjectImportSnapshot.projectId).toEqual(projectShellId);
      expect(legacyProjectImportSnapshot.scenarioId).toEqual(scenarioShellId);
    },
  };
};
