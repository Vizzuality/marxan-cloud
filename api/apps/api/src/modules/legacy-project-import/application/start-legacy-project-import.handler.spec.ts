import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import {
  Project,
  ProjectSourcesEnum,
} from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ResourceId } from '@marxan/cloning/domain';

import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft, isRight, Right } from 'fp-ts/Either';
import { DeepPartial } from 'typeorm';

import { v4 } from 'uuid';
import { LegacyProjectImportStatuses } from '../domain/legacy-project-import/legacy-project-import-status';

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

it(`creates a start legacy project import with description`, async () => {
  const description = 'random description';
  fixtures.GivenProjectAndScenarioShells();
  const result = await fixtures.WhenStartingLegacyProjectImport(description);
  await fixtures.ThenAStartingLegacyProjectImportIsCreated(result, description);
});

it(`creates a start legacy project import with out description`, async () => {
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
  let saveProjectData: DeepPartial<Project>;

  const sut = sandbox.get(StartLegacyProjectImportHandler);
  const repo: LegacyProjectImportMemoryRepository = sandbox.get(
    LegacyProjectImportRepository,
  );

  const expectedSaveProjectData: (
    description?: string,
  ) => DeepPartial<Project> = (description?: string) => ({
    name: 'random project name',
    description: description,
    organizationId: randomOrganizationId,
    sources: ProjectSourcesEnum.legacyImport,
    createdBy: ownerId.value,
  });

  return {
    GivenProjectAndScenarioShells: () => {
      findRandomOrganizationMock.mockResolvedValue([
        {
          id: randomOrganizationId,
        },
      ]);
      saveProjectMock.mockImplementation((data: DeepPartial<Project>) => {
        saveProjectData = data;
        return { id: projectShellId };
      });
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
    WhenStartingLegacyProjectImport: (description?: string) => {
      return sut.execute(
        new StartLegacyProjectImport(
          'random project name',
          ownerId,
          description,
        ),
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
      description?: string,
    ) => {
      expect(result).toBeDefined();
      if (isLeft(result))
        throw new Error('should have created a starting project import');

      const { projectId, scenarioId } = result.right;
      expect(projectId.value).toEqual(projectShellId);
      expect(scenarioId.value).toEqual(scenarioShellId);

      expect(saveProjectData).toEqual(expectedSaveProjectData(description));

      const savedLegacyProjectImport = await repo.find(
        new ResourceId(projectShellId),
      );
      expect(savedLegacyProjectImport).toBeDefined();
      if (isLeft(savedLegacyProjectImport))
        throw new Error('cant find the new starting project import');

      const legacyProjectImport = savedLegacyProjectImport.right;
      expect(legacyProjectImport.areRequiredFilesUploaded()).toEqual(false);

      const legacyProjectImportSnapshot = legacyProjectImport.toSnapshot();
      expect(legacyProjectImportSnapshot.status).toEqual(
        LegacyProjectImportStatuses.AcceptingFiles,
      );
      expect(legacyProjectImportSnapshot.ownerId).toEqual(ownerId.value);
      expect(legacyProjectImportSnapshot.files).toEqual([]);
      expect(legacyProjectImportSnapshot.pieces).toEqual([]);
      expect(legacyProjectImportSnapshot.projectId).toEqual(projectShellId);
      expect(legacyProjectImportSnapshot.scenarioId).toEqual(scenarioShellId);
      expect(legacyProjectImportSnapshot.toBeRemoved).toEqual(false);
    },
  };
};
