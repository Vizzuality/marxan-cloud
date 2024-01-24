import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';

import Link from 'next/link';

import { useProjectsUsers } from 'hooks/project-users';
import { useProjects, useDeleteProject, useDuplicateProject } from 'hooks/projects';
import { useScenariosStatusOnce } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Loading from 'components/loading';
import Modal from 'components/modal';
import HelpBeacon from 'layout/help/beacon';
import Item from 'layout/projects/all/list/item';
import DownloadModal from 'layout/projects/common/download-modal';
import Wrapper from 'layout/wrapper';
import { cn } from 'utils/cn';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

export interface ProjectsListProps {}

export const ProjectsList: React.FC<ProjectsListProps> = () => {
  const { search } = useSelector((state) => state['/projects']);
  const { data, isFetching, isFetched } = useProjects({ search });
  const { data: projectsUsersData } = useProjectsUsers(data.map((p) => p.id));

  const { addToast } = useToasts();

  const areRunningJobs = useCallback((d) => {
    const { jobs = [], scenarios = [] } = d || {};

    const JOBS = [...jobs, ...scenarios.map((scenario) => scenario.jobs || []).flat()];

    return JOBS.some((job) => job.status === 'running');
  }, []);

  // STATUS
  const projectStatusMutation = useScenariosStatusOnce({});

  // DOWNLOAD
  const [downloadProject, setDownloadProject] = useState(null);

  // DUPLICATE
  const duplicateProjectMutation = useDuplicateProject({
    requestConfig: {
      method: 'POST',
    },
  });

  // DELETE
  const [deleteProject, setDeleteProject] = useState(null);
  const deleteMutation = useDeleteProject({});

  const onDuplicate = useCallback(
    (projectId, projectName, scenarios) => {
      projectStatusMutation.mutate(
        {
          pId: projectId,
        },
        {
          onSuccess: (d) => {
            if (d?.data) {
              const running = areRunningJobs(d.data);

              if (!running) {
                duplicateProjectMutation.mutate(
                  {
                    id: projectId,
                    data: {
                      scenarioIds: scenarios.map((s) => s.id),
                    },
                  },
                  {
                    onSuccess: ({ data: { data: s } }) => {
                      addToast(
                        'success-duplicate-project',
                        <>
                          <h2 className="font-medium">Success!</h2>
                          <p className="text-sm">Project {projectName} duplicated</p>
                        </>,
                        {
                          level: 'success',
                        }
                      );

                      console.info('Project duplicated succesfully', s);
                    },
                    onError: () => {
                      addToast(
                        'error-duplicate-project',
                        <>
                          <h2 className="font-medium">Error!</h2>
                          <p className="text-sm">Project {projectName} not duplicated</p>
                        </>,
                        {
                          level: 'error',
                        }
                      );

                      console.error('Project not duplicated');
                    },
                  }
                );
              }

              if (running) {
                addToast(
                  'error-duplicate-project',
                  <>
                    <h2 className="font-medium">Error!</h2>
                    <p className="text-sm">
                      Project {projectName} has running project or scenario jobs. Please wait for
                      them to finish.
                    </p>
                  </>,
                  {
                    level: 'error',
                  }
                );
              }
            }
          },
          onError: () => {},
        }
      );
    },
    [addToast, duplicateProjectMutation, projectStatusMutation, areRunningJobs]
  );

  const onDelete = useCallback(() => {
    deleteMutation.mutate(
      { id: deleteProject.id },
      {
        onSuccess: () => {
          addToast(
            `success-project-delete-${deleteProject.id}`,
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">{`Project "${deleteProject.name}" deleted`}</p>
            </>,
            {
              level: 'success',
            }
          );
          setDeleteProject(null);
        },
        onError: () => {
          addToast(
            `error-project-delete-${deleteProject.id}`,
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">{`Project "${deleteProject.name}" could not be deleted`}</p>
            </>,
            {
              level: 'error',
            }
          );
          setDeleteProject(null);
        },
      }
    );
  }, [deleteProject, deleteMutation, addToast]);

  return (
    <Wrapper>
      <div className="relative w-full pb-10">
        <Loading
          visible={isFetching && !isFetched}
          className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
          iconClassName="w-10 h-10 text-primary-500"
        />

        {isFetched && !!data.length && (
          <HelpBeacon
            id="project-list"
            title="Project list"
            content={
              <div>
                You can see all your projects listed here. Use the search bar to help you find
                specific projects.
              </div>
            }
          >
            <div
              id="projects-list"
              className={cn({
                'grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3': true,
              })}
            >
              {data.map((d) => {
                return (
                  <Item
                    key={`${d.id}`}
                    {...d}
                    userColors={projectsUsersData}
                    onDownload={() => setDownloadProject(d)}
                    onDuplicate={() => onDuplicate(d.id, d.name, d.scenarios)}
                    onDelete={() => {
                      setDeleteProject(d);
                    }}
                  />
                );
              })}

              <ConfirmationPrompt
                title={`Are you sure you want to delete "${deleteProject?.name}"?`}
                description="The action cannot be reverted. All the scenarios created will be removed too."
                icon={DELETE_WARNING_SVG}
                open={!!deleteProject}
                onAccept={onDelete}
                onRefuse={() => setDeleteProject(null)}
                onDismiss={() => setDeleteProject(null)}
              />

              <Modal
                open={!!downloadProject}
                size="narrow"
                onDismiss={() => setDownloadProject(null)}
              >
                <DownloadModal pid={downloadProject?.id} name={downloadProject?.name} />
              </Modal>
            </div>
          </HelpBeacon>
        )}

        {isFetched && !data.length && (
          <div className="mt-28 flex items-center justify-center text-base leading-8 text-white">
            <p className="text-center">
              New to Marxan? You can start by creating your first project or by going to
              <br />
              the{' '}
              <Link
                href="/community/projects"
                className="font-semibold text-primary-600 hover:underline"
              >
                community page
              </Link>{' '}
              and copying an existing project.
            </p>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default ProjectsList;
