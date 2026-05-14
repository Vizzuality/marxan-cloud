import React, { useCallback, useEffect, useState } from 'react';

import { useCookies } from 'react-cookie';

import { useFeatureFlags } from 'hooks/feature-flags';

import Modal from 'components/modal';

import PlatformTransitionContent from './content';

const COOKIE_NAME = 'platform-transition';
const COOKIE_EXPIRY = new Date('2026-12-31T23:59:59Z');
const MODAL_TITLE = 'Important Platform Transition Notice';

export const PlatformTransitionModal = (): JSX.Element | null => {
  const [cookies, setCookie] = useCookies([COOKIE_NAME]);
  const { platformTransition } = useFeatureFlags();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const dismissed = cookies[COOKIE_NAME] === 'true';

  const onDismiss = useCallback(() => {
    setCookie(COOKIE_NAME, 'true', {
      path: '/',
      expires: COOKIE_EXPIRY,
    });
  }, [setCookie]);

  if (!platformTransition) return null;
  if (dismissed) return null;
  if (!mounted) return null;

  return (
    <Modal
      id="platform-transition"
      title={MODAL_TITLE}
      open
      dismissable
      size="default"
      onDismiss={onDismiss}
    >
      <PlatformTransitionContent />
    </Modal>
  );
};

export default PlatformTransitionModal;
