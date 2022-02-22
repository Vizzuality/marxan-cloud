import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isRight } from 'fp-ts/lib/These';
import { Repository } from 'typeorm';
import { Project } from '../project.api.entity';

@Injectable()
export class MarxanBlockGuard implements BlockGuard {
  constructor(
    private readonly projectChecker: ProjectChecker,
    private readonly scenarioChecker: ScenarioChecker,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async ensureThatProjectIsNotBlocked(projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne(projectId);

    if (!project) {
      throw new NotFoundException(
        `Could not find project with ID: ${projectId}`,
      );
    }

    const [
      hasPendingExports,
      hasPendingImports,
      hasPendingBlmCalibration,
      hasPendingMarxanRun,
    ] = await Promise.all([
      this.projectChecker.hasPendingExports(projectId),
      this.projectChecker.hasPendingImports(projectId),
      this.projectChecker.hasPendingBlmCalibration(projectId),
      this.projectChecker.hasPendingMarxanRun(projectId),
    ]);

    if (isRight(hasPendingExports) && hasPendingExports.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending export`,
      );

    if (isRight(hasPendingImports) && hasPendingImports.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending import`,
      );

    if (isRight(hasPendingBlmCalibration) && hasPendingBlmCalibration.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending blm calibration`,
      );

    if (isRight(hasPendingMarxanRun) && hasPendingMarxanRun.right)
      throw new BadRequestException(
        `Project ${projectId} editing is blocked because of pending marxan run`,
      );
  }

  async ensureThatScenarioIsNotBlocked(scenarioId: string): Promise<void> {
    const scenario = await this.scenarioRepo.findOne(scenarioId);

    if (!scenario) {
      throw new NotFoundException(
        `Could not find scenario with ID: ${scenarioId}`,
      );
    }

    const [
      hasPendingBlmCalibration,
      hasPendingMarxanRun,
      hasPendingExports,
      hasPendingImports,
      projectHasPendingExports,
      projectHasPendingImports,
    ] = await Promise.all([
      this.scenarioChecker.hasPendingBlmCalibration(scenarioId),
      this.scenarioChecker.hasPendingMarxanRun(scenarioId),
      this.scenarioChecker.hasPendingExport(scenarioId),
      this.scenarioChecker.hasPendingImport(scenarioId),
      this.projectChecker.hasPendingExports(scenario.projectId),
      this.projectChecker.hasPendingImports(scenario.projectId),
    ]);

    if (isRight(hasPendingExports) && hasPendingExports.right)
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of pending export`,
      );

    if (isRight(hasPendingImports) && hasPendingImports.right)
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of pending import`,
      );

    if (isRight(hasPendingBlmCalibration) && hasPendingBlmCalibration.right)
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of pending blm calibration`,
      );

    if (isRight(hasPendingMarxanRun) && hasPendingMarxanRun.right)
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of pending marxan run`,
      );

    if (isRight(projectHasPendingExports) && projectHasPendingExports.right)
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of project pending export`,
      );

    if (isRight(projectHasPendingImports) && projectHasPendingImports.right)
      throw new BadRequestException(
        `Scenario ${scenarioId} editing is blocked because of project pending import`,
      );
  }
}
