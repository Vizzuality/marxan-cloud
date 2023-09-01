import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Breadcrumbs from 'layout/project/navigation/breadcrumbs';
import Sidebar from 'layout/project/sidebar';
import InventoryProjectHeader from 'layout/project/sidebar/project/header';
import InventoryPanel from 'layout/project/sidebar/project/inventory-panel';
import ScenariosList from 'layout/project/sidebar/project/scenarios-list';
import ProjectMap from 'layout/projects/show/map';
import ProjectStatus from 'layout/projects/show/status';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser(withProject()));

const ShowProjectsPage = (): JSX.Element => {
  const { query } = useRouter();
  const { tab } = query as { tab: string };

  return (
    <Protected>
      <ProjectTitle title="" />
      <MetaIcons />
      <ProjectLayout className="relative z-10">
        <Sidebar className="flex-col">
          <Breadcrumbs />
          <InventoryProjectHeader />
          {tab && <InventoryPanel />}
          {!tab && <ScenariosList />}
        </Sidebar>
        <ProjectStatus />
        <ProjectMap />
      </ProjectLayout>
    </Protected>
  );
};

export default ShowProjectsPage;
