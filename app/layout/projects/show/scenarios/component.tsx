import React, {
  Fragment, useCallback, useState, useMemo,
} from 'react';

import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';
import {
  useDeleteScenario, useScenarios, useDuplicateScenario, useCancelRunScenario,
} from 'hooks/scenarios';
import useBottomScrollListener from 'hooks/scroll';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';
import ScenarioSettings from 'layout/projects/show/scenarios/settings';
import ScenarioToolbar from 'layout/projects/show/scenarios/toolbar';
import ScenarioTypes from 'layout/projects/show/scenarios/types';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Modal from 'components/modal';
import ScenarioItem from 'components/scenarios/item';

import bgScenariosDashboard from 'images/bg-scenarios-dashboard.png';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

export interface ProjectScenariosProps {
}

export const ProjectScenarios: React.FC<ProjectScenariosProps> = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const [modal, setModal] = useState(false);
  const [deleteScenario, setDelete] = useState(null);

  const { search, filters, sort } = useSelector((state) => state['/projects/[id]']);

  const { query } = useRouter();
  const { pid } = query;
  const {
    isFetching: projectIsFetching,
    isFetched: projectIsFetched,
  } = useProject(pid);

  const {
    data: rawScenariosData,
    isFetching: rawScenariosIsFetching,
    isFetched: rawScenariosIsFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
  });

  const {
    data: allScenariosData,
    fetchNextPage: allScenariosfetchNextPage,
    hasNextPage,
    isFetching: allScenariosIsFetching,
    isFetchingNextPage: allScenariosIsFetchingNextPage,
    isFetched: allScenariosIsFetched,
  } = useScenarios(pid, {

    search,
    filters: {
      projectId: pid,
      ...filters,
    },
    sort,
  });

  const scrollRef = useBottomScrollListener(
    () => {
      if (hasNextPage) allScenariosfetchNextPage();
    },
  );

  const loading = (projectIsFetching && !projectIsFetched)
    || (rawScenariosIsFetching && !rawScenariosIsFetched);

  // DELETE
  const deleteMutation = useDeleteScenario({});

  const onDelete = useCallback(() => {
    deleteMutation.mutate({ id: deleteScenario.id }, {
      onSuccess: () => {
        addToast(`success-project-delete-${deleteScenario.id}`, (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              {`Project "${deleteScenario.name}" deleted`}
            </p>
          </>
        ), {
          level: 'success',
        });
        queryClient.invalidateQueries(['scenarios', pid]);
        setDelete(null);
      },
      onError: () => {
        addToast(`error-project-delete-${deleteScenario.id}`, (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              {`Project "${deleteScenario.name}" could not be deleted`}
            </p>
          </>
        ), {
          level: 'error',
        });
        setDelete(null);
      },
    });
  }, [deleteScenario, deleteMutation, queryClient, pid, addToast]);

  // DUPLICATE
  const duplicateScenarioMutation = useDuplicateScenario({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDuplicate = useCallback((scenarioId, scenarioName) => {
    duplicateScenarioMutation.mutate({ id: scenarioId }, {
      onSuccess: ({ data: { data: s } }) => {
        addToast('success-duplicate-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              Scenario
              {' '}
              {scenarioName}
              {' '}
              duplicated
            </p>
          </>
        ), {
          level: 'success',
        });

        console.info('Scenario duplicated succesfully', s);
      },
      onError: () => {
        addToast('error-duplicate-scenario', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Scenario
              {' '}
              {scenarioName}
              {' '}
              not duplicated
            </p>
          </>
        ), {
          level: 'error',
        });

        console.error('Scenario not duplicated');
      },
    });
  }, [addToast, duplicateScenarioMutation]);

  // CANCEL RUN
  const cancelRunMutation = useCancelRunScenario({});
  const onCancelRun = useCallback((scenarioId, scenarioName) => {
    cancelRunMutation.mutate({ id: scenarioId }, {
      onSuccess: ({ data: { data: s } }) => {
        addToast('success-cancel-scenario', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              Scenario
              {' '}
              {scenarioName}
              {' '}
              canceled
            </p>
          </>
        ), {
          level: 'success',
        });

        console.info('Scenario canceled succesfully', s);
      },
      onError: () => {
        addToast('error-cancel-scenario', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Scenario
              {' '}
              {scenarioName}
              {' '}
              not canceled
            </p>
          </>
        ), {
          level: 'error',
        });

        console.error('Scenario not canceled');
      },
    });
  }, [addToast, cancelRunMutation]);

  const SCENARIOS_RUNNED = useMemo(() => {
    return rawScenariosData
      .map((s) => {
        if (s.jobs.find((j) => j.kind === 'run' && j.status === 'done')) {
          return s;
        }
        return null;
      })
      .filter((s) => !!s);
  }, [rawScenariosData]);

  const scenariosFilteredData = filters?.status && filters?.status.includes('running') ? SCENARIOS_RUNNED : allScenariosData;

  return (
    <AnimatePresence>
      <div key="project-scenarios-sidebar" className="flex flex-col flex-grow col-span-7 overflow-hidden">
        {!loading && !rawScenariosData.length && (
          <motion.div
            key="project-scenarios-empty"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="flex items-center h-full pl-20 bg-gray-700 bg-right bg-no-repeat bg-contain rounded-4xl"
            style={{
              backgroundImage: `url(${bgScenariosDashboard})`,
            }}
          >
            <div>
              <h2 className="text-lg font-medium font-heading">Scenario dashboard</h2>
              <h3 className="mt-1 text-lg font-medium text-gray-300 font-heading">Get started by creating a scenario</h3>

              <Button
                theme="primary"
                size="lg"
                className="mt-10"
                onClick={() => setModal(true)}
              >
                <span className="mr-5">Create scenario</span>
                <Icon icon={PLUS_SVG} className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {!loading && !!rawScenariosData.length && (
          <motion.div key="projects-scenarios" className="relative flex flex-col flex-grow overflow-hidden">
            <ScenarioToolbar />

            <Loading
              visible={allScenariosIsFetching && !allScenariosIsFetched}
              className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
              iconClassName="w-10 h-10 text-primary-500"
            />

            <ConfirmationPrompt
              title={`Are you sure you want to delete "${deleteScenario?.name}"?`}
              description="The action cannot be reverted."
              icon={DELETE_WARNING_SVG}
              open={!!deleteScenario}
              onAccept={onDelete}
              onRefuse={() => setDelete(null)}
              onDismiss={() => setDelete(null)}
            />

            <div className="relative overflow-hidden" id="scenarios-list">
              <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-black via-black" />
              <div ref={scrollRef} className="relative z-0 flex flex-col flex-grow h-full py-6 overflow-x-hidden overflow-y-auto">
                {!!scenariosFilteredData.length
                  && scenariosFilteredData.map((s, i) => {
                    const TAG = i === 0 ? HelpBeacon : Fragment;

                    return (
                      <TAG
                        key={`${s.id}`}
                        {...i === 0 && {
                          id: `project-scenario-${s.id}`,
                          title: 'Scenario list',
                          subtitle: 'List and detail overview',
                          content: (
                            <div>
                              Here you can see listed all the scenarios under the same project.
                              You can access a scenario and edit it at any time, unless there is
                              a contributor working on the same scenario. In this case, you will see
                              a warning.
                            </div>
                          ),
                        }}
                      >
                        <div
                          className={cx({
                            'mt-3': i !== 0,
                          })}
                        >
                          <ScenarioItem
                            {...s}
                            status="draft"
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

                {!scenariosFilteredData.length && (
                  <div>
                    No results found
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-black via-black" />
              <div
                className={cx({
                  'opacity-100': allScenariosIsFetchingNextPage,
                  'absolute left-0 z-20 w-full text-xs text-center uppercase bottom-0 font-heading transition opacity-0 pointer-events-none': true,
                })}
              >
                <div className="py-1 bg-gray-200">Loading more...</div>
                <div className="w-full h-6 bg-white" />
              </div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center flex-shrink-0 w-full h-16 px-8 space-x-3 text-sm transition bg-gray-700 rounded-3xl text-primary-500 group hover:bg-gray-800"
              onClick={() => setModal(true)}
            >
              <span>Create scenario</span>
              <Icon icon={PLUS_SVG} className="w-4 h-4 transition transform group-hover:rotate-90" />
            </button>
          </motion.div>
        )}
      </div>

      <Modal
        title="Hello"
        open={modal}
        size="wide"
        onDismiss={() => setModal(false)}
      >
        <ScenarioTypes />
      </Modal>
    </AnimatePresence>
  );
};

export default ProjectScenarios;
