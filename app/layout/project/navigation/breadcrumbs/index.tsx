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
    <nav className="max-w-full" aria-label="Breadcrumb">
      <ol
        className={cn({
          'flex items-center space-x-2 text-xs text-white': true,
          [className]: !!className,
        })}
      >
        <li className="flex items-center">
          <Link
            href="/projects"
            className={cn({
              'hover:text-primary-500': true,
              'font-semibold text-primary-500': pathname === '/projects',
            })}
          >
            Dashboard
          </Link>
        </li>

        {pid && (
          <li className="flex items-center overflow-hidden">
            <Icon className="mb-0.5 h-2 w-2 flex-shrink-0 text-gray-400" icon={ARROW_RIGHT_SVG} />

            <Link
              href={`/projects/${pid}`}
              className={cn({
                'ml-2 truncate  hover:text-primary-500': true,
                'font-semibold text-primary-500': pathname === '/projects/[pid]',
              })}
            >
              {projectQuery.data?.name}
            </Link>
          </li>
        )}
        {sid && (
          <li className="flex items-center overflow-hidden">
            <Icon className="mb-0.5 h-2 w-2 flex-shrink-0 text-gray-400" icon={ARROW_RIGHT_SVG} />
            <div
              className={cn({
                'ml-2 truncate ': true,
                'font-semibold text-primary-500':
                  pathname === '/projects/[pid]/scenarios/[sid]/edit',
              })}
            >
              {scenarioQuery.data?.name}
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
