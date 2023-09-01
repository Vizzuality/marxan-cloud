import { withProtection, withUser } from 'hoc/auth';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Breadcrumbs from 'layout/project/navigation/breadcrumbs';
import ProjectsList from 'layout/projects/all/list';
import ProjectsToolbar from 'layout/projects/all/toolbar';
import ProjectsWelcome from 'layout/projects/all/welcome';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser());

const ProjectsPage = (): JSX.Element => {
  return (
    <Protected>
      <ProjectTitle title="" />
      <MetaIcons />
      <ProjectLayout className="w-full flex-col">
        <Wrapper>
          <div className="mt-8">
            <Breadcrumbs />
          </div>
        </Wrapper>
        <ProjectsWelcome />
        <ProjectsToolbar />
        <ProjectsList />
      </ProjectLayout>
    </Protected>
  );
};

export default ProjectsPage;
