import React from 'react';

import type { AppProps } from 'next/app';

import 'styles/tailwind.css';

const App: React.ReactNode = ({ Component, pageProps }: AppProps) => {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
};

export default App;
