import React, { Fragment, useCallback, useState } from 'react';

import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

import Link from 'next/link';
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
  useDownloadSolutionsSummary,
} from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Modal from 'components/modal';
import { ScrollArea } from 'components/scroll-area';
import HelpBeacon from 'layout/help/beacon';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';
import ScenarioToolbar from 'layout/project/sidebar/project/scenarios-list/toolbar';
import Section from 'layout/section';
import { cn } from 'utils/cn';

import bgScenariosDashboard from 'images/new-layout/bg-scenarios-dashboard.png';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

import ScenarioItem from './scenario-item';
import ScenarioTypes from './types';

export const ScenariosList: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const [modal, setModal] = useState<boolean>(false);
  const [deleteScenario, setDelete] = useState(null);
  const [solutionsReportLoader, setSolutionsReportLoader] = useState<boolean>(false);

  const { search, filters, sort } = useSelector((state) => state['/projects/[id]']);

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const editable = useCanEditProject(pid);

  const { isFetching: projectIsFetching, isFetched: projectIsFetched } = useProject(pid);

  const {
    data: scenariosData,
    isFetching: scenariosIsFetching,
    isFetched: scenariosIsFetched,
  } = useScenarios(pid, {
    search,
    filters: {
      projectId: pid,
      ...filters,
    },
    sort,
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

  const downloadSolutionsSummary = useDownloadSolutionsSummary();

  const onDownloadSolutionsSummary = useCallback(() => {
    setSolutionsReportLoader(true);

    downloadSolutionsSummary.mutate(
      { id: pid },
      {
        onError: () => {
          addToast(
            'download-error',
            <>
              <h2 className="font-medium">Error!</h2>
              <ul className="text-sm">Solutions report not downloaded</ul>
            </>,
            {
              level: 'error',
            }
          );
        },
        onSettled: () => {
          setSolutionsReportLoader(false);
        },
      }
    );
  }, [downloadSolutionsSummary, addToast, pid]);

  return (
    <AnimatePresence>
      <div
        key="project-scenarios-sidebar"
        className="relative flex flex-grow flex-col overflow-hidden"
      >
        <Loading
          visible={projectLoading || scenariosLoading}
          className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
          iconClassName="w-10 h-10 text-primary-500"
        />

        <div
          key="projects-scenarios"
          className="relative flex flex-grow flex-col space-y-3 overflow-hidden"
        >
          {(hasScenarios || search || hasFilters) && <ScenarioToolbar />}
          <div
            className={cn({
              'relative overflow-hidden': true,
              'relative flex h-full flex-col overflow-hidden before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-black before:via-black after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-black after:via-black':
                hasScenarios,
            })}
            id="scenarios-list"
          >
            {!hasScenarios && (search || hasFilters) && (
              <div className="py-6">
                <NoResults />
              </div>
            )}

            {hasScenarios && (
              <ScrollArea className="flex h-full flex-col overflow-hidden">
                <ul className="space-y-3 py-5">
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
              </ScrollArea>
            )}
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
            <Section className="flex w-full flex-col items-center justify-center space-y-5">
              {hasScenarios && (
                <Button
                  theme="primary-alt"
                  size="base"
                  className="flex w-full overflow-hidden uppercase"
                  disabled={solutionsReportLoader}
                  onClick={onDownloadSolutionsSummary}
                >
                  <Loading
                    visible={solutionsReportLoader}
                    className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-90"
                    iconClassName="w-10 h-10 text-primary-500"
                  />
                  {`Export scenario${scenariosData.length > 1 ? 's' : ''} data`}
                </Button>
              )}
              <Button
                theme="primary"
                size="base"
                className="px-5"
                disabled={!editable}
                onClick={() => setModal(true)}
              >
                <span className="mr-5">Create scenario</span>
                <Icon icon={PLUS_SVG} className="h-4 w-4" />
              </Button>
            </Section>
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
