import {
  CalibrationRunResult,
  ScenarioCalibrationRepo,
} from '../../src/modules/blm/values/scenario-calibration-repo';

export class FakeScenarioCalibrationRepo implements ScenarioCalibrationRepo {
  fakeCalibrationResults = [
    {
      id: '94764a29-a80b-447f-af8d-197ac437b2c4',
      scenarioId: undefined,
      blmValue: 0.001,
      cost: 0,
      boundaryLength: 2227.42,
    },
    {
      id: '09433ca9-50e0-460a-8a42-c0fb09c109f4',
      scenarioId: undefined,
      blmValue: 20.0008,
      cost: 0,
      boundaryLength: 2227.42,
    },
    {
      id: '4dc767c4-6022-4337-9b2a-57a4248aca45',
      scenarioId: undefined,
      blmValue: 40.0006,
      cost: 0,
      boundaryLength: 2227.42,
    },
    {
      id: '201c5d61-9baf-4d1f-a938-ad7e9d41d216',
      scenarioId: undefined,
      blmValue: 60.0004,
      cost: 0,
      boundaryLength: 2227.42,
    },
    {
      id: '50e2afed-5359-45c8-864d-38bd23a1897a',
      scenarioId: undefined,
      blmValue: 80.0002,
      cost: 0,
      boundaryLength: 2227.42,
    },
    {
      id: '48dcc6a4-d860-43eb-8f26-a0d3f56f5258',
      scenarioId: undefined,
      blmValue: 100,
      cost: 0,
      boundaryLength: 2227.42,
    },
  ];

  async getScenarioCalibrationResults(
    scenarioId: string,
  ): Promise<CalibrationRunResult[]> {
    return this.fakeCalibrationResults.map((result) => ({
      ...result,
      scenarioId,
    }));
  }
}
