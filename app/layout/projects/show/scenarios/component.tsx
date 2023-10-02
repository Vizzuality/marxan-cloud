import React, { Fragment, useCallback, useState } from 'react';

import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
import { flatten } from 'lodash';

import { useCanEditProject } from 'hooks/permissions';
import { useProject } from 'hooks/projects';
import {
  useDeleteScenario,
  useScenarios,
  useDuplicateScenario,
  useCancelRunScenario,
} from 'hooks/scenarios';
import useBottomScrollListener from 'hooks/scroll';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Modal from 'components/modal';
import ScenarioItem from 'components/scenarios/item';
import HelpBeacon from 'layout/help/beacon';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';
import ScenarioSettings from 'layout/projects/show/scenarios/settings';
import ScenarioToolbar from 'layout/projects/show/scenarios/toolbar';
import ScenarioTypes from 'layout/projects/show/scenarios/types';
import { cn } from 'utils/cn';

import bgScenariosDashboard from 'images/bg-scenarios-dashboard.png';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

export interface ProjectScenariosProps {}

export const ProjectScenarios: React.FC<ProjectScenariosProps> = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const [modal, setModal] = useState(false);
  const [deleteScenario, setDelete] = useState(null);

  const { search, filters, sort } = useSelector((state) => state['/projects/[id]']);

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const editable = useCanEditProject(pid);

  const { isFetching: projectIsFetching, isFetched: projectIsFetched } = useProject(pid);

  const {
    data: scenariosData,
    fetchNextPage: scenariosFetchNextPage,
    hasNextPage,
    isFetching: scenariosIsFetching,
    isFetchingNextPage: scenariosIsFetchingNextPage,
    isFetched: scenariosIsFetched,
  } = useScenarios(pid, {
    search,
    filters: {
      projectId: pid,
      ...filters,
    },
    sort,
  });

  const scrollRef = useBottomScrollListener(() => {
    if (hasNextPage) scenariosFetchNextPage();
  });

  const projectLoading = projectIsFetching && !projectIsFetched;
  const scenariosLoading = scenariosIsFetching && !scenariosIsFetched;
  const hasScenarios = !!scenariosData.length;
  const hasFilters = !!flatten(Object.values(filters)).length;

  // DELETE
  const deleteMutation = useDeleteScenario({});

  const onDelete = useCallback(() => {
    deleteMutation.mutate(
      { id: deleteScenario.id },
      {
        onSuccess: () => {
          addToast(
            `success-scenario-delete-${deleteScenario.id}`,
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">{`Scenario "${deleteScenario.name}" deleted`}</p>
            </>,
            {
              level: 'success',
            }
          );
          queryClient.invalidateQueries(['scenarios', pid]);
          setDelete(null);
        },
        onError: () => {
          addToast(
            `error-project-delete-${deleteScenario.id}`,
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">{`Project "${deleteScenario.name}" could not be deleted`}</p>
            </>,
            {
              level: 'error',
            }
          );
          setDelete(null);
        },
      }
    );
  }, [deleteScenario, deleteMutation, queryClient, pid, addToast]);

  // DUPLICATE
  const duplicateScenarioMutation = useDuplicateScenario({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDuplicate = useCallback(
    (scenarioId, scenarioName) => {
      duplicateScenarioMutation.mutate(
        { sid: scenarioId },
        {
          onSuccess: ({ data: { data: s } }) => {
            addToast(
              'success-duplicate-project',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Scenario {scenarioName} start duplicating</p>
              </>,
              {
                level: 'success',
              }
            );

            console.info('Scenario duplicated successfully', s);
          },
          onError: () => {
            addToast(
              'error-duplicate-scenario',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario {scenarioName} not duplicated</p>
              </>,
              {
                level: 'error',
              }
            );

            console.error('Scenario not duplicated');
          },
        }
      );
    },
    [addToast, duplicateScenarioMutation]
  );

  // CANCEL RUN
  const cancelRunMutation = useCancelRunScenario({});
  const onCancelRun = useCallback(
    (scenarioId, scenarioName) => {
      cancelRunMutation.mutate(
        { id: scenarioId },
        {
          onSuccess: ({ data: { data: s } }) => {
            addToast(
              'success-cancel-scenario',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Scenario {scenarioName} canceled</p>
              </>,
              {
                level: 'success',
              }
            );

            console.info('Scenario canceled successfully', s);
          },
          onError: () => {
            addToast(
              'error-cancel-scenario',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario {scenarioName} not canceled</p>
              </>,
              {
                level: 'error',
              }
            );

            console.error('Scenario not canceled');
          },
        }
      );
    },
    [addToast, cancelRunMutation]
  );

  return (
    <AnimatePresence>
      <div
        key="project-scenarios-sidebar"
        className="relative col-span-7 flex flex-grow flex-col overflow-hidden"
      >
        <Loading
          visible={projectLoading || scenariosLoading}
          className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
          iconClassName="w-10 h-10 text-primary-500"
        />

        <div key="projects-scenarios" className="relative flex flex-grow flex-col overflow-hidden">
          {(hasScenarios || search || hasFilters) && <ScenarioToolbar />}

          <div className="relative overflow-hidden" id="scenarios-list">
            {!hasScenarios && (search || hasFilters) && (
              <div className="py-6">
                <NoResults />
              </div>
            )}

            {hasScenarios && (
              <div
                ref={scrollRef}
                className="relative z-0 flex h-full flex-grow flex-col overflow-y-auto overflow-x-hidden py-6"
              >
                {scenariosData.map((s, i) => {
                  const TAG = i === 0 ? HelpBeacon : Fragment;

                  return (
                    <TAG
                      key={`${s.id}`}
                      {...(i === 0 && {
                        id: `project-scenario-${s.id}`,
                        title: 'Scenario list',
                        subtitle: 'List and detail overview',
                        content: (
                          <div>
                            This is the list of all the scenarios you create under a project. You
                            can access, edit and view scenarios. Updates on scenario edits and
                            analysis are provided. Warnings will be issued if the scenario is
                            currently being edited by another contributor.
                          </div>
                        ),
                      })}
                    >
                      <div
                        className={cn({
                          'mt-3': i !== 0,
                        })}
                      >
                        <ScenarioItem
                          {...s}
                          onDelete={() => {
                            setDelete(s);
                          }}
                          onDuplicate={() => onDuplicate(s.id, s.name)}
                          onCancelRun={() => onCancelRun(s.id, s.name)}
                          SettingsC={<ScenarioSettings sid={s.id} />}
                        />
                      </div>
                    </TAG>
                  );
                })}
              </div>
            )}

            <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-black via-black" />

            <div
              className={cn({
                'opacity-100': scenariosIsFetchingNextPage,
                'pointer-events-none absolute bottom-0 left-0 z-20 w-full text-center font-heading text-xs uppercase opacity-0 transition':
                  true,
              })}
            >
              <div className="bg-gray-300 py-1">Loading more...</div>
              <div className="h-6 w-full bg-white" />
            </div>
          </div>

          {!hasScenarios && !search && !hasFilters && scenariosIsFetched && (
            <motion.div
              // key="project-scenarios-empty"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="flex h-full items-center rounded-[40px] bg-gray-800 bg-contain bg-right bg-no-repeat pl-20"
              style={{
                backgroundImage: `url(${bgScenariosDashboard})`,
              }}
            >
              <div>
                <div className="flex space-x-3">
                  <h2 className="font-heading text-lg font-medium">Scenario dashboard</h2>
                  <InfoButton>
                    <span className="space-y-2">
                      <p>
                        A scenario is an individual planning activity with specific configurations
                        of conservation areas, features, targets and parameters.
                      </p>
                      <p>
                        You can create as many scenarios as needed to explore different
                        possibilities.
                      </p>
                    </span>
                  </InfoButton>
                </div>
                <h3 className="mt-1 font-heading text-lg font-medium text-gray-400">
                  Get started by creating a scenario
                </h3>

                <Button
                  theme="primary"
                  size="lg"
                  className="mt-10"
                  disabled={!editable}
                  onClick={() => setModal(true)}
                >
                  <span className="mr-5">Create scenario</span>
                  <Icon icon={PLUS_SVG} className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {(hasScenarios || search || hasFilters) && (
            <button
              type="button"
              className={cn({
                'group flex h-16 w-full flex-shrink-0 items-center justify-center space-x-3 rounded-3xl bg-gray-800 px-8 text-sm text-primary-500 transition hover:bg-gray-900':
                  true,
                'pointer-events-none opacity-50': !editable,
              })}
              disabled={!editable}
              onClick={() => setModal(true)}
            >
              <span>Create scenario</span>
              <Icon
                icon={PLUS_SVG}
                className="h-4 w-4 transform transition group-hover:rotate-90"
              />
            </button>
          )}
        </div>

        <Modal title="Hello" open={modal} size="wide" onDismiss={() => setModal(false)}>
          <ScenarioTypes />
        </Modal>

        <ConfirmationPrompt
          title={`Are you sure you want to delete "${deleteScenario?.name}"?`}
          description="The action cannot be reverted."
          icon={DELETE_WARNING_SVG}
          open={!!deleteScenario}
          onAccept={onDelete}
          onRefuse={() => setDelete(null)}
          onDismiss={() => setDelete(null)}
        />
      </div>
    </AnimatePresence>
  );
};

export default ProjectScenarios;
