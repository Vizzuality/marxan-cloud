import { PromiseType } from 'utility-types';
import { v4 } from 'uuid';

import {
  OutputProjectSummariesService,
  outputProjectSummaryFilename,
  outputProjectSummaryFolder,
  outputProjectSummaryScenariosFilename,
} from '@marxan-api/modules/projects/output-project-summaries/output-project-summaries.service';
import { EntityManager, Repository } from 'typeorm';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { parseStream } from 'fast-csv';
import { Readable } from 'stream';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { bootstrapApplication } from '../utils/api-application';
import { GivenScenarioPuData } from '../../../geoprocessing/test/steps/given-scenario-pu-data-exists';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { Parse, ParseStream } from 'unzipper';
import { GivenProjectsPu } from '../../../geoprocessing/test/steps/given-projects-pu-exists';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe('when generating output summary metadata for a project', () => {
  const scenarioPuDataForScenario1 = [
    { puid: 1, includedCount: 5, values: [true, true, true, true, true] },
    { puid: 2, includedCount: 2, values: [false, false, true, false, true] },
    { puid: 3, includedCount: 1, values: [false, false, true, false, false] },
    {
      puid: 4,
      includedCount: 0,
      values: [false, false, false, false, false],
    },
    { puid: 5, includedCount: 4, values: [true, true, true, false, true] },
  ];
  const scenarioRunResultsForScenario1 = [
    { runNumber: 1, best: false },
    { runNumber: 2, best: false },
    { runNumber: 3, best: false },
    { runNumber: 4, best: false },
    { runNumber: 5, best: true },
  ];
  const scenarioPuDataForScenario2 = [
    { puid: 1, includedCount: 4, values: [false, true, true, false, true] },
    { puid: 2, includedCount: 2, values: [false, false, true, false, true] },
    { puid: 3, includedCount: 2, values: [false, true, true, false, false] },
    {
      puid: 4,
      includedCount: 1,
      values: [true, false, false, false, false],
    },
    { puid: 5, includedCount: 3, values: [true, true, false, false, false] },
  ];
  const scenarioRunResultsForScenario2 = [
    { runNumber: 1, best: true },
    { runNumber: 2, best: false },
    { runNumber: 3, best: false },
    { runNumber: 4, best: false },
    { runNumber: 5, best: false },
  ];

  const marxanSummaryDataForProject = [
    {
      puid: '1',
      S001_best: 'true',
      S001_ssoln: '5',
      S002_best: 'false',
      S002_ssoln: '4',
    },
    {
      puid: '2',
      S001_best: 'true',
      S001_ssoln: '2',
      S002_best: 'false',
      S002_ssoln: '2',
    },
    {
      puid: '3',
      S001_best: 'false',
      S001_ssoln: '1',
      S002_best: 'false',
      S002_ssoln: '2',
    },
    {
      puid: '4',
      S001_best: 'false',
      S001_ssoln: '0',
      S002_best: 'true',
      S002_ssoln: '1',
    },
    {
      puid: '5',
      S001_best: 'true',
      S001_ssoln: '4',
      S002_best: 'true',
      S002_ssoln: '3',
    },
  ];

  it('should generate zip files', async () => {
    // This test will arrange 2 scenarios, with 5 runs, and 5 Planning Units
    const projectId = await fixtures.GivenProjectExistsOnAPI('project');
    const scenario1Id = await fixtures.GivenScenarioExistsOnAPI(
      'scenario1Name',
      projectId,
    );
    const scenario2Id = await fixtures.GivenScenarioExistsOnAPI(
      'scenario2Name',
      projectId,
    );

    const scenarioIdToNameMapping = [
      {
        projectScenarioId: '001',
        uuid: scenario1Id,
        name: 'scenario1Name',
      },
      {
        projectScenarioId: '002',
        uuid: scenario2Id,
        name: 'scenario2Name',
      },
    ];

    const projectPus = await fixtures.GivenProjectPuDataExists(projectId);
    await fixtures.GivenScenarioPuDataExists(
      projectId,
      scenario1Id,
      projectPus,
    );
    await fixtures.GivenScenarioPuDataExists(
      projectId,
      scenario2Id,
      projectPus,
    );

    await fixtures.GivenOutputScenarioPuDataExists(
      projectId,
      scenario1Id,
      scenarioPuDataForScenario1,
    );
    await fixtures.GivenOutputScenarioResultsExists(
      projectId,
      scenario1Id,
      scenarioRunResultsForScenario1,
    );

    await fixtures.GivenOutputScenarioPuDataExists(
      projectId,
      scenario2Id,
      scenarioPuDataForScenario2,
    );
    await fixtures.GivenOutputScenarioResultsExists(
      projectId,
      scenario2Id,
      scenarioRunResultsForScenario2,
    );

    await fixtures.WhenSavingOutputMetadataForProject(scenario1Id);

    const summaryEntity = await fixtures.ThenOutputSummaryForProjectIsPersisted(
      projectId,
    );

    await fixtures.ThenSummaryCSVWasProperlyGenerated(
      summaryEntity,
      marxanSummaryDataForProject,
    );
    await fixtures.ThenScenariosCSVWasProperlyGenerated(
      summaryEntity,
      scenarioIdToNameMapping,
    );
  });

  it('should generate zip files for any subsequent scenario runs', async () => {
    // This test will arrange 2 scenarios, with 5 runs, and 5 Planning Units
    const projectId = await fixtures.GivenProjectExistsOnAPI('project');
    const scenario1Id = await fixtures.GivenScenarioExistsOnAPI(
      'scenario1Name',
      projectId,
    );
    const scenario2Id = await fixtures.GivenScenarioExistsOnAPI(
      'scenario2Name',
      projectId,
    );

    const scenarioIdToNameMapping = [
      {
        projectScenarioId: '001',
        uuid: scenario1Id,
        name: 'scenario1Name',
      },
      {
        projectScenarioId: '002',
        uuid: scenario2Id,
        name: 'scenario2Name',
      },
    ];

    const projectPus = await fixtures.GivenProjectPuDataExists(projectId);
    await fixtures.GivenScenarioPuDataExists(
      projectId,
      scenario1Id,
      projectPus,
    );
    await fixtures.GivenScenarioPuDataExists(
      projectId,
      scenario2Id,
      projectPus,
    );

    await fixtures.GivenOutputScenarioPuDataExists(
      projectId,
      scenario1Id,
      scenarioPuDataForScenario1,
    );
    await fixtures.GivenOutputScenarioResultsExists(
      projectId,
      scenario1Id,
      scenarioRunResultsForScenario1,
    );

    await fixtures.GivenOutputScenarioPuDataExists(
      projectId,
      scenario2Id,
      scenarioPuDataForScenario2,
    );
    await fixtures.GivenOutputScenarioResultsExists(
      projectId,
      scenario2Id,
      scenarioRunResultsForScenario2,
    );

    // Simulate saving output metadata after running a scenario
    await fixtures.WhenSavingOutputMetadataForProject(scenario1Id);

    const summaryEntityRun1 = await fixtures.ThenOutputSummaryForProjectIsPersisted(
      projectId,
    );

    await fixtures.ThenSummaryCSVWasProperlyGenerated(
      summaryEntityRun1,
      marxanSummaryDataForProject,
    );
    await fixtures.ThenScenariosCSVWasProperlyGenerated(
      summaryEntityRun1,
      scenarioIdToNameMapping,
    );

    // Simulate saving output metadata after running a scenario again (or another scenario)
    await fixtures.WhenSavingOutputMetadataForProject(scenario1Id);

    const summaryEntityRun2 = await fixtures.ThenOutputSummaryForProjectIsPersisted(
      projectId,
    );

    await fixtures.ThenSummaryCSVWasProperlyGenerated(
      summaryEntityRun2,
      marxanSummaryDataForProject,
    );
    await fixtures.ThenScenariosCSVWasProperlyGenerated(
      summaryEntityRun2,
      scenarioIdToNameMapping,
    );
  });
});

