export interface Scenario {
  id: string;
  name: string;
  warnings: boolean;
  progress?: number;
  lastUpdate: string;
  jobs?: Record<string, any>[];
  runStatus: 'created' | 'running' | 'done' | 'failure';
  lock?: Record<string, any>;
  lastUpdateDistance: string;
  className?: string;
  ranAtLeastOnce: boolean;
  numberOfRuns: number;
  boundaryLengthModifier: number;
  metadata: any;
  solutionsAreLocked: boolean;
  wdpaThreshold: number;
}
