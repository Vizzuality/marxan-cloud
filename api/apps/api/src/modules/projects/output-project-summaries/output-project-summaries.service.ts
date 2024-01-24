import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { BestSolutionDataService } from '@marxan-api/modules/projects/output-project-summaries/solution-data/best-solution-data.service';
import { SummedSolutionDataService } from '@marxan-api/modules/projects/output-project-summaries/solution-data/summed-solution-data.service';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { CsvFormatterStream, FormatterRow, write } from 'fast-csv';
import { execSync } from 'child_process';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { pipeline } from 'stream/promises';
import { join as joinPath } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { mkdir, rm } from 'fs/promises';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { OutputProjectSummaryApiEntity } from '@marxan-api/modules/projects/output-project-summaries/output-project-summary.api.entity';

export const outputProjectSummaryNotFound = Symbol(
  'output project summary not found',
);

export const outputProjectSummaryFolder = 'output-project-summary/';
export const outputProjectSummaryFilename = 'summary.csv';
export const outputProjectSummaryScenariosFilename = 'scenarios.csv';

@Injectable()
export class OutputProjectSummariesService {
  private readonly logger = new Logger(OutputProjectSummariesService.name);

  constructor(
    private readonly bestSolutionsDataService: BestSolutionDataService,
    private readonly summedSolutionsDataService: SummedSolutionDataService,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    @InjectRepository(ProjectsPuEntity, DbConnections.geoprocessingDB)
    private readonly projectsPU: Repository<ProjectsPuEntity>,
    @InjectRepository(OutputProjectSummaryApiEntity)
    private readonly outputSummaryRepo: Repository<OutputProjectSummaryApiEntity>,
  ) {}

  async getOutputSummaryForProject(
    projectId: string,
  ): Promise<OutputProjectSummaryApiEntity | null> {
    return this.outputSummaryRepo.findOne({ where: { projectId } });
  }

  async saveSummaryForProjectOfScenario(scenarioId: string): Promise<void> {
    const { projectId } = await this.scenarioRepo.findOneOrFail({
      where: { id: scenarioId },
    });

    const planningUnits = (
      await this.projectsPU.find({ where: { projectId } })
    ).map((pu) => pu.puid);
    const scenarios = await this.scenarioRepo.find({
      select: { id: true, projectScenarioId: true, name: true },
      where: { projectId, ranAtLeastOnce: true },
    });

    const bestSolutionData =
      await this.getBestSolutionDataForScenarios(scenarios);
    const summedSolutionData =
      await this.getSummedSolutionDataForScenarios(scenarios);

    const workingDirectory =
      OutputProjectSummariesService.getProjectTempFolder(projectId);
    const csvPath = joinPath(workingDirectory, outputProjectSummaryFolder);
    await this.createCSVFolder(csvPath);

    const summaryCSVStream = this.arrangeSummaryCSV(
      planningUnits,
      scenarios,
      bestSolutionData,
      summedSolutionData,
    );
    const scenarioCSVStream = this.arrangeScenariosCSV(scenarios);

    await this.writeCSV(
      workingDirectory,
      outputProjectSummaryFilename,
      summaryCSVStream,
    );
    await this.writeCSV(
      workingDirectory,
      outputProjectSummaryScenariosFilename,
      scenarioCSVStream,
    );

    const zipFullPath = this.zipCSVs(projectId, workingDirectory);

    await this.saveSummary(projectId, zipFullPath);

    await this.cleanupProjectTempFolder(projectId);
  }

  private arrangeSummaryCSV(
    planningUnits: number[],
    scenarios: Scenario[],
    bestSolutionData: ProjectScenarioBestSolutionMapping,
    summedSolutionData: ProjectScenarioSummedSolutionMapping,
  ): CsvFormatterStream<FormatterRow, FormatterRow> {
    const projectScenarioIds = scenarios
      .map((scenario) => scenario.projectScenarioId)
      .sort((a, b) => a - b);

    // The headers of the CSV file is dependent on the set of scenarios for the project
    // it needs to be preocomputed in ascending order
    // The CSV rows will also be sorted in ascending order by puid
    // Headers will follow this format: puid, Snnn_best, Snnn_ssoln, Snnn_best, Snnn_ssoln....
    // a set of 2 column per each scenario, with nnn being the projectScenarioId (within the project)
    // keep in mind that the projectScenarioId might have gaps in the sequence
    const headers = [];
    headers.push('puid');
    for (const projectScenarioId of projectScenarioIds) {
      const scenarioId = this.formatProjectScenarioId(projectScenarioId);
      headers.push(`S${scenarioId}_best`);
      headers.push(`S${scenarioId}_ssoln`);
    }

    const csvData = [];
    csvData.push(headers);
    for (const planningUnit of [...planningUnits].sort((a, b) => a - b)) {
      const row = [planningUnit];

      for (const projectScenarioId of projectScenarioIds) {
        row.push(bestSolutionData[projectScenarioId][planningUnit]);
        row.push(summedSolutionData[projectScenarioId][planningUnit]);
      }

      csvData.push(row);
    }

    return write(csvData, {
      headers: true,
      writeHeaders: true,
      includeEndRowDelimiter: true,
    });
  }

