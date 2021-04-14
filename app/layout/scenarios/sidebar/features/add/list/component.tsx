import React from 'react';
import cx from 'classnames';

import Item from 'components/features/raw-item';

import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';

const ITEMS = [
  {
    id: 1,
    name: 'Ecoregions',
    subfeatures: 10,
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [
      { id: 1, name: 'Bioregional', className: 'text-black bg-green-300' },
    ],
    onToggleSelected: (e) => {
      console.info('onToggleSelected', e);
    },
  },
  {
    id: 2,
    name: 'Lion',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [{ id: 3, name: 'Species', className: 'text-black bg-yellow-300' }],
    onToggleSelected: (e) => {
      console.info('onToggleSelected', e);
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
    onToggleSelected: (e) => {
      console.info('onToggleSelected', e);
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
    onToggleSelected: (e) => {
      console.info('onToggleSelected', e);
    },
  },
  {
    id: 5,
    name: 'Cheetah',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
      { id: 2, name: 'Source name' },
    ],
    onToggleSelected: (e) => {
      console.info('onToggleSelected', e);
    },
  },
  {
    id: 6,
    name: 'Cheetah',
    description:
      'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
    tags: [
      { id: 3, name: 'Species', className: 'text-black bg-yellow-300' },
      { id: 2, name: 'Source name' },
    ],
    onToggleSelected: (e) => {
      console.info('onToggleSelected', e);
    },
  },
];

export interface ScenariosFeaturesSelectionListProps {
}

export const ScenariosFeaturesSelectionList: React.FC<ScenariosFeaturesSelectionListProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const { data: scenarioData } = useScenario(sid);

  if (!scenarioData) return null;

  return (
    <div
      className={cx({
        'bg-white divide-y divide-black divide-dashed divide-opacity-20': true,
      })}
    >
      {ITEMS.map((item) => {
        return (
          <div key={`${item.id}`}>
            <Item
              {...item}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ScenariosFeaturesSelectionList;
