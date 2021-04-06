import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';
import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';
import { useDeleteScenario, useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';
import ConfirmationPrompt from 'components/confirmation-prompt';
import ScenarioItem from 'components/scenarios/item';

import ScenarioTypes from 'layout/projects/show/scenarios/types';
import ScenarioToolbar from 'layout/projects/show/scenarios/toolbar';

import bgScenariosDashboard from 'images/bg-scenarios-dashboard.png';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';
import { useQueryClient } from 'react-query';

export interface ProjectScenariosProps {
}

export const ProjectScenarios: React.FC<ProjectScenariosProps> = () => {
  const [modal, setModal] = useState(false);
  const [deleteScenario, setDelete] = useState(null);

  const { search } = useSelector((state) => state['/projects/[id]']);

  const { query } = useRouter();
  const { pid } = query;
  const {
    isFetching: projectIsFetching,
    isFetched: projectIsFetched,
  } = useProject(pid);

  const {
    data: scenariosData = [],
    rawData: rawScenariosData = [],
    isFetching: scenariosAreFetching,
    isFetched: scenariosAreFetched,
  } = useScenarios(pid, { search });

  const loading = (
    projectIsFetching && !projectIsFetched
  ) || (
    scenariosAreFetching && !scenariosAreFetched
  );

  const deleteMutation = useDeleteScenario({});
  const queryClient = useQueryClient();

  const { addToast } = useToasts();

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

  return (
    <AnimatePresence>
      <div key="project-scenarios-sidebar" className="h-full col-span-7 overflow-x-hidden overflow-y-auto">
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
          <motion.div key="projects-scenarios">
            <ScenarioToolbar />

            <ConfirmationPrompt
              title={`Are you sure you want to delete "${deleteScenario?.name}"?`}
              description="The action cannot be reverted."
              icon={DELETE_WARNING_SVG}
              open={!!deleteScenario}
              onAccept={onDelete}
              onRefuse={() => setDelete(null)}
              onDismiss={() => setDelete(null)}
            />

            {scenariosData.map((s) => {
              return (
                <ScenarioItem
                  key={`${s.id}`}
                  className="mb-3"
                  {...s}
                  status="draft"
                  onDelete={() => {
                    setDelete(s);
                  }}
                />
              );
            })}

            <button
              type="button"
              className="flex items-center justify-center w-full h-16 gap-3 px-8 text-sm bg-gray-700 rounded-3xl text-primary-500"
              onClick={() => setModal(true)}
            >
              <span>Create scenario</span>
              <Icon icon={PLUS_SVG} className="w-4 h-4" />
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
