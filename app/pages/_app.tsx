import React from 'react';

import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { AuthorizationProvider } from 'hooks/authentication';

import type { AppProps } from 'next/app';

import store from 'store';

import 'styles/tailwind.css';

const queryClient = new QueryClient();

const MarxanApp: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthorizationProvider
          successRedirect="/projects"
          errorRedirect="/" // We should create a login page
        >
          <OverlayProvider>
            <div className="bg-black">
              <Component {...pageProps} />
            </div>
          </OverlayProvider>
        </AuthorizationProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default MarxanApp;
