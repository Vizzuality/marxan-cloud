import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import BestSolutionPage from 'layout/scenarios/reports/solutions/best-solution';
import DifferentSolutionsPage from 'layout/scenarios/reports/solutions/different-solutions';
import FeaturesPage from 'layout/scenarios/reports/solutions/features';
import FrequencyPage from 'layout/scenarios/reports/solutions/frequency';
import GapAnalysisPage from 'layout/scenarios/reports/solutions/gap-analysis';
import GridPage from 'layout/scenarios/reports/solutions/grid';
import ReportHeader from 'layout/scenarios/reports/solutions/header';
import ResumePage from 'layout/scenarios/reports/solutions/resume';
import SolutionsTablePage from 'layout/scenarios/reports/solutions/solutions-table';
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
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
      </div>
      {/* PAGE 6 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <FeaturesPage />
      </div>
      {/* PAGE 7 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
      </div>
      {/* PAGE 8 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <SolutionsTablePage />
      </div>
      {/* PAGE 9 & 10 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <DifferentSolutionsPage />
      </div>
      {/* PAGE 11 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
        <GapAnalysisPage />
      </div>
      {/* PAGE 12 */}
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader />
      </div>

      <WebShotStatus />
    </>
  );
};

export default MainReport;
