export interface CalibrationRunResult {
  id: string;
  scenarioId: string;
  blmValue: number;
  cost: number;
  boundaryLength: number;
}

export abstract class ScenarioCalibrationRepo {
  abstract getScenarioCalibrationResults(
    scenarioId: string,
  ): Promise<CalibrationRunResult[]>;
}
