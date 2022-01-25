import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';

import cx from 'classnames';

import { useProjects, useDeleteProject, useDuplicateProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';
import Wrapper from 'layout/wrapper';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Loading from 'components/loading';
import Item from 'components/projects/item';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

export interface ProjectsListProps {

}

export const ProjectsList: React.FC<ProjectsListProps> = () => {
  const { search } = useSelector((state) => state['/projects']);
  const { data, isFetching, isFetched } = useProjects({ search });

  const [deleteProject, setDelete] = useState(null);
  const deleteMutation = useDeleteProject({});

  const { addToast } = useToasts();

  const onDelete = useCallback(() => {
    deleteMutation.mutate({ id: deleteProject.id }, {
      onSuccess: () => {
        addToast(`success-project-delete-${deleteProject.id}`, (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              {`Project "${deleteProject.name}" deleted`}
            </p>
          </>
        ), {
          level: 'success',
        });
        setDelete(null);
      },
      onError: () => {
        addToast(`error-project-delete-${deleteProject.id}`, (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              {`Project "${deleteProject.name}" could not be deleted`}
            </p>
          </>
        ), {
          level: 'error',
        });
        setDelete(null);
      },
    });
  }, [deleteProject, deleteMutation, addToast]);

  const duplicateProjectMutation = useDuplicateProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDuplicate = useCallback((projectId, projectName) => {
    duplicateProjectMutation.mutate({ id: projectId }, {
      onSuccess: ({ data: { data: s } }) => {
        addToast('success-duplicate-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              Project
              {' '}
              {projectName}
              {' '}
              duplicated
            </p>
          </>
        ), {
          level: 'success',
        });

        console.info('Project duplicated succesfully', s);
      },
      onError: () => {
        addToast('error-duplicate-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Project
              {' '}
              {projectName}
              {' '}
              not duplicated
            </p>
          </>
        ), {
          level: 'error',
        });

        console.error('Project not duplicated');
      },
    });
  }, [addToast, duplicateProjectMutation]);

  return (
    <Wrapper>
      <div className="relative pb-10">
        <Loading
          visible={isFetching && !isFetched}
          className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
          iconClassName="w-10 h-10 text-primary-500"
        />

        {isFetched && !!data.length && (
          <HelpBeacon
            id="project-list"
            title="Project list"
            subtitle="project list"
            content={(
              <div>
                You can see all your projects listed here.
                Use the search bar to help you find specific projects.

              </div>
            )}
          >
            <div
              id="projects-list"
              className={cx({
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': true,
              })}
            >
              {data.map((d) => {
                return (
                  <Item
                    key={`${d.id}`}
                    {...d}
                    onDelete={() => {
                      setDelete(d);
                    }}
                    onDuplicate={() => onDuplicate(d.id, d.name)}
                  />
                );
              })}

              <ConfirmationPrompt
                title={`Are you sure you want to delete "${deleteProject?.name}"?`}
                description="The action cannot be reverted. All the scenarios created will be removed too."
                icon={DELETE_WARNING_SVG}
                open={!!deleteProject}
                onAccept={onDelete}
                onRefuse={() => setDelete(null)}
                onDismiss={() => setDelete(null)}
              />

            </div>
          </HelpBeacon>
        )}

        {isFetched && !data.length && (
          <div className="text-white">
            No projects found
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default ProjectsList;
