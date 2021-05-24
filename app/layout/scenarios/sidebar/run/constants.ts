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
    category: {
      id: 'general-parameters',
      label: 'General parameters'
    },
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
    category: {
      id: 'general-parameters',
      label: 'General parameters'
    },
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
    category: {
      id: 'general-parameters',
      label: 'General parameters'
    },
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
    category: {
      id: 'general-parameters',
      label: 'General parameters'
    },
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
    category: {
      id: 'general-parameters',
      label: 'General parameters'
    },
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
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters'
    },
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
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters'
    },
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
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters'
    },
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
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters'
    },
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
    category: {
      id: 'cost-threshold',
      label: 'Cost threshold'
    },
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
    category: {
      id: 'cost-threshold',
      label: 'Cost threshold'
    },
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
    category: {
      id: 'cost-threshold',
      label: 'Cost threshold'
    },
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
    category: {
      id: 'input-files',
      label: 'Input files'
    },
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
    category: {
      id: 'input-files',
      label: 'Input files'
    },
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
    category: {
      id: 'input-files',
      label: 'Input files'
    },
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
    category: {
      id: 'input-files',
      label: 'Input files'
    },
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
    category: {
      id: 'input-files',
      label: 'Input files'
    },
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
    category: {
      id: 'input-files',
      label: 'Input files'
    },
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
    category: {
      id: 'save-files',
      label: 'save files'
    },
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
    category: {
      id: 'save-files',
      label: 'save files'
    },
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
    id: 'VERBOSITY',
    label: 'Screen Output',
    description: 'The amount of information displayed on-screen while Marxan is running. \
    0. Silent Running – Only the title of the program is displayed. \
    1. Results Only – Marxan will display which run it is up to, the basic results of each run and the total run time. \
    2. General Progress – In addition to the information about each run, Marxan will display information on the data \
    that has been read in as well as details on any conservation features whose targets and requirements are such \
    that they cannot be adequately reserved in the system. \
    3. Detailed Progress – Shows exactly where the program is up to and gives the value of the system each time the temperature changes.',
    category: {
      id: 'program-control',
      label: 'Program control'
    },
    default: 2,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 4,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 4,
        },
      },
    ],
  },
  {
    id: 'MISSLEVEL',
    label: 'Conservation Feature missing proportion',
    description: 'Amount or target below which a Conservation Feature is counted as ‘missing’.This is the proportion \
    of the target a conservation feature must reach in order for it to be reported as met. There are situations where \
    Marxan can get extremely close to the target (e.g. 99% of the desired level) without actually meeting the target. \
    You can specify a level for which you are pragmatically satisfied that the amount of representation is close enough \
    to the target to report it as met. This value should always be high, i.e. greater than or equal to ‘0.95’. If you \
    are setting it lower than ‘0.95’, you should probably think about changing your targets.',
    category: {
      id: 'program-control',
      label: 'Program control'
    },
    default: 1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0.80,
      max: 1,
      type: 'number',
      step: '0.01',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0.80,
          lessThanOrEqualTo: 1,
        },
      },
    ],
  },
  {
    id: 'SAVERUN',
    label: 'Save each run',
    description: 'How to save the information of each run: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVEBEST',
    label: 'Save the best run',
    description: 'How to save the information of the "best" run: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESUMMARY',
    label: 'Save summary',
    description: 'How to save the summary information: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESCEN',
    label: 'Save scenario information',
    description: 'How to save the scenario information: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVETARGETMET',
    label: 'Save targets met',
    description: 'How to save the targets met information: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESUMSOLN',
    label: 'Save summed solution information',
    description: 'How to save the summed solution information: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVELOG',
    label: 'Save log file',
    description: 'How to save the log information: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 2,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVEPENALTY',
    label: 'Save computed feature penalties',
    description: 'How to save the computed feature penalties information: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 3,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESOLUTIONSMATRIX',
    label: 'Save solutions matrix',
    description: 'Save results of all runs in a single matrix: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 0,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESNAPSTEPS',
    label: 'Save snapshots',
    description: 'How to save the snapshots each n steps: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 0,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESNAPCHANGES',
    label: 'Save snapshots changes',
    description: 'How to save the snapshots each n changes: \
    0. Do not save \
    1. Save files as .dat \
    2. Save files as .txt \
    3. Save files as .csv',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 0,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'SAVESNAPFREQUENCY',
    label: 'Save snapshots changes',
    description: 'If either SAVESNAPSTEPS or SAVESNAPCHANGES are selected, \
    then a SAVESNAPFREQUENCY value must also be specified. This is the predetermined number \
    of either system iterations (SAVESNAPSTEPS) or system changes (SAVESNAPCHANGES) at which \
    the solution progress of the optimisation procedure is saved. Saving snapshots can create \
    enormous amounts of output files which swamp your output folder and drastically slow down \
    the running of Marxan. They are for advanced diagnoses and should only be used by expert users. \
    If you use them, make sure the snap frequency is large enough so that you are not left with \
    tens of thousands of output files. The actual number you choose will depend on how many iterations \
    you are using (variable, ‘NUMITNS’). For 1 million iterations, a snap frequency of 100,000 will give 10 output files',
    category: {
      id: 'save-files',
      label: 'save files'
    },
    default: 0,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 1000000,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 1000000,
        },
      },
    ],
  },
  {
    id: 'RUNMODE',
    label: 'Run option',
    description: 'This is an essential variable that defines the method Marxan will use to locate good reserve solutions. \
    The real strength of Marxan lies in its use of Simulated Annealing to find solutions to the reserve selection problem. \
    However, Marxan is also capable of using simpler, but more rapid, methods to locate potential solutions, such as \
    heuristic rules and iterative improvement. There are seven different run options: \
    0: Apply Simulated Annealing followed by a Heuristic \
    1: Apply Simulated Annealing followed by Iterative Improvement \
    2: Apply Simulated Annealing followed by a Heuristic, followed by Iterative \
    3: Use only a Heuristic \
    4: Use only Iterative Improvement \
    5: Use a Heuristic followed by Iterative Improvement \
    6: Use only Simulated Annealing',
    category: {
      id: 'program-control',
      label: 'Program control'
    },
    default: 1,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 6,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 6,
        },
      },
    ],
  },
  {
    id: 'ITIMPTYPE',
    label: 'Iterative Improvement',
    description: 'Iterative improvement type.If Iterative Improvement is being used to help find solutions, \
    this variable defines what type of Iterative Improvement will be applied. There are four different options: \
    0: Normal Iterative Improvement \
    1: Two Step Iterative Improvement \
    2: ‘Swap’ Iterative Improvement \
    3: Normal Improvement followed by Two Step Iterative Improvement',
    category: {
      id: 'program-control',
      label: 'Program control'
    },
    default: 1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'HEURTYPE',
    label: 'Heuristic',
    description: 'If you are using an optional heuristic to find reserve solutions, \
    this variable defines what type of heuristic algorithm will be applied. There are nine different options: \
    -1:Ignored \
    0: Richness \
    1: Greedy \
    2: Max Rarity \
    3: Best Rarity \
    4: Average Rarity \
    5: Sum Rarity \
    6: Product Irreplaceability \
    7.Summation Irreplaceability',
    category: {
      id: 'program-control',
      label: 'Program control'
    },
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 7,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 7,
        },
      },
    ],
  },
  {
    id: 'CLUMPTYPE',
    label: 'Clumping rule',
    description: 'Clumping penalty type. This variable is useful if some conservation features have a minimum clump size set. \
    It tells Marxan if occurrences smaller than the minimum clump size should contribute towards the overall target, and if so, how. \
    Be aware that this will slow down Marxan by an order of magnitude.There are seven different run options: \
    -1: Ignored \
    0: Partial clumps do not count - Clumps smaller than the target score nothing \
    1: Partial clumps count half - Clumps smaller than the target score nothing \
    2: Graduated penalty - Score is proportional to the size of the clump',
    category: {
      id: 'program-control',
      label: 'Program control'
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 2,
      type: 'integer',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 2,
        },
      },
    ],
  },
];
