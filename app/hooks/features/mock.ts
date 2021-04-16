const ITEMS = [
  {
    id: 1,
    name: 'Ecoregions',
    type: 'bioregional',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [
      { id: 1, name: 'Bioregional', className: 'text-black bg-green-300' },
    ],

    splitOptions: [
      {
        label: 'Attribute 1',
        key: 'attribute-1',
        values: [
          { id: 'XXX', value: 'XXX' },
          { id: 'YYY', value: 'YYY' },
          { id: 'ZZZ', value: 'ZZZ' },
        ],
      },
      {
        label: 'Attribute 2',
        key: 'attribute-2',
        values: [
          { id: 'AAA', value: 'AAA' },
          { id: 'BBB', value: 'BBB' },
          { id: 'CCC', value: 'CCC' },
          { id: 'DDD', value: 'DDD' },
          { id: 'EEE', value: 'EEE' },
          { id: 'FFF', value: 'FFF' },
        ],

      },
      { label: 'Attribute 3', key: 'attribute-3', values: [] },
    ],
    splitSelected: null,
    splitFeaturesSelected: [],
  },
  {
    id: 2,
    name: 'Lion',
    type: 'species',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
      { id: 2, name: 'Source name' },
    ],

    intersectFeaturesSelected: ['id-1', 'id-2'],
    intersectFeaturesOptions: [
      { label: 'Deserts and Xeric Shrublands', value: 'id-1' },
      {
        label: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
        value: 'id-2',
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
      { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
      { id: 2, name: 'Source name' },
    ],
  },
  {
    id: 4,
    name: 'Cheetah',
    type: 'species',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
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
      { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
      { id: 2, name: 'Source name' },
    ],
  },

];

export default ITEMS;
