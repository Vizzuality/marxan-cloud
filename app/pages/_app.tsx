import React, { useRef } from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';

import type { AppProps } from 'next/app';

import { HelpProvider } from 'hooks/help';
import { ToastProvider } from 'hooks/toast';

import { OverlayProvider } from '@react-aria/overlays';
import { Provider as AuthenticationProvider } from 'next-auth/client';
import PlausibleProvider from 'next-plausible';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';
import store from 'store';

import 'styles/tailwind.css';

const MarxanApp: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClientRef.current}>
        <ReactQueryDevtools />
        <Hydrate state={pageProps.dehydratedState}>
          <AuthenticationProvider
            session={pageProps.session}
            options={{
              clientMaxAge: 5 * 60, // Re-fetch session if cache is older than 60 seconds
              keepAlive: 10 * 60, // Send keepAlive message every 10 minutes
            }}
          >
            <OverlayProvider>
              <ToastProvider
                placement="top-right"
                defaultAutoDismiss
                defaultAutoDismissTime={5000}
              >
                <HelpProvider>
                  <PlausibleProvider domain="marxan.vercel.app">
                    <div className="bg-black">
                      <Component {...pageProps} />
                    </div>
                  </PlausibleProvider>
                </HelpProvider>
              </ToastProvider>
            </OverlayProvider>
          </AuthenticationProvider>
        </Hydrate>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default MarxanApp;
