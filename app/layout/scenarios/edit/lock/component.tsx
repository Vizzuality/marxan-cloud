import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useRouter } from 'next/router';

import {
  useDeleteScenarioLock, useSaveScenarioLock, useScenarioLock, useScenarioLockMe,
} from 'hooks/scenarios';

import ConfirmationPrompt from 'components/confirmation-prompt';

import LOCK_WARNING_SVG from 'svgs/notifications/lock.svg?sprite';

export interface ScenarioLockProps {
}

export const ScenarioLock: React.FC<ScenarioLockProps> = () => {
  const [modal, setModal] = useState(false);
  const [mutatting, setMutatting] = useState(false);
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
    if (!mutatting && !scenarioLockData) {
      setMutatting(true);
      saveScenarioLockMutation.mutate({ sid: `${sid}` }, {
        onSettled: () => { setMutatting(false); },
      });
    }
  }, [scenarioLockData]); // eslint-disable-line

  // Delete a lock when you finish editing
  useLayoutEffect(() => {
    setModal(!isLockMe);

    return () => {
      if (isLockMe) {
        deleteScenarioLockMutation.mutate({ sid: `${sid}` });
      }
    };
  }, [isLockMe]); // eslint-disable-line

  return (
    <ConfirmationPrompt
      title={'Another team member is editing this scenario, and you won\'t be able to edit it.'}
      icon={LOCK_WARNING_SVG}
      options={{
        acceptText: 'Ok',
      }}
      open={!!modal && !isLockMe}
      onAccept={() => setModal(false)}
      onDismiss={() => setModal(false)}
    />

  );
};

export default ScenarioLock;
