import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Label from 'components/forms/label';

import Search, { SearchProps } from './component';

export default {
  title: 'Components/Search',
  component: Search,
};

const Template: Story<SearchProps> = ({ ...args }: SearchProps) => {
  const labelRef = React.useRef(null);
  const [value, setSubmittedText] = useState('');

  const onChange = (e) => {
    setSubmittedText(e);
    args.onChange(e);
  };

  return (
    <>
      <Label ref={labelRef} id="slider-component" className="uppercase sr-only">
        Search
      </Label>
      <Search {...args} value={value} onChange={onChange} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  label: 'Search',
  placeholder: 'Search by feature, planning area name...',
  labelRef: {
    control: {
      disable: true,
    },
  },
};
