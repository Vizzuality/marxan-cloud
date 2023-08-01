import React from 'react';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

import { cn } from 'utils/cn';

export const Breadcrumbs = ({ className }: { className?: string }): JSX.Element => {
  const { pathname, push, query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const projectQuery = useProject(pid);
  const scenarioQuery = useScenario(sid);

  return (
    <nav className="flex font-sans text-xs text-white" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <button
            onClick={() => push('/projects')}
            className={cn({
              'flex h-6 items-center overflow-hidden hover:text-primary-500 focus:outline-none':
                true,
              'font-semibold text-primary-500': pathname === '/projects',
              [className]: !!className,
            })}
          >
            Dashboard
          </button>
        </li>
        {pid && (
          <li>
            <div className="flex max-w-[220px] items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clip-rule="evenodd"
                />
              </svg>

              <button
                onClick={() => push(`/projects/${pid}`)}
                className={cn({
                  'ml-2 overflow-hidden overflow-ellipsis whitespace-nowrap hover:text-primary-500':
                    true,
                  'font-semibold text-primary-500': pathname === '/projects/[pid]',
                })}
              >
                {projectQuery.data?.name}
              </button>
            </div>
          </li>
        )}
        {sid && (
          <li>
            <div className="flex max-w-[200px] items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clip-rule="evenodd"
                />
              </svg>
              <div
                className={cn({
                  'ml-2 overflow-hidden overflow-ellipsis whitespace-nowrap': true,
                  'font-semibold text-primary-500':
                    pathname === '/projects/[pid]/scenarios/[sid]/edit',
                })}
              >
                {scenarioQuery.data?.name}
              </div>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
