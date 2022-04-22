import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import ScreenshotMap from 'layout/scenarios/reports/frequency/map';
import WebShotStatus from 'layout/scenarios/reports/frequency/webshot-status';

export const getServerSideProps = withProtection(withUser());

const FrequencyScreenshot: React.FC = () => {
  return (
    <>
      <Head title="Frequency screenshot" />

      <ScreenshotMap id="frequency-map-1" />

      <WebShotStatus />
    </>
  );
};

export default FrequencyScreenshot;
