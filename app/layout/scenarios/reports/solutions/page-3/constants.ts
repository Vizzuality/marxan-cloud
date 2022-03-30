export const Types = {
  STARTTEMP: 'STARTTEMP',
  RANDSEED: 'RANDSEED',
  BESTSCORE: 'BESTSCORE',
  NUMITNS: 'NUMITNS',
  MISSLEVEL: 'MISSLEVEL',
  PROP: 'PROP',
  COOLFAC: 'COOLFAC',
  NUMTEMP: 'NUMTEMP',
  COSTTHRESH: 'COSTTHRESH',
  THRESHPEN1: 'THRESHPEN1',
  VERBOSITY: 'VERBOSITY',
  RUNMODE: 'RUNMODE',
  ITIMPTYPE: 'ITIMPTYPE',
  HEURTYPE: 'HEURTYPE',
  CLUMPTYPE: 'CLUMPTYPE',
};

export const SCENARIO_PARAMETERS = [
  {
    description: 'Conservation Feature missing proportion',
    value: 'MISSLEVEL',
  },
  {
    description: 'Starting Proportion',
    value: 'PROP',
  },
  {
    description: 'Random seed',
    value: 'RANDSEED',
  },
  {
    description: 'Best Score Speedup',
    value: 'BESTSCORE',
  },
  {
    description: 'Number of Iterations',
    value: 'NUMITNS',
  },
  {
    description: 'Initial temperature',
    value: 'STARTTEMP',
  },
  {
    description: 'Cooling factor',
    value: 'COOLFAC',
  },
  {
    description: 'Temperature decreases for annealing',
    value: 'NUMTEMP',
  },
  {
    description: 'Cost Threshold',
    value: 'COSTTHRESH',
  },
  {
    description: 'Size of cost threshold penalty',
    value: 'THRESHPEN1',
  },
  {
    description: 'Screen Output',
    value: 'VERBOSITY',
  },
  {
    description: 'Run option',
    value: 'RUNMODE',
  },
  {
    description: 'Iterative Improvement',
    value: 'ITIMPTYPE',
  },
  {
    description: 'Heuristic',
    value: 'HEURTYPE',
  },
  {
    description: 'Clumping rule',
    value: 'CLUMPTYPE',
  },
];
