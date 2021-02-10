import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Label from 'components/forms/label';

import Search, { SearchProps } from './component';

export default {
  title: 'Components/Search',
  component: Search,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark', 'light'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['sm', 'base'],
      },
    },
    labelRef: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<SearchProps> = ({ ...args }: SearchProps) => {
  const labelRef = React.useRef(null);
  const [value, setSubmittedText] = useState('');

  const onChange = (e) => {
    setSubmittedText(e);
  };

  return (
    <>
      <Label ref={labelRef} id="search-component" className="uppercase sr-only">
        Search
      </Label>
      <Search id="search-component" labelRef={labelRef} value={value} onChange={onChange} {...args} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Search by feature, planning area name...',
};
