export type Assets = {
  url: string;
  relativeDestination: string;
}[];

export type JobData = {
  scenarioId: string;
  assets: Assets;
  blmValues: number[];
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
