import { SolutionRowResult } from './solution-row-result';

export interface SolutionsEvents {
  data(rows: SolutionRowResult[]): void;

  error(error: any): void;

  finish(): void;
}
