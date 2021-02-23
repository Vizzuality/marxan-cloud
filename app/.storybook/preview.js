import React from 'react';

import { themes } from '@storybook/theming';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    theme: themes.dark,
  },
};

export const decorators = [
  (Story) => {
    return (
      <div>
        {Story()}
      </div>
    )
  },
]
