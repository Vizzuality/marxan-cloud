export interface CalibrationRunResult {
  id: string;
  scenarioId: string;
  blmValue: number;
  score: number;
  boundaryLength: number;
}

export abstract class ScenarioCalibrationRepo {
  abstract getScenarioCalibrationResults(
    scenarioId: string,
  ): Promise<CalibrationRunResult[]>;
}
