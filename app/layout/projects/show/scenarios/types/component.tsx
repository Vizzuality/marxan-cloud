import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import cx from 'classnames';

import Icon from 'components/icon';

import SCENARIO_MARXAN_WITH_CONNECTIVITY_SVG from 'svgs/scenario-types/marxan-with-connectivity.svg?sprite';
import SCENARIO_MARXAN_WITH_ZONES_SVG from 'svgs/scenario-types/marxan-with-zones.svg?sprite';
import SCENARIO_MARXAN_SVG from 'svgs/scenario-types/marxan.svg?sprite';

const SCENARIO_TYPES = [
  {
    id: 'marxan',
    href: '/scenarios/new',
    title: 'Marxan',
    icon: SCENARIO_MARXAN_SVG,
    iconStyles: {
      width: 32,
      height: 20,
    },
    subtitle: 'Prioritizes for a single action (e.g. a protected area network)',
    disclaimer: 'If just starting out, we recommend Marxan to help you familiarize yourself with the process.',
  },
  {
    id: 'marxan-with-zones',
    href: '/scenarios/new',
    title: 'Marxan with Zones',
    icon: SCENARIO_MARXAN_WITH_ZONES_SVG,
    iconStyles: {
      width: 42,
      height: 20,
    },
    subtitle: 'Prioritizes for multiple actions simultaneously (e.g. protected areas, community-use, and sustainable use zones).',
    disabled: true,
  },
  {
    id: 'marxan-with-connectivity',
    href: '/scenarios/new',
    title: 'Marxan with Connectivity',
    icon: SCENARIO_MARXAN_WITH_CONNECTIVITY_SVG,
    iconStyles: {
      width: 42,
      height: 20,
    },
    subtitle: 'Prioritizes for one action at a time while accounting for ecological processes and flows.',
    disabled: true,
  },
];

export interface ProjectScenariosTypeProps {
}

export const ProjectScenariosType: React.FC<ProjectScenariosTypeProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  return (
    <div className="px-10 py-5 text-gray-500">
      <h2 className="text-2xl font-medium font-heading">Choose scenario type:</h2>

      <ul className="grid grid-cols-3 gap-10 my-5 -mx-5">
        {SCENARIO_TYPES.map((s) => {
          return (
            <li
              key={`${s.id}`}
              className={cx({
                'transition-all border-2 border-transparent cursor-pointer group hover:shadow-2xl rounded-3xl hover:border-gray-100': true,
                'pointer-events-none opacity-25': s.disabled,
              })}
            >
              <Link href={`/projects/${pid}${s.href}`}>
                <div className="h-full p-5">
                  <div className="flex items-center justify-center w-16 h-16 transition-all bg-gray-100 rounded-3xl group-hover:bg-primary-500">
                    <Icon icon={s.icon} style={s.iconStyles} />
                  </div>

                  <div className="mt-8 text-black">
                    <h3 className="text-lg font-medium font-heading">{s.title}</h3>
                    <h4 className="mt-5">{s.subtitle}</h4>
                  </div>

                  {s.disclaimer && (
                    <div className="mt-20 text-sm text-gray-400">
                      {s.disclaimer}
                    </div>
                  )}
                </div>

              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectScenariosType;
