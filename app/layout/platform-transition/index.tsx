import React, { useCallback, useEffect, useState } from 'react';

import { useCookies } from 'react-cookie';

import { useRouter } from 'next/router';

import { useFeatureFlags } from 'hooks/feature-flags';

import Modal from 'components/modal';

import PlatformTransitionContent from './content';
import { isReportRoute } from './utils';

const COOKIE_NAME = 'platform-transition';
const COOKIE_EXPIRY = new Date('2026-12-31T23:59:59Z');
const MODAL_TITLE = 'Important Platform Transition Notice';

export const PlatformTransitionModal = (): JSX.Element | null => {
  const { pathname } = useRouter();
  const [cookies, setCookie] = useCookies([COOKIE_NAME]);
  const { platformTransition } = useFeatureFlags();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const persistedDismissal = cookies[COOKIE_NAME] === 'true';
  const [open, setOpen] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const onDismiss = useCallback(() => {
    if (dontShowAgain) {
      setCookie(COOKIE_NAME, 'true', {
        path: '/',
        expires: COOKIE_EXPIRY,
      });
    }
    setOpen(false);
  }, [dontShowAgain, setCookie]);

  if (isReportRoute(pathname)) return null;
  if (!platformTransition) return null;
  if (persistedDismissal) return null;
  if (!mounted) return null;
  if (!open) return null;

  return (
    <Modal
      id="platform-transition"
      title={MODAL_TITLE}
      open
      dismissable
      size="default"
      onDismiss={onDismiss}
    >
      <PlatformTransitionContent
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
      />
    </Modal>
  );
};

export default PlatformTransitionModal;
