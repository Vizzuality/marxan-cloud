import { WebshotConfig } from '@marxan/webshot';

export type Assets = {
  url: string;
  relativeDestination: string;
}[];

export type JobData = {
  scenarioId: string;
  assets: Assets;
  blmValues: number[];
  config: WebshotConfig;
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