  private arrangeScenariosCSV(
    scenarios: Scenario[],
  ): CsvFormatterStream<FormatterRow, FormatterRow> {
    let csvData: any[][] = [];
    const headers = ['projectScenarioId', 'uuid', 'name'];

    csvData.push(headers);
    csvData = csvData.concat(
      [...scenarios]
        .sort((a, b) => a.projectScenarioId - b.projectScenarioId)
        .map((scenario) => [
          this.formatProjectScenarioId(scenario.projectScenarioId),
          scenario.id,
          scenario.name,
        ]),
    );

    return write(csvData, {
      headers: true,
      writeHeaders: true,
      includeEndRowDelimiter: true,
    });
  }

  private async writeCSV(
    workingDirectory: string,
    csvFileName: string,
    csvData: CsvFormatterStream<FormatterRow, FormatterRow>,
  ) {
    const metadataFolder = joinPath(
      workingDirectory,
      outputProjectSummaryFolder,
      csvFileName,
    );

    const csvFileWriteStream = createWriteStream(metadataFolder);
    await pipeline(csvData, csvFileWriteStream);
  }

  private zipCSVs(projectId: string, workingDirectory: string): string {
    const zipFileName = OutputProjectSummariesService.zipFilename(projectId);
    const command = `zip -r ${zipFileName} ${outputProjectSummaryFolder}`;

    execSync(command, { cwd: workingDirectory });

    const zipFullPath = joinPath(workingDirectory, zipFileName);
    this.logger.log(`Project Summary CSVs zipped on ${zipFullPath}`);

    return zipFullPath;
  }

  private async getBestSolutionDataForScenarios(
    scenarios: Scenario[],
  ): Promise<ProjectScenarioBestSolutionMapping> {
    const data = await Promise.all(
      scenarios.map(async ({ id, projectScenarioId }) => {
        const bestsolutionData =
          await this.bestSolutionsDataService.getBestSolutionData(id);
        const dataMapping = bestsolutionData.reduce(
          (acc, { planning_unit, selected }) => {
            acc[planning_unit] = selected;
            return acc;
          },
          {} as PlanningUnitBestSolutionMapping,
        );

        return { projectScenarioId, dataMapping };
      }),
    );

    return data.reduce((acc, { projectScenarioId, dataMapping }) => {
      acc[projectScenarioId] = dataMapping;
      return acc;
    }, {} as ProjectScenarioBestSolutionMapping);
  }

  private async getSummedSolutionDataForScenarios(
    scenarios: Scenario[],
  ): Promise<ProjectScenarioSummedSolutionMapping> {
    const data = await Promise.all(
      scenarios.map(async ({ id, projectScenarioId }) => {
        const solutionData = (
          await this.summedSolutionsDataService.getSummedSolutionsData(id)
        ).reduce((acc, { planning_unit, included_count }) => {
          acc[planning_unit] = included_count;
          return acc;
        }, {} as PlanningUnitSummedSolutionMapping);

        return { projectScenarioId, solutionData };
      }),
    );

    return data.reduce((acc, { projectScenarioId, solutionData }) => {
      acc[projectScenarioId] = solutionData;
      return acc;
    }, {} as ProjectScenarioSummedSolutionMapping);
  }

  private async saveSummary(
    projectId: string,
    summaryZipFullPath: string,
  ): Promise<void> {
    await this.outputSummaryRepo.upsert(
      this.outputSummaryRepo.create({
        projectId,
        summaryZippedData: readFileSync(summaryZipFullPath),
      }),
      ['projectId'],
    );
  }

  private formatProjectScenarioId(projectScenarioId: number): string {
    return String(projectScenarioId).padStart(3, '0');
  }

  static zipFilename(projectId: string) {
    return `summary-output-${projectId}.zip`;
  }

  static getProjectTempFolder(projectId: string): string {
    const tmpFolder = AppConfig.get<string>(
      'storage.sharedFileStorage.',
      '/tmp',
    );
    return joinPath(tmpFolder, projectId);
  }

  private async createCSVFolder(pathToCreate: string): Promise<void> {
    if (!existsSync(pathToCreate)) {
      await mkdir(pathToCreate, { recursive: true });
    }
  }

  private async cleanupProjectTempFolder(projectId: string): Promise<void> {
    if (
      !AppConfig.getBoolean(
        'storage.sharedFileStorage.cleanupTemporaryFolders',
        true,
      )
    ) {
      return;
    }

    await rm(OutputProjectSummariesService.getProjectTempFolder(projectId), {
      recursive: true,
      force: true,
    });
  }
}

type ProjectScenarioBestSolutionMapping = Record<
  number,
  PlanningUnitBestSolutionMapping
>;
type ProjectScenarioSummedSolutionMapping = Record<
  number,
  PlanningUnitSummedSolutionMapping
>;
type PlanningUnitBestSolutionMapping = Record<number, 0 | 1>;
type PlanningUnitSummedSolutionMapping = Record<number, number>;
