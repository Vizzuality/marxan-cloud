import React, { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import { SCENARIO_EDITING_META_DATA_DEFAULT_VALUES } from 'utils/utils-scenarios';

import { useScenario, useSaveScenario } from 'hooks/scenarios';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import ScenariosMap from 'layout/scenarios/map';
import ScenariosSidebar from 'layout/scenarios/sidebar';
import SidebarAnalysis from 'layout/scenarios/sidebar/analysis';
import SidebarFeatures from 'layout/scenarios/sidebar/features';
import SidebarSolutions from 'layout/scenarios/sidebar/solutions';
import { ScenarioSidebarTabs } from 'layout/scenarios/sidebar/types';
import SidebarWDPA from 'layout/scenarios/sidebar/wdpa';
import Title from 'layout/title/scenario-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser());

const ShowScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const { sid } = query;
  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });
  const saveDefaultTabsStatus = useCallback(async () => {
    saveScenarioMutation.mutate({
      id: `${sid}`,
      data: {
        ...scenarioData,
        metadata: {
          ...metadata,
          scenarioEditingMetadata: SCENARIO_EDITING_META_DATA_DEFAULT_VALUES,
        },
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveScenarioMutation, sid, metadata]);

  useEffect(() => {
    if (!scenarioEditingMetadata) saveDefaultTabsStatus();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioEditingMetadata]);

  return (
    <Protected>
      <Title title="Detail" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col py-2.5 overflow-hidden flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar>
                <SidebarWDPA key={ScenarioSidebarTabs.PROTECTED_AREAS} readOnly />
                <SidebarFeatures key={ScenarioSidebarTabs.FEATURES} readOnly />
                <SidebarAnalysis key={ScenarioSidebarTabs.ANALYSIS} readOnly />
                <SidebarSolutions key={ScenarioSidebarTabs.SOLUTIONS} readOnly />
              </ScenariosSidebar>
              <ScenariosMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default ShowScenarioPage;
