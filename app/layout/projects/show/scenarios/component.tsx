import React, { useState } from 'react';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal';
import ScenarioItem from 'components/scenarios/item';

import ScenarioTypes from 'layout/projects/show/scenarios/scenario-type';

import bgScenariosDashboard from 'images/bg-scenarios-dashboard.png';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import { useScenarios } from 'hooks/scenarios';

export interface ProjectScenariosProps {
}

export const ProjectScenarios: React.FC<ProjectScenariosProps> = () => {
  const [modal, setModal] = useState(false);
  const { query } = useRouter();
  const { pid } = query;
  const {
    isFetching: projectIsFetching,
    isFetched: projectIsFetched,
  } = useProject(pid);

  const {
    data: scenariosData = [],
    isFetching: scenariosAreFetching,
    isFetched: scenariosAreFetched,
  } = useScenarios(pid);

  const loading = (
    projectIsFetching && !projectIsFetched
  ) || (
    scenariosAreFetching && !scenariosAreFetched
  );

  return (
    <AnimatePresence>
      {!loading && !scenariosData.length && (
        <motion.div
          key="project-scenarios-empty"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="flex items-center pl-20 bg-gray-700 bg-right bg-no-repeat bg-contain rounded-4xl"
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

      {!loading && !!scenariosData.length && (
        <motion.div key="projects-scenarios">
          {scenariosData.map((s) => {
            return <ScenarioItem className="mb-3" key={`${s.id}`} {...s} status="draft" />;
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
