import { useCallback, useState } from 'react';

import { withProtection, withUser } from 'hoc/auth';

import { useAppSelector } from 'store/hooks';

import HelpBeacon from 'layout/help/beacon';
import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Breadcrumbs from 'layout/project/navigation/breadcrumbs';
import Sidebar from 'layout/project/sidebar';
import ProjectNewForm from 'layout/projects/new/form';
import { NewProjectFields } from 'layout/projects/new/form';
import { ProjectFormProps } from 'layout/projects/new/form';
import ProjectNewMap from 'layout/projects/new/map';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser());

const NewProjectsPage = (): JSX.Element => {
  const [formValues, setFormValues] = useState<NewProjectFields>();

  const { bbox } = useAppSelector((state) => state['/projects/new']);

  const onFormUpdate = useCallback(
    (_formValues: Parameters<ProjectFormProps['onFormUpdate']>[0]) => {
      setFormValues(_formValues);
    },
    []
  );

  return (
    <Protected>
      <ProjectTitle title="New" />
      <MetaIcons />
      <ProjectLayout className="z-10">
        <Sidebar>
          <div className="flex h-full flex-col">
            <Breadcrumbs />
            <ProjectNewForm onFormUpdate={onFormUpdate} />
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
