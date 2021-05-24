export const FIELDS = [
  {
    id: 'NUMREPS',
    label: 'Number of Runs',
    description: 'Number of repeat runs (or solutions)',
    default: 10,
    advanced: false,
    input: {
      className: 'text-2xl',
      min: 1,
      max: 1000,
      type: 'number',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThan: 1,
          lessThanOrEqualTo: 1000,
        },
      },
    ],
  },
  {
    id: 'BLM',
    label: 'Clumping',
    description: 'Clumping description',
    note: '(Boundary Length Modifier)',
    default: 1,
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
    description: 'Proportion of planning units in initial reserve system',
    default: 0.5,
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
    description: 'Random seed number',
    default: -1,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 1,
      type: 'number',
      step: '.01',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 1,
        },
      },
    ],
  },
  {
    id: 'BESTSCORE',
    label: 'Best Score Speedup',
    description: 'This variable tells Marxan not to keep track of the best score \
    until it reaches a specified minimum level. It was intended to be a time saving measure but is seldom required.',
    default: -1,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: -1,
      type: 'number',
      step: '.01',
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
    description: 'Number of iterations for annealing',
    default: 1000000,
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
    description: 'Starting temperature for annealing. The use of the adaptive annealing schedule \
    can be applied by setting the variable to any negative value',
    default: -1,
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
    description: 'Cooling factor for annealing',
    default: 0,
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
          lessThanOrEqualTo: 100,
        },
      },
    ],
  },
  {
    id: 'NUMTEMP',
    label: 'Temperature decreases for annealing',
    description: 'Number of temperature decreases for annealing',
    default: 10000,
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
    id: 'RANDSEED',
    label: 'Random seed',
    description: 'Random seed number',
    default: -1,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 1,
      type: 'number',
      step: '.01',
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
];
