export interface Settings {
  PUNAME: string;
  SPECNAME: string;
  PUVSPRNAME: string;
  BOUNDNAME: string;
}

export type Assets = {
  url: string;
  relativeDestination: string;
}[];

/**
 * Take some arbitrary input and create relevant files structure for Marxan
 */
export abstract class InputFiles {
  abstract include(directory: string, assets: Assets): Promise<void>;
}
