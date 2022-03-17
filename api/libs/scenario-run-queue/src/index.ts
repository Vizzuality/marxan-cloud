import { hasProp } from "@marxan-api/utils/typesafe-has-prop.utils";

export const queueName = 'scenario-run-queue';
export type Assets = {
  url: string;
  relativeDestination: string;
}[];
export type JobData = {
  scenarioId: string;
  assets: Assets;
};
export type ProgressData =
  | {
      scenarioId: string;
      canceled: boolean;
    }
  | {
      scenarioId: string;
      fractionalProgress: number;
    };

export function assertIsProgressData(value: unknown): asserts value is ProgressData {
  if(
    !(hasProp(value, 'scenarioId' ) &&
      (hasProp(value, 'canceled') || hasProp(value, 'fractionalProgress'))
    )
  ) {
      throw new TypeError('Expected \'ProgressData\' type, but progress data does not match this type');
    }
}
