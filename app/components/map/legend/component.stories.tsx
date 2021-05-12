import React, { useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Legend, { LegendProps } from './component';

export default {
  title: 'Components/Map/Legend',
  component: Legend,
};

const ITEMS = [
  { id: 'XXX', name: 'XXX' },
  { id: 'YYY', name: 'YYY' },
  { id: 'ZZZ', name: 'ZZZ' },
];

const Template: Story<LegendProps> = (args) => {
  const [sortArray, setSortArray] = useState([]);
  // Sorted
  const sortedItems = useMemo(() => {
    return ITEMS.sort((a, b) => {
      return sortArray.indexOf(a.id) - sortArray.indexOf(b.id);
    });
  }, [sortArray]);

  // Callbacks
  const onChangeOrder = useCallback((ids) => {
    setSortArray(ids);
  }, []);

  return (
    <Legend
      {...args}
      onChangeOrder={onChangeOrder}
    >
      {sortedItems.map((i) => (
        <div
          key={i.id}
          {...i}
        >
          {i.name}
        </div>
      ))}
    </Legend>
  );
};

export const Default = Template.bind({});
Default.args = {
  className: '',
};
