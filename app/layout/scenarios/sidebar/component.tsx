import React, { PropsWithChildren } from 'react';

import { AnimatePresence } from 'framer-motion';

import Breadcrumbs from 'layout/project/navigation/breadcrumbs';
import { cn } from 'utils/cn';

export const ScenariosEditSidebar = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <div
      className={cn({
        'flex w-full flex-grow flex-col overflow-hidden': true,
      })}
    >
      <Breadcrumbs />
      <div className="mt-2.5 flex flex-grow flex-col overflow-hidden">
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>
  );
};

export default ScenariosEditSidebar;
