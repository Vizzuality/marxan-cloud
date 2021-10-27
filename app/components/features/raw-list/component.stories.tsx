import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import List, { ListProps } from './component';

export default {
  title: 'Components/Features/Raw-List',
  component: List,
  argTypes: {},
};

const Template: Story<ListProps> = ({ ...args }: ListProps) => (
  <List {...args} />
);

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      id: 1,
      name: 'Ecoregions',
      subfeatures: 10,
      description:
        'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
      tags: [
        { id: 1, name: 'Bioregional', className: 'text-black bg-green-300' },
      ],
      onToggle: (e) => {
        console.info('onToggle', e);
      },
    },
    {
      id: 2,
      name: 'Lion',
      description:
        'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
      tags: [{ id: 3, name: 'Species', className: 'text-black bg-yellow-300' }],
      onToggle: (e) => {
        console.info('onToggle', e);
      },
    },
    {
      id: 3,
      name: 'Elephant',
      description:
        'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
      tags: [
        { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
        { id: 2, name: 'Source name' },
      ],
      selected: true,
      onToggle: (e) => {
        console.info('onToggle', e);
      },
    },
    {
      id: 4,
      name: 'Cheetah',
      description:
        'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
      tags: [
        { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
        { id: 2, name: 'Source name' },
      ],
      onToggle: (e) => {
        console.info('onToggle', e);
      },
    },
  ],
};
