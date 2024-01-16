import { PropsWithChildren } from 'react';

import Navigation from 'layout/project/navigation';
import { cn } from 'utils/cn';

export const ProjectLayout = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>): JSX.Element => {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      {children && (
        <main
          className={cn({
            'flex h-screen w-screen': true,
            [className]: !!className,
          })}
        >
          {children}
        </main>
      )}
    </div>
  );
};

export default ProjectLayout;
