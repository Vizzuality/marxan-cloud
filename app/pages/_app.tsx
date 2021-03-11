import React from 'react';

import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OverlayProvider } from '@react-aria/overlays';
import { Provider as AuthenticationProvider } from 'next-auth/client';
import { ToastProvider } from 'hooks/toast';

import type { AppProps } from 'next/app';

import store from 'store';

import 'styles/tailwind.css';

const queryClient = new QueryClient();

const MarxanApp: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider
          session={pageProps.session}
          options={{
            clientMaxAge: 60, // Re-fetch session if cache is older than 60 seconds
            keepAlive: 5, // Send keepAlive message every 5 minutes
          }}
        >
          <OverlayProvider>
            <ToastProvider
              placement="top-right"
              defaultAutoDismiss
              defaultAutoDismissTime={5000}
            >
              <div className="bg-black">
                <Component {...pageProps} />
              </div>
            </ToastProvider>
          </OverlayProvider>
        </AuthenticationProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default MarxanApp;
