export const FIELDS = [
  {
    id: 'numberOfRuns',
    label: 'Number of Runs',
    description: 'Number of Runs description',
    default: 10,
    advanced: false,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThanOrEqualTo: 100,
        },
      },
    ],
  },
  {
    id: 'clamping',
    label: 'Clamping',
    description: 'Clamping description',
    note: '(Boundary Lenght Modifier)',
    default: 0.0001,
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
    id: 'prop',
    label: 'Prop',
    description: 'Prop description',
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
    id: 'randseed',
    label: 'Randseed',
    description: 'Randseed description',
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
];
