import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import ReportHeader from 'layout/scenarios/reports/header';
import Page1 from 'layout/scenarios/reports/solutions/page-1';
import Page2 from 'layout/scenarios/reports/solutions/page-2';
import Page3 from 'layout/scenarios/reports/solutions/page-3';
import Page4 from 'layout/scenarios/reports/solutions/page-4';

export const getServerSideProps = withProtection(withUser());

const styles = {
  page: {
    minHeight: '200mm',
    margin: 'auto',
    padding: '8.73mm 13.49mm',
    width: '297mm',
  },
};

const SolutionsReport: React.FC = () => {
  return (
    <>
      <Head title="Solutions Report" />

      <MetaIcons />

      <div
        style={styles.page}
        className="flex flex-col h-full text-black bg-white"
      >
        <ReportHeader page={1} totalPages={4} />
        <Page1 />
      </div>

      <div
        style={styles.page}
        className="flex flex-col h-full text-black bg-white"
      >
        <ReportHeader page={2} totalPages={4} />
        <Page2 />
      </div>

      <div
        style={styles.page}
        className="flex flex-col h-full text-black bg-white"
      >
        <ReportHeader page={3} totalPages={4} />
        <Page3 />
      </div>

      <div
        style={styles.page}
        className="flex flex-col h-full text-black bg-white"
      >
        <ReportHeader page={4} totalPages={4} />
        <Page4 />
      </div>

    </>
  );
};

export default SolutionsReport;
