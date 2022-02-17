import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';
import { In, Repository } from 'typeorm';
import { Scenario } from '../scenario.api.entity';
import {
  ScenarioChecker,
  scenarioDoesntExist,
  ScenarioDoesntExist,
} from './scenario-checker.service';

@Injectable()
export class MarxanScenarioChecker implements ScenarioChecker {
  constructor(
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
  ) {}

  async hasPendingImport(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenarioExist = await this.checkScenarioExists(scenarioId);

    if (!scenarioExist) return left(scenarioDoesntExist);

    const importEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: scenarioId,
        kind: In([
          API_EVENT_KINDS.scenario__import__finished__v1__alpha,
          API_EVENT_KINDS.scenario__import__failed__v1__alpha,
          API_EVENT_KINDS.scenario__import__submitted__v1__alpha,
        ]),
      })
      .catch(this.createNotFoundHandler());

    const pendingImport =
      importEvent?.kind ===
      API_EVENT_KINDS.scenario__import__submitted__v1__alpha;

    return right(pendingImport);
  }

  async hasPendingExport(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenarioExist = await this.checkScenarioExists(scenarioId);

    if (!scenarioExist) return left(scenarioDoesntExist);

    const exportEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: scenarioId,
        kind: In([
          API_EVENT_KINDS.scenario__export__finished__v1__alpha,
          API_EVENT_KINDS.scenario__export__failed__v1__alpha,
          API_EVENT_KINDS.scenario__export__submitted__v1__alpha,
        ]),
      })
      .catch(this.createNotFoundHandler());

    const pendingExport =
      exportEvent?.kind ===
      API_EVENT_KINDS.scenario__export__submitted__v1__alpha;

    return right(pendingExport);
  }

  async hasPendingBlmCalibration(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenarioExist = await this.checkScenarioExists(scenarioId);

    if (!scenarioExist) return left(scenarioDoesntExist);

    const blmCalibrationEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: scenarioId,
        kind: In([
          API_EVENT_KINDS.scenario__calibration__finished_v1_alpha1,
          API_EVENT_KINDS.scenario__calibration__failed_v1_alpha1,
          API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1,
        ]),
      })
      .catch(this.createNotFoundHandler());

    const pendingBlmCalibration =
      blmCalibrationEvent?.kind ===
      API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1;

    return right(pendingBlmCalibration);
  }

  async hasPendingMarxanRun(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>> {
    const scenarioExist = await this.checkScenarioExists(scenarioId);

    if (!scenarioExist) return left(scenarioDoesntExist);

    const marxanRunEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: scenarioId,
        kind: In([
          API_EVENT_KINDS.scenario__run__outputSaved__v1__alpha1,
          API_EVENT_KINDS.scenario__run__outputSaveFailed__v1__alpha1,
          API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
          API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
        ]),
      })
      .catch(this.createNotFoundHandler());

    const pendingMarxanRun =
      marxanRunEvent?.kind ===
      API_EVENT_KINDS.scenario__run__submitted__v1__alpha1;

    return right(pendingMarxanRun);
  }

  private createNotFoundHandler() {
    return (error: unknown) => {
      if (!(error instanceof NotFoundException)) throw error;
      return undefined;
    };
  }

  private async checkScenarioExists(scenarioId: string): Promise<boolean> {
    const scenario = await this.scenarioRepo.findOne(scenarioId);

    return Boolean(scenario);
  }
}
