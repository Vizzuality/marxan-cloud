import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import BestSolutionPage from 'layout/scenarios/reports/solutions/best-solution';
import CostSurfaceReport from 'layout/scenarios/reports/solutions/cost-surface';
import DifferentSolutionsFirstPage from 'layout/scenarios/reports/solutions/different-solutions/first';
import DifferentSolutionsSecondPage from 'layout/scenarios/reports/solutions/different-solutions/second';
import FeaturesPage from 'layout/scenarios/reports/solutions/features';
import FrequencyPage from 'layout/scenarios/reports/solutions/frequency';
import GapAnalysisPage from 'layout/scenarios/reports/solutions/gap-analysis';
import GridPage from 'layout/scenarios/reports/solutions/grid';
import ReportHeader from 'layout/scenarios/reports/solutions/header';
import PUStatusReport from 'layout/scenarios/reports/solutions/pu-status';
import ResumePage from 'layout/scenarios/reports/solutions/resume';
import SolutionsTablePage from 'layout/scenarios/reports/solutions/solutions-table';
import TargetAchievementPage from 'layout/scenarios/reports/solutions/target-achievement';
import WebShotStatus from 'layout/scenarios/reports/solutions/webshot-status';

export const getServerSideProps = withProtection(withUser());

const PAGE_CLASSES =
  'm-auto flex h-full min-h-[297mm] w-[210mm] flex-col bg-white px-[8.73mm] py-[13.49mm] text-black break-after-page';
const MainReport: React.FC = () => {
  return (
    <>
      <Head title="Solutions Report" />

      <MetaIcons />
      {/* PAGE 1 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <GridPage />
      </div>
      {/* PAGE 2 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <FrequencyPage />
      </div>
      {/* PAGE 3 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <BestSolutionPage />
      </div>
      {/* PAGE 4 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <ResumePage />
      </div>
      {/* PAGE 5 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
      </div>
      {/* PAGE 6 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <FeaturesPage />
      </div>
      {/* PAGE 7 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <div className="mt-6 flex flex-col space-y-3">
          <PUStatusReport />
          <CostSurfaceReport />
        </div>
      </div>
      {/* PAGE 8 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <SolutionsTablePage />
      </div>
      {/* PAGE 9 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <DifferentSolutionsFirstPage />
      </div>
      {/* PAGE 10 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <DifferentSolutionsSecondPage />
      </div>
      {/* PAGE 11 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <GapAnalysisPage />
      </div>
      {/* PAGE 12 */}
      <div className={PAGE_CLASSES}>
        <ReportHeader />
        <TargetAchievementPage />
      </div>

      <WebShotStatus />
    </>
  );
};

export default MainReport;