const NUMBER_OF_PU_IN_SAMPLE = 5;

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const apiEntityManager = app.get<EntityManager>(getEntityManagerToken());
  const geoEntityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );

  const outputSummaryService = app.get<OutputProjectSummariesService>(
    OutputProjectSummariesService,
  );
  const scenarioRepo = app.get<Repository<Scenario>>(
    getRepositoryToken(Scenario),
  );
  const projectRepo = app.get<Repository<Project>>(getRepositoryToken(Project));
  const organizationRepo = app.get<Repository<Organization>>(
    getRepositoryToken(Organization),
  );

  return {
    cleanup: async () => {
      const clearTable = async (em: EntityManager, tableName: string) => {
        await em.createQueryBuilder().delete().from(tableName).execute();
      };

      await scenarioRepo.delete({});
      await projectRepo.delete({});
      await organizationRepo.delete({});

      await clearTable(geoEntityManager, 'output_scenarios_pu_data');
      await clearTable(geoEntityManager, 'features_data');
      await clearTable(geoEntityManager, 'scenarios_pu_data');
      await clearTable(geoEntityManager, 'projects_pu');
      await clearTable(geoEntityManager, 'planning_units_geom');
      await app.close();
    },

    GivenProjectExistsOnAPI: async (name: string) => {
      const orgId = v4();
      const projectId = v4();

      await organizationRepo.insert({ name: 'org', id: orgId });
      await projectRepo.insert({ id: projectId, name, organizationId: orgId });
      return projectId;
    },
    GivenScenarioExistsOnAPI: async (name: string, projectId: string) => {
      const id = v4();
      await scenarioRepo.insert({ id, name, projectId });
      return id;
    },

    GivenProjectPuDataExists: async (projectId: string) => {
      return GivenProjectsPu(
        geoEntityManager,
        projectId,
        NUMBER_OF_PU_IN_SAMPLE,
      );
    },
    GivenScenarioPuDataExists: async (
      projectId: string,
      scenarioId: string,
      projectPus: ProjectsPuEntity[],
    ) => {
      return GivenScenarioPuData(
        geoEntityManager,
        projectId,
        scenarioId,
        projectPus,
      );
    },
    GivenOutputScenarioPuDataExists: async (
      projectId: string,
      scenarioId: string,
      outputData: { puid: number; includedCount: number; values: boolean[] }[],
    ) => {
      for (const { puid, includedCount, values } of outputData) {
        const [{ scenarioPuId }] = await geoEntityManager
          .createQueryBuilder()
          .select('spd.id', 'scenarioPuId')
          .from('scenarios_pu_data', 'spd')
          .leftJoin('projects_pu', 'pp', 'pp.id = spd.project_pu_id')
          .where('spd.scenario_id = :scenarioId AND pp.puid = :puid', {
            scenarioId,
            projectId,
            puid,
          })
          .execute();
        if (!scenarioPuId) {
          fail('No Scenario Pu Data was found');
        }

        await geoEntityManager
          .createQueryBuilder()
          .insert()
          .into('output_scenarios_pu_data')
          .values({
            scenarioPuId,
            includedCount,
            values,
          })
          .execute();
      }
    },
    GivenOutputScenarioResultsExists: async (
      projectId: string,
      scenarioId: string,
      summaryData: { runNumber: number; best: boolean }[],
    ) => {
      const insertValues = summaryData.map(({ runNumber, best }) => ({
        scenarioId,
        runId: runNumber,
        best,
      }));

      await apiEntityManager.insert('output_scenarios_summaries', insertValues);
    },

    WhenSavingOutputMetadataForProject: async (scenarioId: string) => {
      await outputSummaryService.saveSummaryForProjectOfScenario(scenarioId);
    },

    ThenOutputSummaryForProjectIsPersisted: async (projectId: string) => {
      const [
        outputSummary,
      ] = await apiEntityManager
        .createQueryBuilder()
        .select()
        .from('output_project_summaries', 's')
        .where(`s.project_id = '${projectId}'`)
        .execute();

      if (!outputSummary) {
        fail(`Output Summary was not saved for project ${projectId}`);
      }
      return outputSummary;
    },
    ThenSummaryCSVWasProperlyGenerated: async (
      summaryEntity: any,
      data: any[],
    ) => {
      const csvContent = await extractFileFromZip(
        Readable.from(summaryEntity.summary_zipped_data),
        `${outputProjectSummaryFolder}${outputProjectSummaryFilename}`,
      );
      await ThenOutputCSVWasProperlyGenerated(csvContent, data);
    },
    ThenScenariosCSVWasProperlyGenerated: async (
      summaryEntity: any,
      data: any[],
    ) => {
      const csvContent = await extractFileFromZip(
        Readable.from(summaryEntity.summary_zipped_data),
        `${outputProjectSummaryFolder}${outputProjectSummaryScenariosFilename}`,
      );
      await ThenOutputCSVWasProperlyGenerated(csvContent, data);
    },
  };
};

async function ThenOutputCSVWasProperlyGenerated(
  csvContent: Buffer,
  data: any[],
) {
  const csvStream = parseStream(Readable.from(csvContent), {
    headers: true,
    objectMode: true,
  });

  const csvRows = await new Promise((resolve, reject) => {
    const contents: any[] = [];
    csvStream.on('data', (chunk) => {
      contents.push(chunk);
    });
    csvStream.on('error', (err) => {
      reject(err);
    });
    csvStream.on('finish', () => {
      resolve(contents);
    });
  });
  expect(csvRows).toEqual(data);
}

async function extractFileFromZip(zipStream: Readable, pathToExtract: string) {
  const unzippedStream: ParseStream = zipStream.pipe(
    Parse({ forceStream: true }),
  );
  for await (const entry of unzippedStream) {
    if (entry.type === 'File' && entry.path === pathToExtract) {
      return entry.buffer();
    } else {
      entry.autodrain();
    }
  }

  fail(`${pathToExtract} could not be found inside zip file`);
}
