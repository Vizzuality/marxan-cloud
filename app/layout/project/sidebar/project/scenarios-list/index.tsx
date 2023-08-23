import React, { Fragment, useCallback, useState } from 'react';

import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
import HelpBeacon from 'layout/help/beacon';
import ScenarioToolbar from 'layout/project/sidebar/project/scenarios-list/toolbar';
import { flatten } from 'lodash';
import { cn } from 'utils/cn';

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
import Loading from 'components/loading';
import Modal from 'components/modal';

import bgScenariosDashboard from 'images/new-layout/bg-scenarios-dashboard.png';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

import ScenarioItem from './scenario-item';
import ScenarioTypes from './types';

export const ScenariosList: React.FC = () => {
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
          onSuccess: () => {
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
          },
        }
      );
    },
    [addToast, duplicateScenarioMutation]
  );

  const cancelRunMutation = useCancelRunScenario({});

  const onCancelRun = useCallback(
    (scenarioId, scenarioName) => {
      cancelRunMutation.mutate(
        { id: scenarioId },
        {
          onSuccess: () => {
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
                <>No results found</>
              </div>
            )}

            {hasScenarios && (
              <div
                ref={scrollRef}
                className="relative z-0 flex h-full max-h-[calc(100vh-400px)] flex-grow flex-col overflow-y-auto overflow-x-hidden py-6"
              >
                <ul className="space-y-3">
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
                        <li>
                          <ScenarioItem
                            {...s}
                            id={s.id}
                            onDelete={() => {
                              setDelete(s);
                            }}
                            onDuplicate={() => onDuplicate(s.id, s.name)}
                            onCancelRun={() => onCancelRun(s.id, s.name)}
                          />
                        </li>
                      </TAG>
                    );
                  })}
                </ul>
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
              <div className="bg-gray-200 py-1">Loading more...</div>
              <div className="h-6 w-full bg-white" />
            </div>
          </div>

          {!hasScenarios && !search && !hasFilters && scenariosIsFetched && (
            <div className="flex flex-col space-y-2">
              <motion.div
                key="project-scenarios-empty"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="flex flex-col items-center space-y-9 rounded-3xl bg-gray-700 bg-cover bg-right bg-no-repeat py-10"
                style={{
                  backgroundImage: `url(${bgScenariosDashboard})`,
                }}
              >
                <div className="mx-12 mt-48 flex flex-col items-center">
                  <p className="mt-1 text-center font-sans text-xs font-medium text-gray-300">
                    Before we can show you any results, we&lsquo;ll need you to{' '}
                    <span className="text-white">
                      upload some features, protected areas or cost surface
                    </span>{' '}
                    that are essential to the analysis.
                  </p>
                </div>
                <div className="mx-10 flex flex-wrap justify-center gap-2">
                  <Link href={`/projects/${pid}/?tab=protected-areas`}>
                    <div className="inline-block rounded-xl bg-gray-500 px-2.5 py-1 text-sm text-white transition-colors hover:bg-gray-400">
                      Upload Protected Areas
                    </div>
                  </Link>
                  <Link href={`/projects/${pid}/?tab=cost-surface`}>
                    <div className="inline-block rounded-xl bg-gray-500 px-2.5 py-1 text-sm text-white transition-colors hover:bg-gray-400">
                      Upload Cost Surface
                    </div>
                  </Link>
                  <Link href={`/projects/${pid}/?tab=features`}>
                    <div className="inline-block rounded-xl bg-gray-500 px-2.5 py-1 text-sm text-white transition-colors hover:bg-gray-400">
                      Upload Features
                    </div>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                key="project-scenarios-empty"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="h-fit flex items-center justify-center rounded-3xl bg-gray-700 py-6"
              >
                <Button
                  theme="primary"
                  size="base"
                  className="!px-5"
                  disabled={!editable}
                  onClick={() => setModal(true)}
                >
                  <span className="mr-5">Create scenario</span>
                  <Icon icon={PLUS_SVG} className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          )}

          {(hasScenarios || search || hasFilters) && (
            <div className="flex w-full flex-shrink-0 items-center justify-center rounded-[20px] bg-gray-700 p-6">
              <Button
                theme="primary"
                size="base"
                className="!px-5"
                disabled={!editable}
                onClick={() => setModal(true)}
              >
                <span className="mr-5">Create scenario</span>
                <Icon icon={PLUS_SVG} className="h-4 w-4" />
              </Button>
            </div>
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

export default ScenariosList;
