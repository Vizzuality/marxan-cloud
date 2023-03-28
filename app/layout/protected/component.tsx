import React, { useEffect, useState, PropsWithChildren } from 'react';

import { useSession, signOut } from 'next-auth/client';

import { useMe } from 'hooks/me';

import GuideRequest from 'layout/guide-request';

import Modal from 'components/modal';

// const TIME_INTERVAL = 1000 * 60 * 10; // 10 min
// const SESSION_BUFFER_TIME = 30 * 60 * 1000; // 30 min

const Protected = ({ children }: PropsWithChildren) => {
  const { user } = useMe();
  const [session, loading] = useSession();
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const { id: userId } = user;
    const helpUser = window.localStorage.getItem(`help-${userId}`);

    if (!helpUser) {
      setModal(true);
    }
  }, [user, session]);

  // Not display anything when session request is on progress
  if (loading) return null;

  // Redirect when session doesn't exist
  if (!loading && (!session || !user?.id)) {
    signOut();
    return null;
  }

  return (
    <>
      {children}

      <Modal
        dismissable={false}
        title="Hello"
        open={modal}
        size="narrow"
        onDismiss={() => setModal(false)}
      >
        <GuideRequest />
      </Modal>
    </>
  );
};

export default Protected;
