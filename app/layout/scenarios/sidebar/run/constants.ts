export const FIELDS = [
  {
    id: 'NUMREPS',
    label: 'Number of Runs',
    description: 'Number of repeat runs (or solutions).The number of repeat runs you want Marxan to perform; \
    effectively, the number of solutions to the reserve problem you want Marxan to generate. Each new run is \
    independent of the previous one, but they will all use the same parameter and variable values. \
    The frequency with which planning units are selected in multiple runs, gives an indication of the \
    importance of that planning unit for efficiently meeting your reserve targets. When running a new \
    scenario for the first time it is always advisable to begin with a very small number of runs (e.g. 10) \
    so you can check the program is performing as desired (i.e. the solutions are meeting the required targets) \
    without having to wait a long time. In order to get an idea of selection frequency, however, you will \
    generally need to do many runs. 100 runs is the standard best practice, as it is an intuitive value from \
    which to calculate selection frequency. Adding more runs will sample more of the solution space but will \
    of course increase the processing time.',
    default: 10,
    required: true,
    advanced: false,
    input: {
      className: 'text-2xl',
      min: 1,
      max: 10000,
      type: 'number',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 10000,
        },
      },
    ],
  },
  {
    id: 'BLM',
    label: 'Clumping',
    description: 'The BLM should be either ‘0’ or a positive number. \
    It is permissible for the BLM to include decimal points (e.g. 0.1). \
    Setting the BLM to ‘0’ will remove boundary length from consideration altogether. \
    There is no universally good value for the BLM, as it works in relation to the costs \
    and geometry of the study region/planning units. With a small BLM, Marxan will \
    concentrate on minimizing overall reserve cost and will only aim for compactness \
    when little extra cost will be incurred. Alternatively, a large BLM will place a high \
    emphasis on minimizing the boundary length, even if it means a more costly solution.',
    note: '(Boundary Length Modifier)',
    default: 1,
    required: false,
    advanced: false,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 10000000,
      type: 'number',
      step: '.0001',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThan: 0,
          lessThanOrEqualTo: 10000000,
        },
      },
    ],
  },
  {
    id: 'PROP',
    label: 'Starting Proportion',
    description: 'Proportion of planning units in initial reserve system. When Marxan starts a run, \
    it must generate an initial reserve system. This variable defines the proportion of planning units \
    to be included in the initial reserve system at the start of each run. The variable ‘PROP’ must be \
    a number between 0 and 1. If zero is chosen then no planning units will be included in the initial \
    reserve, a value of 1 means all planning units will be included, and a value of 0.5 means 50% of \
    planning units will be randomly included. In practice, the setting has no effect on the operation \
    of simulated annealing, provided a sufficient number of iterations is used. This will only be applied \
    to those planning units whose status does not lock them in or out of solutions',
    default: 0.5,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 1,
      type: 'number',
      step: '.01',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 1,
        },
      },
    ],
  },
  {
    id: 'RANDSEED',
    label: 'Random seed',
    description: 'Random seed number. It controls whether the same ‘random’ selection \
    of planning units is included in the initial reserve system each run. Using a constant \
    positive integer for this variable will make Marxan use the same random seed each time it is run. \
    Except for debugging purposes, it should be set to ‘-1’ in the input.dat file.',
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 1,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 1000,
        },
      },
    ],
  },
  {
    id: 'BESTSCORE',
    label: 'Best Score Speedup',
    description: 'This variable tells Marxan not to keep track of the best score \
    until it reaches a specified minimum level. It was intended to be a time saving \
    measure but is seldom required. It should always be set to -1.',
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: -1,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          equalTo: -1,
        },
      },
    ],
  },
  {
    id: 'NUMITNS',
    label: 'Number of Iterations',
    description: 'Required when RUNMODE = "Simulated Annealing". Number of iterations for annealing',
    default: 1000000,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 100000,
      max: 100000000,
      type: 'number',
      step: '10000',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 100000000,
        },
      },
    ],
  },
  {
    id: 'STARTTEMP',
    label: 'Initial temperature',
    description: 'Required when RUNMODE = "Simulated Annealing". Starting temperature for annealing. The use of the adaptive annealing schedule \
    can be applied by setting the variable to any negative value',
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 100000,
      type: 'number',
      step: '1000',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 100000,
        },
      },
    ],
  },
  {
    id: 'COOLFAC',
    label: 'Cooling factor',
    description: 'Required when RUNMODE = "Simulated Annealing". Cooling factor for annealing',
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 100,
        },
      },
    ],
  },
  {
    id: 'NUMTEMP',
    label: 'Temperature decreases for annealing',
    description: 'Required when RUNMODE = "Simulated Annealing". Number of temperature decreases for annealing',
    default: 10000,
    required: false, 
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 1,
      max: 50000,
      type: 'number',
      step: '1000',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 50000,
        },
      },
    ],
  },
  {
    id: 'COSTTHRESH',
    label: 'Cost threshold',
    description: 'This variable can be included if you want Marxan to find reserve solutions below a total cost. \
    It works together with THRESHPEN1 and THRESHPEN2. Setting this variable to ‘0’ in the ‘input.dat’ file will disable it. \
    Marxan is designed to solve a ‘minimum set’ problem, its goal being to meet all our conservation targets for the least cost. \
    Another class of conservation problem is known as the ‘maximum coverage’ problem where the goal is to achieve the best \
    conservation outcomes for a given fixed budget. In many cases, this is more representative of how conservation actions operate. \
    Although including a cost threshold does not make Marxan solve the strict ‘maximum coverage’ problem, it is comparable and can \
    be used in cases where you have conservation targets you hope to meet and cannot exceed a predetermined budget. \
    The actual way this cost threshold is applied within the algorithm is described in detail in Marxan Manual 2020 Appendix B-1.5.',
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
        },
      },
    ],
  },
  {
    id: 'THRESHPEN1',
    label: 'Size of cost threshold penalty',
    description: 'This variable can be included if you want Marxan to find reserve solutions below a total cost. \
    It works together with COSTTHRESH and THRESHPEN2. Setting this variable to ‘0’ in the ‘input.dat’ file will disable it. \
    Marxan is designed to solve a ‘minimum set’ problem, its goal being to meet all our conservation targets for the least cost. \
    Another class of conservation problem is known as the ‘maximum coverage’ problem where the goal is to achieve the best \
    conservation outcomes for a given fixed budget. In many cases, this is more representative of how conservation actions operate. \
    Although including a cost threshold does not make Marxan solve the strict ‘maximum coverage’ problem, it is comparable and can \
    be used in cases where you have conservation targets you hope to meet and cannot exceed a predetermined budget. \
    The actual way this cost threshold is applied within the algorithm is described in detail in Marxan Manual 2020 Appendix B-1.5.',
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
        },
      },
    ],
  },
  {
    id: 'THRESHPEN2',
    label: 'Shape of cost threshold penalty',
    description: 'This variable can be included if you want Marxan to find reserve solutions below a total cost. \
    It works together with COSTTHRESH and THRESHPEN1. Setting this variable to ‘0’ in the ‘input.dat’ file will disable it. \
    Marxan is designed to solve a ‘minimum set’ problem, its goal being to meet all our conservation targets for the least cost. \
    Another class of conservation problem is known as the ‘maximum coverage’ problem where the goal is to achieve the best \
    conservation outcomes for a given fixed budget. In many cases, this is more representative of how conservation actions operate. \
    Although including a cost threshold does not make Marxan solve the strict ‘maximum coverage’ problem, it is comparable and can \
    be used in cases where you have conservation targets you hope to meet and cannot exceed a predetermined budget. \
    The actual way this cost threshold is applied within the algorithm is described in detail in Marxan Manual 2020 Appendix B-1.5.',
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
        },
      },
    ],
  },
  {
    id: 'INPUTDIR',
    label: 'Input Folder',
    description: 'User Defined Name of the folder containing input data files',
    default: 'input',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'SPECNAME',
    label: 'Conservation Feature File',
    description: 'Name of Conservation Feature File. It contains information about each of the conservation \
    features being considered, such as their name, targets and representation requirements, and the penalty \
    that should be applied if these representation requirements are not met.',
    default: 'spec.dat',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'PUNAME',
    label: 'Planning Unit File',
    description: 'Name of Planning Unit File. It contains information about the planning units themselves, \
    such as ID number, cost, location and status.',
    default: 'pu.dat',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'PUVSPRNAME',
    label: 'Planning Unit versus Conservation Feature File',
    description: 'Name of Planning Unit versus Conservation Feature File. Tt contains information on the distribution \
    of conservation features in each of the planning units.',
    default: 'puvspr.dat',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'BOUNDNAME',
    label: 'Boundary Length File',
    description: 'Name of Boundary Length File. It contains information about the length or ‘effective length’ of shared \
    boundaries between planning units. This file is necessary if you wish to use the Boundary Length Modifier to improve \
    the compactness of reserve solutions, and while not required, is recommended.',
    default: 'bound.dat',
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'BLOCKDEFNAME',
    label: 'Block Definition File',
    description: 'Name of Block Definition File',
    default: 'blockdef.dat',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'SCENNAME',
    label: 'Scenario name',
    description: 'Scenario name to attach as prefix to the saved output files',
    default: 'output',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
  {
    id: 'OUTPUTDIR',
    label: 'Output Folder',
    description: 'Name of the folder in which to save output files',
    default: 'output',
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      type: 'string',
    },
    validations: [
      {
        presence: true,
        length: {
          maximum: 25,
        },
      },
    ],
  },
];
