import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import cx from 'classnames';

import Icon from 'components/icon';

import { SCENARIO_TYPES } from './constants';

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
