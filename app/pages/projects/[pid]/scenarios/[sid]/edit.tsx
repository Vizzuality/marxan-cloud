import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';
import { withScenario } from 'hoc/scenarios';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useScenario } from 'hooks/scenarios';

import Header from 'layout/header';
import Help from 'layout/help/button';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import SidebarEditAnalysis from 'layout/scenarios/edit/analysis';
import SidebarEditFeatures from 'layout/scenarios/edit/features';
import ScenarioEditsMap from 'layout/scenarios/edit/map';
import ScenariosEditSidebar from 'layout/scenarios/edit/sidebar';
import { ScenarioSidebarTabs } from 'layout/scenarios/edit/sidebar/types';
import SidebarEditWDPA from 'layout/scenarios/edit/wdpa';
import Title from 'layout/title/scenario-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser(withScenario()));

const EditScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const { sid } = query;
  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};
  const {
    tab: metaTab,
    subtab: metaSubtab,
  } = scenarioEditingMetadata || {};

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;
  const dispatch = useDispatch();

  useEffect(() => {
    if (metaTab) dispatch(setTab(metaTab));
    if (metaSubtab) dispatch(setSubTab(metaSubtab));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaTab, metaSubtab]);

  return (
    <Protected>
      <Title title="Edit" />

      <MetaIcons />

      <Help />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col py-2.5 overflow-hidden flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosEditSidebar>
                <SidebarEditWDPA key={ScenarioSidebarTabs.PROTECTED_AREAS} />
                <SidebarEditFeatures key={ScenarioSidebarTabs.FEATURES} />
                <SidebarEditAnalysis key={ScenarioSidebarTabs.ANALYSIS} />
              </ScenariosEditSidebar>
              <ScenarioEditsMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default EditScenarioPage;
