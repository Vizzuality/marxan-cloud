import React, { useCallback, useEffect, useState } from 'react';

import { useCookies } from 'react-cookie';

import { useRouter } from 'next/router';

import { useFeatureFlags } from 'hooks/feature-flags';

import Modal from 'components/modal';

import PlatformTransitionContent from './content';
import { isReportRoute } from './utils';

const COOKIE_NAME = 'platform-transition-2026-maintenance';
const COOKIE_EXPIRY = new Date('2026-12-31T23:59:59Z');
const MODAL_TITLE = 'Important Platform Transition Notice';
const MAINTENANCE_TITLE = 'MaPP Maintenance Mode';

export const PlatformTransitionModal = (): JSX.Element | null => {
  const { pathname } = useRouter();
  const [cookies, setCookie] = useCookies([COOKIE_NAME]);
  const { platformTransition, maintenanceMode } = useFeatureFlags();

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

  if (!mounted) return null;
  if (isReportRoute(pathname)) return null;

  // Maintenance mode: a hard, non-dismissable lock shown on every route. The
  // dismissal cookie is ignored so it cannot be cleared away. This is the
  // user-facing message; scaling the APIs to zero is the actual enforcement.
  if (maintenanceMode) {
    return (
      <Modal
        id="maintenance-mode"
        title={MAINTENANCE_TITLE}
        open
        dismissable={false}
        size="default"
        onDismiss={() => undefined}
      >
        <PlatformTransitionContent maintenance />
      </Modal>
    );
  }

  // Pre-maintenance informational notice: dismissable and remembers dismissal.
  if (!platformTransition) return null;
  if (persistedDismissal) return null;
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
