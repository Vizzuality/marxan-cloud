import { Job } from 'types/api/job';

import { CostSurface } from './cost-surface';

export interface Scenario {
  id: string;
  projectId: number;
  boundaryLengthModifier: number;
  description: string;
  jobs?: Record<string, any>[];
  lastUpdate: string;
  lock?: Record<string, any>;
  lastUpdateDistance: string;
  costSurface: {
    type: 'costSurfaces';
    id: CostSurface['id'];
    name: CostSurface['name'];
    isDefault: CostSurface['isDefault'];
  };
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
  // ! looks like this property does not come from the API but is added to the scenario at some point
  runStatus: Job['status'];
  solutionsAreLocked: boolean;
  wdpaIucnCategories: string[];
  wdpaThreshold: number;
  lastModifiedAt: string;
  status: Job['status'];
}

export interface ScenarioFeature {
  id: string;
  type: 'scenario_features';
  onTarget: boolean;
  metArea: number;
  met: number;
  totalArea: number;
  coverageTargetArea: number;
  coverageTarget: number;
}
