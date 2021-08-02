import React, { useCallback, useMemo, useState } from 'react';

import { Story } from '@storybook/react/types-6-0';

import Legend, { LegendProps } from './component';
import LegendItem from './item';
import ITEMS from './mock';
import LegendTypeBasic from './types/basic';
import LegendTypeChoropleth from './types/choropleth';
import LegendTypeGradient from './types/gradient';
import LegendTypeMatrix from './types/matrix';

export default {
  title: 'Components/Map/Legend',
  component: Legend,
};

const Template: Story<LegendProps> = (args) => {
  const { sortable } = args;
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
      sortable={sortable}
      maxHeight={300}
      onChangeOrder={onChangeOrder}
    >
      {sortedItems.map((i) => {
        const { type, items, intersections } = i;

        return (
          <LegendItem
            sortable={sortable}
            key={i.id}
            {...i}
          >
            {type === 'matrix' && <LegendTypeMatrix className="pt-6 pb-4 text-sm text-white" intersections={intersections} items={items} />}
            {type === 'basic' && <LegendTypeBasic className="text-sm text-gray-300" items={items} />}
            {type === 'choropleth' && <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />}
            {type === 'gradient' && <LegendTypeGradient className="text-sm text-gray-300" items={items} />}
          </LegendItem>
        );
      })}
    </Legend>
  );
};

export const Default = Template.bind({});
Default.args = {
  className: '',
};

export const Sortable = Template.bind({});
Sortable.args = {
  className: '',
  sortable: {
    enabled: true,
  },
};

export const SortableHandle = Template.bind({});
SortableHandle.args = {
  className: '',
  sortable: {
    enabled: true,
    handle: true,
  },
};
