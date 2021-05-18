export const FIELDS = [
  {
    id: 'numberOfRuns',
    label: 'Number of Runs',
    description: 'Number of Runs description',
    default: 10,
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
];

export const DATA = [
  {
    boundaryLength: 1.43,
    cost: 1.34,
    isBlm: false,
    thumbnail: '/images/avatar.png',
  },
  {
    boundaryLength: 1.17,
    cost: 1.35,
    isBlm: false,
    thumbnail: null,
  },
  {
    boundaryLength: 0.49,
    cost: 1.43,
    isBlm: true,
    thumbnail: '/images/avatar.png',
  },
  {
    boundaryLength: 0.32,
    cost: 1.82,
    isBlm: false,
    thumbnail: null,
  },
  {
    boundaryLength: 0.31,
    cost: 2.1,
    isBlm: false,
    thumbnail: '/images/avatar.png',
  },
  {
    boundaryLength: 0.29,
    cost: 2.89,
    isBlm: false,
    thumbnail: '/images/avatar.png',
  },
];
