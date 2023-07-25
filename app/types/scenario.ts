import { Job } from 'types/job';

export interface Scenario {
  id: string;
  projectId: number;
  boundaryLengthModifier: number;
  description: string;
  jobs?: Record<string, any>[];
  lastUpdate: string;
  lock?: Record<string, any>;
  lastUpdateDistance: string;
  name: string;
  numberOfRuns: number;
  metadata: {
    marxanInputParameterFile: {
      BESTSCORE: number;
      BLM: number;
      CLUMPTYPE: number;
      COOLFAC: number;
      COSTTHRESH: number;
      HEURTYPE: number;
      ITIMPTYPE: number;
      MISSLEVEL: number;
      NUMITNS: number;
      NUMREPS: number;
      NUMTEMP: number;
      PROP: number;
      RANDSEED: number;
      RUNMODE: number;
      STARTTEMP: number;
      THRESHPEN1: number;
      THRESHPEN2: number;
      VERBOSITY: number;
    };
    scenarioEditingMetadata: any;
  };
  progress?: number;
  projectScenarioId?: number;
  protectedAreaFilterByIds?: number[];
  ranAtLeastOnce: boolean;
  runStatus: Job['status'];
  solutionsAreLocked: boolean;
  wdpaIucnCategories: string[];
  wdpaThreshold: number;
}
