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
          onClick={() => addToast(null, (
            <h2 className="font-medium">Project saved successfully!!</h2>
          ), {
            level: 'success',
          })}
        >
          Success
        </Button>

        <Button
          theme="primary"
          size="base"
          onClick={() => addToast(null, (
            <h2 className="font-medium">Error!</h2>
          ), {
            level: 'error',
          })}
        >
          Error
        </Button>

        <Button
          theme="primary"
          size="base"
          onClick={() => addToast(null, (
            <h2 className="font-medium">Warning!</h2>
          ), {
            level: 'warning',
          })}
        >
          Warning
        </Button>

        <Button
          theme="primary"
          size="base"
          onClick={() => addToast(null, (
            <div>
              <h2 className="font-medium">Info!</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </div>
          ), {
            level: 'info',
          })}
        >
          Info
        </Button>

      </main>
    </>
  );
};

export default Home;
