import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Sidebar from 'layout/project/sidebar';
import ProjectHeader from 'layout/projects/show/header';
import ProjectMap from 'layout/projects/show/map';
import ProjectScenarios from 'layout/projects/show/scenarios';
import ProjectStatus from 'layout/projects/show/status';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser(withProject()));

const ShowProjectsPage = (): JSX.Element => {
  return (
    <Protected>
      <ProjectTitle title="" />
      <MetaIcons />
      <ProjectLayout className="relative z-10">
        <Sidebar className="flex-col">
          <ProjectHeader />
          <ProjectScenarios />
        </Sidebar>
        <ProjectStatus />
        <ProjectMap />
      </ProjectLayout>
    </Protected>
  );
};

export default ShowProjectsPage;
