import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import ScreenshotMap from 'layout/project/reports/comparison/map';
import WebShotStatus from 'layout/project/reports/comparison/webshot-status';

export const getServerSideProps = withProtection(withUser());

const ComparisonScreenshot: React.FC = () => {
  return (
    <>
      <Head title="Comparison screenshot" />

      <ScreenshotMap id="comparison-map-1" />

      <WebShotStatus />
    </>
  );
};

export default ComparisonScreenshot;
