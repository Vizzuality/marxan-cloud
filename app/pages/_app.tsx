import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';

import cx from 'classnames';

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { OverlayProvider } from '@react-aria/overlays';
import { SessionProvider as AuthenticationProvider } from 'next-auth/react';
import PlausibleProvider from 'next-plausible';
import { Hydrate } from 'react-query/hydration';

import { HelpProvider } from 'hooks/help';
import { MultipleModalProvider } from 'hooks/modal';
import { ToastProvider } from 'hooks/toast';

import Loading from 'layout/loading';
import { MediaContextProvider } from 'layout/media';
import store from 'store';

import 'styles/globals.css';

const MarxanApp = ({ Component, pageProps }: AppProps) => {
  const [routeLoading, setRouteLoading] = useState({
    loading: false,
    key: 0,
  });
  const queryClientRef = useRef(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  const router = useRouter();
  const { pathname } = router;
  const lightThemeRegex = /reports|admin/;

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
    <CookiesProvider>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClientRef.current}>
          <Hydrate state={pageProps.dehydratedState}>
            <AuthenticationProvider session={pageProps.session} refetchInterval={5 * 60}>
              <MediaContextProvider disableDynamicMediaQueries>
                <OverlayProvider>
                  <MultipleModalProvider>
                    <ToastProvider
                      placement="top-right"
                      defaultAutoDismiss
                      defaultAutoDismissTime={5000}
                    >
                      <HelpProvider>
                        <PlausibleProvider domain="marxanplanning.org">
                          <Loading {...routeLoading} />

                          <div
                            className={cx({
                              'bg-black': !lightThemeRegex.test(pathname),
                              'bg-white': lightThemeRegex.test(pathname),
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
    </CookiesProvider>
  );
};

export default MarxanApp;
