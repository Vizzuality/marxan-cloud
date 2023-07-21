import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import { SCENARIO_TYPES } from './constants';

const ProjectScenariosType = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  return (
    <div className="px-10 py-5 text-gray-500">
      <h2 className="font-heading text-2xl font-medium">Choose scenario type:</h2>

      <ul className="-mx-5 my-5 grid grid-cols-3 gap-10">
        {SCENARIO_TYPES.map((s) => {
          return (
            <li
              key={`${s.id}`}
              className={cn({
                'group cursor-pointer rounded-3xl border-2 border-transparent transition-all hover:border-gray-100 hover:shadow-2xl':
                  true,
                'pointer-events-none opacity-25': s.disabled,
              })}
            >
              <Link href={`/projects/${pid}${s.href}`} legacyBehavior>
                <div className="h-full p-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 transition-all group-hover:bg-primary-500">
                    <Icon icon={s.icon} style={s.iconStyles} />
                  </div>

                  <div className="mt-8 text-black">
                    <h3 className="font-heading text-lg font-medium">{s.title}</h3>
                    <h4 className="mt-5">{s.subtitle}</h4>
                  </div>

                  {s.disclaimer && (
                    <div className="mt-20 text-sm text-gray-400">{s.disclaimer}</div>
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
