import Link from 'next/link';
import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

export const Breadcrumbs = ({ className }: { className?: string }): JSX.Element => {
  const { pathname, query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const projectQuery = useProject(pid);
  const scenarioQuery = useScenario(sid);

  return (
    <nav className="flex text-xs text-white" aria-label="Breadcrumb">
      <ol
        className={cn({
          'flex items-center space-x-2': true,
          [className]: !!className,
        })}
      >
        <li>
          <Link
            href="/projects"
            className={cn({
              'flex h-6 items-center overflow-hidden hover:text-primary-500 focus:outline-none':
                true,
              'font-semibold text-primary-500': pathname === '/projects',
            })}
          >
            Dashboard
          </Link>
        </li>
        {pid && (
          <li>
            <div className="flex max-w-[220px] items-center">
              <Icon className="mb-0.5 h-2 w-2 flex-shrink-0 text-gray-400" icon={ARROW_RIGHT_SVG} />

              <Link
                href={`/projects/${pid}`}
                className={cn({
                  'ml-2 overflow-hidden overflow-ellipsis whitespace-nowrap hover:text-primary-500':
                    true,
                  'font-semibold text-primary-500': pathname === '/projects/[pid]',
                })}
              >
                {projectQuery.data?.name}
              </Link>
            </div>
          </li>
        )}
        {sid && (
          <li>
            <div className="flex max-w-[200px] items-center">
              <Icon className="mb-0.5 h-2 w-2 flex-shrink-0 text-gray-400" icon={ARROW_RIGHT_SVG} />
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
