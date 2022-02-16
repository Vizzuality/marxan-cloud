import React, { useEffect, useLayoutEffect } from 'react';

import { useRouter } from 'next/router';

import {
  useDeleteScenarioLock, useSaveScenarioLock, useScenarioLock, useScenarioLockMe,
} from 'hooks/scenarios';

export interface ScenarioLockProps {
}

export const ScenarioLock: React.FC<ScenarioLockProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const {
    data: scenarioLockData,
  } = useScenarioLock(sid);
  const isLockMe = useScenarioLockMe(sid);
  const saveScenarioLockMutation = useSaveScenarioLock({});
  const deleteScenarioLockMutation = useDeleteScenarioLock({});

  // Create a lock if it doesn't exist when you start editing
  useEffect(() => {
    if (!scenarioLockData) {
      saveScenarioLockMutation.mutate({ sid: `${sid}` });
    }
  }, []); // eslint-disable-line

  // Delete a lock when you finish editing
  useLayoutEffect(() => {
    return () => {
      if (isLockMe) {
        deleteScenarioLockMutation.mutate({ sid: `${sid}` });
      }
    };
  }, [isLockMe]); // eslint-disable-line

  return null;
};

export default ScenarioLock;
