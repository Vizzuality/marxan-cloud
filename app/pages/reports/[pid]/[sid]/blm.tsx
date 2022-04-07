import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import ScreenshotMap from 'layout/scenarios/reports/blm/map';
import WebShotStatus from 'layout/scenarios/reports/blm/webshot-status';

export const getServerSideProps = withProtection(withUser());

const BLMScreenshot: React.FC = () => {
  return (
    <>
      <Head title="BLM screenshot" />

      <ScreenshotMap id="blm-map-1" />

      <WebShotStatus />
    </>
  );
};

export default BLMScreenshot;
