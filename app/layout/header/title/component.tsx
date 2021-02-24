import React from 'react';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useRouter } from 'next/router';
import { useTransition, animated } from 'react-spring';

export interface TitleProps {
}

export const Title: React.FC<TitleProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;
  const { data: projectData, isLoading: projectIsLoading } = useProject(pid);
  const { data: scenarioData, isLoading: scenarioIsLoading } = useScenario(sid);

  const transitions = useTransition(!projectIsLoading && !scenarioIsLoading, null, {
    from: { opacity: 0, transform: 'translateY(-5px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-5px)' },
  });

  return (
    <>
      {transitions.map(({ item, key, props }) => item && (
        <animated.div key={key} style={props} className="flex divide-x">
          {projectData?.name && (
            <h1 className="font-medium font-heading px-2.5">{projectData.name}</h1>
          )}

          {scenarioData?.name && (
            <h1 className="font-medium font-heading px-2.5 opacity-50">{scenarioData.name}</h1>
          )}
        </animated.div>
      ))}
    </>
  );
};

export default Title;
