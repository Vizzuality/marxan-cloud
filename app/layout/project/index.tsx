import { PropsWithChildren } from 'react';

import Sidebar from 'layout/sidebar';
import { cn } from 'utils/cn';

export const ProjectLayout = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>): JSX.Element => {
  return (
    <div
      className={cn({
        flex: true,
        [className]: !!className,
      })}
    >
      <Sidebar />
      {children}
    </div>
  );
};

export default ProjectLayout;
