import React, { useRef } from 'react';

import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { OverlayProvider } from '@react-aria/overlays';
import { Provider as AuthenticationProvider } from 'next-auth/client';
import { ToastProvider } from 'hooks/toast';

import type { AppProps } from 'next/app';

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
                <div className="bg-black">
                  <Component {...pageProps} />
                </div>
              </ToastProvider>
            </OverlayProvider>
          </AuthenticationProvider>
        </Hydrate>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default MarxanApp;
