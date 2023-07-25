import React from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import { useScenario } from 'hooks/scenarios';
import { useBestSolution, useSolution } from 'hooks/solutions';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import ReportHeader from 'layout/scenarios/reports/solutions/header';
import IntroPage from 'layout/scenarios/reports/solutions/intro-page';
import SelectedSolutionPage from 'layout/scenarios/reports/solutions/selected-solution-page';
import SelectionFrequencyPage from 'layout/scenarios/reports/solutions/selection-frequency-page';
import SettingsPage from 'layout/scenarios/reports/solutions/settings-page';
import WebShotStatus from 'layout/scenarios/reports/solutions/webshot-status';

export const getServerSideProps = withProtection(withUser());

const styles = {
  page: {
    minHeight: '200mm',
    margin: 'auto',
    padding: '8.73mm 13.49mm',
    width: '297mm',
    'break-after': 'page',
  },
};

const SolutionsReport: React.FC = () => {
  const { query } = useRouter();
  const { sid, solutionId } = query as { sid: string; solutionId: string };

  const { data: scenarioData } = useScenario(sid);

  const { data: selectedSolutionData } = useSolution(sid, solutionId);

  const { data: bestSolutionData } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const { runId: solutionNumber } = selectedSolutionData || bestSolutionData;

  return (
    <>
      <Head title="Solutions Report" />

      <MetaIcons />
      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <IntroPage />
      </div>

      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader title="Selection Frequency" />
        <SelectionFrequencyPage />
      </div>

      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader title={`Selected Solution: ${solutionNumber}`} />
        <SelectedSolutionPage />
      </div>

      <div style={styles.page} className="flex h-full flex-col bg-white text-black">
        <ReportHeader title="Settings" />
        <SettingsPage />
      </div>

      <WebShotStatus />
    </>
  );
};

export default SolutionsReport;
