import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Item, { PublishedItemProps } from './component';

export default {
  title: 'Components/Projects/Published Item',
  component: Item,
  argTypes: {},
};

const Template: Story<PublishedItemProps> = ({ ...args }: PublishedItemProps) => (
  <Item {...args} />
);

export const Default = Template.bind({});
Default.args = {
  id: 1,
  area: 'Planning area name',
  name: 'Project Name 1',
  description:
    'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
  contributors: [
    { id: 1, name: 'Miguel Barrenechea', bgImage: '/images/avatar.png' },
    { id: 2, name: 'Ariadna Martínez', bgImage: '/images/avatar.png' },
  ],
  onDuplicate: (e) => {
    console.info('onDuplicate', e);
  },
};
