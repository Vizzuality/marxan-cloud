import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Sidebar from 'layout/project/sidebar';
import Protected from 'layout/protected';
import ScenarioNewMap from 'layout/scenarios/new/map';
import SidebarName from 'layout/scenarios/new/name';
import ScenariosSidebar from 'layout/scenarios/sidebar';
import Title from 'layout/title/scenario-title';

export const getServerSideProps = withProtection(withUser(withProject()));

const NewScenarioPage = (): JSX.Element => {
  return (
    <Protected>
      <Title title="New" />
      <MetaIcons />
      <ProjectLayout className="z-10">
        <Sidebar>
          <ScenariosSidebar>
            <SidebarName />
          </ScenariosSidebar>
        </Sidebar>
        <ScenarioNewMap />
      </ProjectLayout>
    </Protected>
  );
};

export default NewScenarioPage;
