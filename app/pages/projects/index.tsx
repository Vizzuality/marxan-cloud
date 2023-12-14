import { withProtection, withUser } from 'hoc/auth';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import ProjectsList from 'layout/projects/all/list';
import ProjectsToolbar from 'layout/projects/all/toolbar';
import ProjectsWelcome from 'layout/projects/all/welcome';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser());

const ProjectsPage = (): JSX.Element => {
  return (
    <Protected>
      <ProjectTitle title="" />
      <MetaIcons />
      <ProjectLayout className="h-fit w-full flex-col">
        <ProjectsWelcome />
        <ProjectsToolbar />
        <ProjectsList />
      </ProjectLayout>
    </Protected>
  );
};

export default ProjectsPage;
