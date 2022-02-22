import {
  ScenarioChecker,
  scenarioDoesntExist,
  ScenarioDoesntExist,
} from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';

@Injectable()
export class ScenarioCheckerFake implements ScenarioChecker {
  private scenarioWithPendingExports: string[];
  private scenarioWithPendingBlmCalibration: string[];
  private scenarioWithPendingMarxanRun: string[];
  private scenarioWithPendingImports: string[];

  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
  ) {
    this.scenarioWithPendingExports = [];
    this.scenarioWithPendingBlmCalibration = [];
    this.scenarioWithPendingMarxanRun = [];
    this.scenarioWithPendingImports = [];
  }

  async hasPendingBlmCalibration(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenario = await this.scenarioRepo.findOne(scenarioId);
    if (!scenario) return left(scenarioDoesntExist);

    return right(this.scenarioWithPendingBlmCalibration.includes(scenarioId));
  }

  async hasPendingMarxanRun(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenario = await this.scenarioRepo.findOne(scenarioId);
    if (!scenario) return left(scenarioDoesntExist);

    return right(this.scenarioWithPendingMarxanRun.includes(scenarioId));
  }

  async hasPendingImport(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenario = await this.scenarioRepo.findOne(scenarioId);
    if (!scenario) return left(scenarioDoesntExist);

    return right(this.scenarioWithPendingImports.includes(scenarioId));
  }

  async hasPendingExport(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenario = await this.scenarioRepo.findOne(scenarioId);
    if (!scenario) return left(scenarioDoesntExist);

    return right(this.scenarioWithPendingExports.includes(scenarioId));
  }

  addPendingExportForScenario(scenarioId: string) {
    this.scenarioWithPendingExports.push(scenarioId);
  }

  addPendingImportForScenario(scenarioId: string) {
    this.scenarioWithPendingImports.push(scenarioId);
  }

  addPendingBlmCalibrationForScenario(scenarioId: string) {
    this.scenarioWithPendingBlmCalibration.push(scenarioId);
  }

  addPendingMarxanRunForScenario(scenarioId: string) {
    this.scenarioWithPendingMarxanRun.push(scenarioId);
  }

  clear() {
    this.scenarioWithPendingExports = [];
    this.scenarioWithPendingBlmCalibration = [];
    this.scenarioWithPendingMarxanRun = [];
    this.scenarioWithPendingImports = [];
  }
}
