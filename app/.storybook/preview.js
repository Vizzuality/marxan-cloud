import React from 'react';

import { themes } from '@storybook/theming';

import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthorizationProvider } from 'hooks/authentication';

const queryClient = new QueryClient();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    theme: themes.dark,
  },
};

export const decorators = [
  (Story) => {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthorizationProvider>
          {Story()}
        </AuthorizationProvider>
      </QueryClientProvider>
    )
  },
]
