import React from 'react';

import { themes } from '@storybook/theming';

import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthorizationProvider } from 'hooks/authentication';

import PROJECTS from 'services/projects';

const queryClient = new QueryClient();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    theme: themes.dark,
  },
};

export const decorators = [
  (Story) => {
    PROJECTS.defaults.headers.common.Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYUBleGFtcGxlLmNvbSIsInRva2VuSWQiOiI4Y2UzMGM4MS1lNGRlLTQ0NGItOThhOC1mZGVmZjcyNjliYzgiLCJpYXQiOjE2MTI3ODM0NDEsImV4cCI6MTYxMjc5MDY0MX0.d9SSwWQk1V2ffZnsSD_CXhwDU74m6m4gJYpKDKrqpak';

    return (
      <AuthorizationProvider>
        <QueryClientProvider client={queryClient}>
          {Story()}
        </QueryClientProvider>
      </AuthorizationProvider>
    )
  },
]
