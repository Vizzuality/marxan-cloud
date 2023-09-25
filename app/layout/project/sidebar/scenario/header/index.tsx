import { ComponentProps, useCallback } from 'react';

import { useRouter } from 'next/router';

import { useSaveScenario, useScenario } from 'hooks/scenarios';

import Title from 'layout/project/sidebar/header/title';

export const ScenarioHeader = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioQuery = useScenario(sid);
  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { name, description } = scenarioQuery.data;

  const onEditScenarioName = useCallback(
    (newName: Parameters<ComponentProps<typeof Title>['onEditTitle']>[0]) => {
      saveScenarioMutation.mutate({
        id: sid,
        data: {
          name: newName,
        },
      });
    },
    [saveScenarioMutation, sid]
  );

  return <Title title={name} description={description} onEditTitle={onEditScenarioName} />;
};

export default ScenarioHeader;
