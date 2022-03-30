import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { OverlayProvider } from '@react-aria/overlays';
import cx from 'classnames';
import { Provider as AuthenticationProvider } from 'next-auth/client';
import PlausibleProvider from 'next-plausible';
import { Hydrate } from 'react-query/hydration';
import store from 'store';

import { HelpProvider } from 'hooks/help';
import { MultipleModalProvider } from 'hooks/modal';
import { ToastProvider } from 'hooks/toast';

import Loading from 'layout/loading';
import { MediaContextProvider } from 'layout/media';

import 'styles/tailwind.css';

const MarxanApp: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  const [routeLoading, setRouteLoading] = useState({
    loading: false,
    key: 0,
  });
  const queryClientRef = useRef(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  const router = useRouter();
  const { pathname } = router;
  const reportsRegex = /reports/;

  const onRouteChangeStart = useCallback(() => {
    setRouteLoading((prevState) => ({
      ...prevState,
      loading: true,
      key: prevState.key + 1,
    }));
  }, []);

  const onRouteChangeEnd = useCallback(() => {
    setRouteLoading((prevState) => ({
      ...prevState,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    router.events.on('routeChangeStart', onRouteChangeStart);
    router.events.on('routeChangeComplete', onRouteChangeEnd);
    router.events.on('routeChangeError', onRouteChangeEnd);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      router.events.off('routeChangeComplete', onRouteChangeEnd);
      router.events.off('routeChangeError', onRouteChangeEnd);
    };
  }, []); // eslint-disable-line

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
            <MediaContextProvider>
              <OverlayProvider>
                <MultipleModalProvider>
                  <ToastProvider
                    placement="top-right"
                    defaultAutoDismiss
                    defaultAutoDismissTime={5000}
                  >
                    <HelpProvider>
                      <PlausibleProvider domain="marxan.vercel.app">
                        <Loading {...routeLoading} />
                        <div className={cx({
                          'bg-black': !reportsRegex.test(pathname),
                          'bg-white': reportsRegex.test(pathname),
                        })}
                        >
                          <Component {...pageProps} />
                        </div>
                      </PlausibleProvider>
                    </HelpProvider>
                  </ToastProvider>
                </MultipleModalProvider>
              </OverlayProvider>
            </MediaContextProvider>
          </AuthenticationProvider>
        </Hydrate>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default MarxanApp;
