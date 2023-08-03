import Link from 'next/link';
import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

const ICON_RIGHT_CLASS = 'h-3 w-3 flex-shrink-0 text-gray-400';

export const Breadcrumbs = ({ className }: { className?: string }): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const projectQuery = useProject(pid);
  const scenarioQuery = useScenario(sid);

  return (
    <nav
      className={cn({
        [className]: !!className,
      })}
    >
      <ol className="flex items-center space-x-2 text-xs text-white">
        <li className="flex items-center">
          <Link href="/projects" className="hover:text-primary-500">
            Dashboard
          </Link>
        </li>
        {pid && (
          <li className="flex items-center space-x-2 overflow-hidden">
            <Icon className={ICON_RIGHT_CLASS} icon={ARROW_RIGHT_SVG} />
            <Link
              href={`/projects/${pid}`}
              className={cn({
                'truncate hover:text-primary-500': true,
                'pointer-events-none font-semibold text-primary-500': !sid,
              })}
            >
              {projectQuery.data?.name}
            </Link>
          </li>
        )}
        {sid && (
          <li className="flex items-center space-x-2 overflow-hidden">
            <Icon className={ICON_RIGHT_CLASS} icon={ARROW_RIGHT_SVG} />
            <span className="truncate font-semibold text-primary-500">
              {scenarioQuery.data?.name}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
