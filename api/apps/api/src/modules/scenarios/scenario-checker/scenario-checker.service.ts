import { Either } from 'fp-ts/lib/Either';

export const scenarioDoesntExist = Symbol(`scenario doesn't exist`);
export type ScenarioDoesntExist = typeof scenarioDoesntExist;

export abstract class ScenarioChecker {
  abstract hasPendingBlmCalibration(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>>;

  abstract hasPendingMarxanRun(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>>;

  abstract hasPendingImport(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>>;

  abstract hasPendingExport(
    scenarioId: string,
  ): Promise<Either<ScenarioDoesntExist, boolean>>;
}
