import React from 'react';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';
import ScenarioItem from 'components/scenarios/item';

import bgScenariosDashboard from 'images/bg-scenarios-dashboard.png';
import PLUS_SVG from 'svgs/ui/plus.svg?sprite';
import Link from 'next/link';

// const SCENARIOS = [
//   {
//     id: 1,
//     name: 'Scenario 1',
//     status: 'running',
//     progress: 43,
//     updatedAt: '2019-04-11T10:20:30Z',
//   },
//   {
//     id: 2,
//     name: 'Scenario 2',
//     status: 'completed',
//     updatedAt: '2020-04-11T10:20:30Z',
//   },
//   {
//     id: 3,
//     name: 'Scenario 3',
//     status: 'draft',
//     updatedAt: '2020-12-23T10:20:30Z',
//   },
//   {
//     id: 4,
//     name: 'Mount Gorongosa',
//     status: 'draft',
//     updatedAt: '2020-09-23T10:20:30Z',
//     warnings: true,
//   },
//   {
//     id: 5,
//     name: 'Illas Cies',
//     status: 'draft',
//     updatedAt: '2020-12-23T10:20:30Z',
//   },
// ];

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
          key="project-scenarios-empty"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
          className="flex items-center pl-20 bg-gray-700 bg-right bg-no-repeat bg-contain rounded-4xl"
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

      {id && !!scenarios.length && (
        <motion.div key="projects-scenarios">
          {scenarios.map((s) => {
            return <ScenarioItem className="mb-3" key={`${s.id}`} {...s} />;
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectScenarios;
