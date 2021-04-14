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

    splitSelected: 'attribute-1',
    splitOptions: [
      { label: 'Attribute 1', value: 'attribute-1' },
      { label: 'Attribute 2', value: 'attribute-2' },
      { label: 'Attribute 3', value: 'attribute-3' },
    ],

    splitFeaturesSelected: [],
    splitFeaturesOptions: [
      { label: 'Deserts and Xeric Shrublands', value: 'id-1' },
      {
        label: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
        value: 'id-2',
      },
      { label: 'Flooded Grasslands and Savannas', value: 'id-3' },
      { label: 'Montane Grasslands and Shrublands', value: 'id-4' },
      {
        label: 'Tropical and Subtropical Moist, Broadleaf Forests',
        value: 'id-5',
      },
      { label: 'Mangroves', value: 'id-6' },
    ],
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
