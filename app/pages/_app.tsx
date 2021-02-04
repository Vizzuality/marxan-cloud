import React from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';

import type { AppProps } from 'next/app';

import 'styles/tailwind.css';

const queryClient = new QueryClient();

const App: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
};

export default App;
