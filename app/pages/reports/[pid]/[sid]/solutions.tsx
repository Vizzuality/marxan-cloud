import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import BestSolutionPage from 'layout/scenarios/reports/solutions/best-solution-page';
import DifferentSolutionsPage from 'layout/scenarios/reports/solutions/different-solutions-page';
import FeaturesPage from 'layout/scenarios/reports/solutions/features-page';
import FrequencyPage from 'layout/scenarios/reports/solutions/frequency-page';
import GridPage from 'layout/scenarios/reports/solutions/grid-page';
import ReportHeader from 'layout/scenarios/reports/solutions/header';
import ResumePage from 'layout/scenarios/reports/solutions/resume-page';
import SettingsPage from 'layout/scenarios/reports/solutions/settings-page';
import WebShotStatus from 'layout/scenarios/reports/solutions/webshot-status';

export const getServerSideProps = withProtection(withUser());

const styles = {
  page: {
    minHeight: '297mm',
    margin: 'auto',
    padding: '8.73mm 13.49mm',
    width: '210mm',
    'break-after': 'page',
  },
};

const MainReport: React.FC = () => {
  return (
    <>
      <Head title="Solutions Report" />

      <MetaIcons />
      {/* PAGE 1 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <GridPage />
      </div>
      {/* PAGE 2 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <FrequencyPage />
      </div>
      {/* PAGE 3 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <BestSolutionPage />
      </div>
      {/* PAGE 4 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <ResumePage />
      </div>
      {/* PAGE 5 */}
      {/* PAGE 6 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <FeaturesPage />
      </div>
      {/* PAGE 7 */}
      {/* PAGE 8 */}
      {/* PAGE 9 & 10 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <DifferentSolutionsPage />
      </div>
      {/* PAGE 11 */}
      {/* PAGE 12 */}

      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <SettingsPage />
      </div>

      <WebShotStatus />
    </>
  );
};

export default MainReport;
