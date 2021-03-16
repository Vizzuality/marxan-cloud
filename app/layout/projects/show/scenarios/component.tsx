import React from 'react';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';

import bgScenariosDashboard from 'images/bg-scenarios-dashboard.png';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import Link from 'next/link';

export interface ProjectScenariosProps {
}

export const ProjectScenarios: React.FC<ProjectScenariosProps> = () => {
  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const { id, scenarios = [] } = data;

  return (
    <AnimatePresence>
      {id && !scenarios.length && (
        <motion.div
          key="project-scenarios"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
          className="flex items-center pl-20 bg-gray-700 bg-right bg-no-repeat rounded-4xl"
          style={{
            backgroundImage: `url(${bgScenariosDashboard})`,
          }}
        >
          <div>
            <h2 className="text-lg font-medium font-heading">Scenario dashboard</h2>
            <h3 className="mt-1 text-lg font-medium text-gray-300 font-heading">Get started by creating a scenario</h3>

            <Link
              href={`/projects/${pid}/scenarios/new`}
            >
              <Button
                theme="primary"
                size="lg"
                className="mt-10"
              >
                <span className="mr-5">Create scenario</span>
                <Icon icon={PLUS_SVG} className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectScenarios;
