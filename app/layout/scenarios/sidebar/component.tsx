import React from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence } from 'framer-motion';

import { useProject } from 'hooks/projects';

import Breadcrumb from 'components/breadcrumb';
import { cn } from 'utils/cn';

export const ScenariosEditSidebar = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element => {
  const { push, query } = useRouter();
  const { pid } = query as { pid: string };

  const { data = {} } = useProject(pid);

  const { id, name } = data;

  return (
    <div
      className={cn({
        'flex w-full flex-grow flex-col overflow-hidden': true,
      })}
    >
      <Breadcrumb
        className="flex-shrink-0"
        onClick={() => {
          push(`/projects/${id}`);
        }}
      >
        Back to project &quot;
        {name}
        &quot;
      </Breadcrumb>

      <div className="mt-2.5 flex flex-grow flex-col overflow-hidden">
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>
  );
};

export default ScenariosEditSidebar;
