import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';

import { useRouter } from 'next/router';

import { useProjectUsers } from 'hooks/project-users';
import {
  useScenarioLock, useScenarioLockMe, useSaveScenarioLock, useDeleteScenarioLock,
} from 'hooks/scenarios';

import ConfirmationPrompt from 'components/confirmation-prompt';

import LOCK_WARNING_SVG from 'svgs/notifications/lock.svg?sprite';

export interface ScenarioLockProps {
}

export const ScenarioLock: React.FC<ScenarioLockProps> = () => {
  const [lockModal, setLockModal] = useState(false);
  const [unlockModal, setUnlockModal] = useState(false);
  const [mutatting, setMutatting] = useState(false);

  const beforeunload = useRef(false);

  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectUsersData = [] } = useProjectUsers(pid);
  const {
    data: scenarioLockData,
  } = useScenarioLock(sid);
  const isLockMe = useScenarioLockMe(sid);
  const prevIsLockMe = useRef(isLockMe);

  const lockUser = useMemo(() => {
    if (!isLockMe && scenarioLockData && !!projectUsersData.length) {
      const { userId: lockUserId } = scenarioLockData;
      const { user } = projectUsersData.find((pu) => pu?.user.id === lockUserId);
      return user;
    }

    return null;
  }, [isLockMe, projectUsersData, scenarioLockData]);

  const saveScenarioLockMutation = useSaveScenarioLock({});
  const deleteScenarioLockMutation = useDeleteScenarioLock({});

  const removeScenarioLock = useCallback(() => {
    if (isLockMe) {
      deleteScenarioLockMutation.mutate({ sid: `${sid}` });
    }
  }, [isLockMe, sid, deleteScenarioLockMutation]);

  const beforeunloadScenarioLock = useCallback(() => {
    beforeunload.current = true;
    removeScenarioLock();
  }, [removeScenarioLock]);

  useEffect(() => {
    globalThis.addEventListener('beforeunload', beforeunloadScenarioLock);

    return () => {
      globalThis.removeEventListener('beforeunload', beforeunloadScenarioLock);
    };
  }, []); // eslint-disable-line

  // Create a lock if it doesn't exist when you start editing
  useEffect(() => {
    if (!mutatting && !scenarioLockData && !isLockMe && !beforeunload.current) {
      setMutatting(true);
      saveScenarioLockMutation.mutate({ sid: `${sid}` }, {
        onSettled: () => { setMutatting(false); },
      });
    }
  }, [isLockMe, scenarioLockData]); // eslint-disable-line

  // Delete a lock when you finish editing
  useLayoutEffect(() => {
    setLockModal(scenarioLockData && !isLockMe);

    return () => {
      if (isLockMe) {
        removeScenarioLock();
      }
    };
  }, [isLockMe]); // eslint-disable-line

  useLayoutEffect(() => {
    setUnlockModal(prevIsLockMe.current === false && isLockMe);
    prevIsLockMe.current = isLockMe;
  }, [isLockMe]);

  return (
    <>
      <ConfirmationPrompt
        title={`${lockUser?.displayName || lockUser?.email} is editing this scenario, and you won't be able to edit it.`}
        icon={LOCK_WARNING_SVG}
        options={{
          acceptText: 'Ok',
        }}
        open={!!lockModal && !isLockMe}
        onAccept={() => setLockModal(false)}
        onDismiss={() => setLockModal(false)}
      />

      <ConfirmationPrompt
        title="The other user left the scenario. You can now edit the scenario"
        icon={LOCK_WARNING_SVG}
        options={{
          acceptText: 'Ok',
        }}
        open={!!unlockModal}
        onAccept={() => setUnlockModal(false)}
        onDismiss={() => setUnlockModal(false)}
      />
    </>
  );
};

export default ScenarioLock;
