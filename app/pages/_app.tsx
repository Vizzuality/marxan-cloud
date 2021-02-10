import React from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthorizationProvider } from 'hooks/authentication';

import type { AppProps } from 'next/app';

import 'styles/tailwind.css';

const queryClient = new QueryClient();

const MarxanApp: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthorizationProvider
        successRedirect="/projects"
        errorRedirect="/" // We should create a login page
      >
        <Component {...pageProps} />
      </AuthorizationProvider>
    </QueryClientProvider>
  );
};

export default MarxanApp;
