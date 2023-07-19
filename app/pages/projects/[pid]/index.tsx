import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Sidebar from 'layout/project/sidebar';
import InventoryProjectHeader from 'layout/project/sidebar/project/header';
import InventoryPanelCostSurface from 'layout/project/sidebar/project/inventory-panel/cost-surface';
import InventoryPanelFeatures from 'layout/project/sidebar/project/inventory-panel/features';
import InventoryPanelProtectedAreas from 'layout/project/sidebar/project/inventory-panel/protected-areas';
import ProjectHeader from 'layout/projects/show/header';
import ProjectMap from 'layout/projects/show/map';
import ProjectScenarios from 'layout/projects/show/scenarios';
import ProjectStatus from 'layout/projects/show/status';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser(withProject()));

const ShowProjectsPage = (): JSX.Element => {
  const { query } = useRouter();
  const { tab } = query as { tab: 'features' | 'protected-areas' | 'cost-surface' };

  return (
    <Protected>
      <ProjectTitle title="" />
      <MetaIcons />
      <ProjectLayout className="relative z-10">
        <Sidebar className="flex-col">
          {/* // !TODO: Remove this component */}
          <ProjectHeader />
          <InventoryProjectHeader />
          {tab === 'features' && <InventoryPanelFeatures />}
          {tab === 'protected-areas' && <InventoryPanelProtectedAreas />}
          {tab === 'cost-surface' && <InventoryPanelCostSurface />}
          {!tab && <ProjectScenarios />}
        </Sidebar>
        <ProjectStatus />
        <ProjectMap />
      </ProjectLayout>
    </Protected>
  );
};

export default ShowProjectsPage;
