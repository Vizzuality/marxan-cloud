const ITEMS = [
  {
    id: 1,
    name: 'Ecoregions',
    type: 'bioregional',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [{ id: 1, name: 'Bioregional', className: 'text-black bg-green-300' }],

    splitOptions: [
      {
        label: 'Attribute 1',
        key: 'attribute-1',
        values: [
          { id: 'XXX', name: 'Deserts and Xeric Shrublands' },
          { id: 'YYY', name: 'Tropical and Subtropical Grasslands, Savannas and Shrublands' },
          { id: 'ZZZ', name: 'Inland water' },
        ],
      },
      {
        label: 'Attribute 2',
        key: 'attribute-2',
        values: [
          { id: 'AAA', name: 'AAA' },
          { id: 'BBB', name: 'BBB' },
          { id: 'CCC', name: 'CCC' },
          { id: 'DDD', name: 'DDD' },
          { id: 'EEE', name: 'EEE' },
          { id: 'FFF', name: 'FFF' },
        ],
      },
      { label: 'Attribute 3', key: 'attribute-3', values: [] },
    ],
    splitSelected: 'attribute-1',
    splitFeaturesSelected: [
      {
        id: 'XXX',
        name: 'Deserts and Xeric Shrublands',
        target: 75,
        fpf: 2,
      },
      {
        id: 'YYY',
        name: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
        target: 67,
        fpf: 5,
      },
    ],
  },
  {
    id: 2,
    name: 'Lion',
    type: 'species',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-400' },
      { id: 2, name: 'Source name' },
    ],

    intersectFeaturesSelected: [
      {
        id: '1',
        name: 'Ecoregions',
        splitSelected: 'attribute-2',
        splitFeaturesSelected: [
          {
            id: 'XXX',
            name: 'Deserts and Xeric Shrublands',
            target: 21,
            fpf: 2,
          },
          {
            id: 'YYY',
            name: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
            target: 17,
            fpf: 5,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Elephant',
    type: 'species',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-400' },
      { id: 2, name: 'Source name' },
    ],
    target: 75,
    fpf: 2,
  },
  {
    id: 4,
    name: 'Cheetah',
    type: 'species',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-400' },
      { id: 2, name: 'Source name' },
    ],
  },
  {
    id: 5,
    name: 'Tigers',
    type: 'species',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-400' },
      { id: 2, name: 'Source name' },
    ],
  },
];

export default ITEMS;
