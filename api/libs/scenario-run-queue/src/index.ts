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
