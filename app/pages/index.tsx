import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Button from 'components/button';

import { useToasts } from 'hooks/toast';

const Home: React.FC = () => {
  const { addToast } = useToasts();

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="lg" />

        <Button
          theme="primary"
          size="base"
          onClick={() => addToast(null, 'hola!', {
            level: 'success',
          })}
        >
          Hey!
        </Button>
      </main>
    </>
  );
};

export default Home;
