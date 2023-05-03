import React, { useState } from 'react';

import { Story } from '@storybook/react/types-6-0';

import Item, { ItemProps } from './component';

export default {
  title: 'Components/Features/Intersect-Item',
  component: Item,
  argTypes: {},
};

const Template: Story<ItemProps> = ({ ...args }: ItemProps) => {
  const [selectedS, setSelectedS] = useState(args.selected);

  const [splitSelectedS, setSplitSelectedS] = useState(args.splitSelected);

  const [splitFeaturesSelectedS, setSplitFeaturesSelectedS] = useState(args.splitFeaturesSelected);

  return (
    <Item
      {...args}
      selected={selectedS}
      onSelected={setSelectedS}
      splitSelected={splitSelectedS}
      onSplitSelected={setSplitSelectedS}
      splitFeaturesSelected={splitFeaturesSelectedS}
      onSplitFeaturesSelected={setSplitFeaturesSelectedS}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  id: 1,
  name: 'Ecoregions',
  description:
    'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',

  splitSelected: 'attribute-2',
  splitOptions: [
    {
      key: 'attribute-1',
      values: [
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
      key: 'attribute-2',
      values: [
        { label: 'Deserts and Xeric Shrublands', value: 'id-1' },
        {
          label: 'Tropical and Subtropical Moist, Broadleaf Forests',
          value: 'id-5',
        },
        { label: 'Mangroves', value: 'id-6' },
      ],
    },
    {
      key: 'attribute-3',
      values: [
        { label: 'Deserts and Xeric Shrublands', value: 'id-1' },
        {
          label: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
          value: 'id-2',
        },
      ],
    },
  ],
  onSplitSelected: (selected) => console.info(selected),

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
  onSplitFeaturesSelected: (selected) => console.info(selected),

  intersectSelected: [],
  intersectOptions: [
    { label: 'Feature 1', value: 'feature-1' },
    { label: 'Feature 2', value: 'feature-2' },
    { label: 'Feature 3', value: 'feature-3' },
  ],
  onIntersectSelected: (selected) => console.info(selected),
};
