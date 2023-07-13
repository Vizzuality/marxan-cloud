import { useState, useCallback } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import Breadcrumb from 'components/breadcrumb';
import HelpBeacon from 'layout/help/beacon';
import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Sidebar from 'layout/project/sidebar';
import ProjectNewForm from 'layout/projects/new/form';
import { NewProjectFields } from 'layout/projects/new/form';
import ProjectNewMap from 'layout/projects/new/map';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser());

const NewProjectsPage = (): JSX.Element => {
  const { push } = useRouter();
  const [formValues, setFormValues] = useState<NewProjectFields>();

  const { bbox } = useSelector((state) => state['/projects/new']);

  const handleClickBreadcrumb = useCallback(() => {
    push('/projects');
  }, [push]);

  return (
    <Protected>
      <ProjectTitle title="New" />
      <MetaIcons />
      <ProjectLayout className="z-10">
        <Sidebar>
          <div className="flex flex-col">
            <Breadcrumb onClick={handleClickBreadcrumb}>All projects</Breadcrumb>
            <ProjectNewForm
              onFormUpdate={(_formValues) => {
                setFormValues(_formValues);
              }}
            />
          </div>
        </Sidebar>

        <HelpBeacon
          id="project-new-map"
          title="MAP VIEW"
          subtitle="New planning area and grid"
          content={
            <div className="space-y-2">
              <p>
                On the map you will be able to see your selected or uploaded planning area and grid.
              </p>
              <p>
                If you are creating a new grid, you can change the shape and size of the planning
                units and look at the different results here to find the best combination for your
                conservation plan.
              </p>
            </div>
          }
          modifiers={['flip']}
          tooltipPlacement="right"
        >
          <div className="h-full w-full">
            <ProjectNewMap
              bbox={bbox}
              country={formValues?.countryId}
              region={formValues?.adminAreaLevel1Id}
              subregion={formValues?.adminAreaLevel2Id}
              planningUnitGridShape={formValues?.planningUnitGridShape}
              planningUnitAreakm2={formValues?.planningUnitAreakm2}
              PAOptionSelected={formValues?.PAOptionSelected}
            />
          </div>
        </HelpBeacon>
      </ProjectLayout>
    </Protected>
  );
};

export default NewProjectsPage;
